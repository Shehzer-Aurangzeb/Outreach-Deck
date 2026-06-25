import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import pdfParse from "pdf-parse";

import { anthropic, MODEL } from "@/lib/anthropic";
import { requireUser } from "@/lib/supabase/server";
import { parsedCvSchema } from "@/features/profile/schema";

const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_TEXT_LENGTH = 50;

const CV_PARSE_PROMPT = `You extract structured information from a CV/resume or LinkedIn profile text. You are a parser, not a writer or an inferrer.

Extract these fields. Output ONLY valid JSON with these exact keys:
- name: full name
- role: their current or most recent job title, exactly as stated
- location: their location if stated (city, country/region)
- stack: their technical skills / tech stack, as a comma-separated string, only skills actually listed
- experience: If the CV explicitly states years of experience, use it. If not but it contains dated roles, calculate an approximate total and format as "~N years". If there are no dates and no explicit statement to derive from, return "" — never estimate or invent a number.
- education: most recent/relevant education as stated
- summary: a 1-2 sentence positioning line ONLY if the CV contains a summary/objective to base it on; otherwise ""

Rules:
- Extract ONLY what is explicitly present. NEVER guess, infer, or fabricate names, roles, employers, skills, education, or dates.
- The ONE exception: for experience, you MAY calculate total years from dated employment history — that is arithmetic on stated facts, not a guess.
- If a field is not present (or for experience, not derivable from dates), return an empty string "". Do NOT write "Not specified". Empty is correct; the user will fill gaps themselves.
- Output ONLY the JSON object — no markdown, no code fences, no commentary.`;

async function extractCvText(request: NextRequest): Promise<string> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      throw new Error("No file uploaded");
    }

    if (file.type !== "application/pdf") {
      throw new Error("Only PDF files are supported");
    }

    if (file.size > MAX_PDF_SIZE) {
      throw new Error("PDF file must be under 5MB");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text.trim();

    if (text.length < MIN_TEXT_LENGTH) {
      throw new Error("Could not extract enough text from PDF. The file may be image-based or corrupted.");
    }

    return text;
  }

  const body = await request.json();
  const cvText = body.cvText;

  if (typeof cvText !== "string" || cvText.length < MIN_TEXT_LENGTH) {
    throw new Error("CV text must be at least 50 characters");
  }

  return cvText;
}

async function parseWithClaude(cvText: string) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: CV_PARSE_PROMPT,
    messages: [
      {
        role: "user",
        content: `Parse this CV/profile text:\n\n${cvText}`,
      },
    ],
  });

  const rawText = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  // Strip markdown code fences if present
  const jsonText = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsedCv: unknown;
  try {
    parsedCv = JSON.parse(jsonText);
  } catch {
    console.error("Failed to parse CV JSON:", jsonText);
    throw new Error("AI returned invalid format - please try again or fill manually");
  }

  const validated = parsedCvSchema.safeParse(parsedCv);
  if (!validated.success) {
    console.error("CV parse validation failed:", validated.error);
    throw new Error("Could not extract all profile fields - please review and fill missing data");
  }

  return validated.data;
}

export async function POST(request: NextRequest) {
  try {
    await requireUser();
    const cvText = await extractCvText(request);
    const parsed = await parseWithClaude(cvText);

    return NextResponse.json({ parsed });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("CV parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse CV" },
      { status: 500 }
    );
  }
}
