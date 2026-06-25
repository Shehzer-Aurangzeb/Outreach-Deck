import Anthropic from "@anthropic-ai/sdk";

// Server-only Anthropic client
// NEVER import this file into client components

if (typeof window !== "undefined") {
  throw new Error(
    "Anthropic client must only be used server-side. " +
      "Never import @/lib/anthropic in client components."
  );
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODEL = "claude-haiku-4-5";
export const MAX_TOKENS = 400;
