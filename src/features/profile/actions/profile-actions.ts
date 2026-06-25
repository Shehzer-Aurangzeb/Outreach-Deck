"use server";

import { prisma } from "@/lib/prisma";
import { createClient, requireUser } from "@/lib/supabase/server";

import { profileFormSchema, type ProfileFormInput } from "../schema";
import type { Profile } from "../types";

const CV_BUCKET = "cvs";

export async function getProfile(): Promise<Profile | null> {
  const user = await requireUser();

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  return profile;
}

export async function hasProfile(): Promise<boolean> {
  const user = await requireUser();

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  return profile !== null;
}

interface SaveProfileOptions {
  cvFile?: {
    url: string;
    name: string;
  };
}

export async function saveProfile(
  input: ProfileFormInput,
  options?: SaveProfileOptions
): Promise<{ profile: Profile } | { error: string }> {
  const user = await requireUser();

  const parsed = profileFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const cvData = options?.cvFile
      ? {
          cvFileUrl: options.cvFile.url,
          cvFileName: options.cvFile.name,
          cvUploadedAt: new Date(),
        }
      : {};

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...parsed.data,
        ...cvData,
      },
      update: {
        ...parsed.data,
        ...cvData,
      },
    });

    return { profile };
  } catch (err) {
    console.error("Save profile error:", err);
    return { error: "Failed to save profile" };
  }
}

export async function uploadCv(
  formData: FormData
): Promise<{ url: string; fileName: string } | { error: string }> {
  const user = await requireUser();
  const supabase = await createClient();

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return { error: "No file provided" };
  }

  if (file.type !== "application/pdf") {
    return { error: "Only PDF files are supported" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "File must be under 5MB" };
  }

  const fileName = `${user.id}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(CV_BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("CV upload error:", uploadError);
    return { error: "Failed to upload CV" };
  }

  const { data: urlData } = supabase.storage
    .from(CV_BUCKET)
    .getPublicUrl(fileName);

  return {
    url: urlData.publicUrl,
    fileName: file.name,
  };
}

export async function getCvDownloadUrl(): Promise<{ url: string } | { error: string }> {
  const user = await requireUser();
  const supabase = await createClient();

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { cvFileUrl: true },
  });

  if (!profile?.cvFileUrl) {
    return { error: "No CV on file" };
  }

  // Extract the path from the public URL
  const urlParts = profile.cvFileUrl.split(`/storage/v1/object/public/${CV_BUCKET}/`);
  const filePath = urlParts[1];

  if (!filePath) {
    return { error: "Invalid CV URL" };
  }

  const { data, error } = await supabase.storage
    .from(CV_BUCKET)
    .createSignedUrl(filePath, 60); // 60 second expiry

  if (error || !data?.signedUrl) {
    console.error("CV download URL error:", error);
    return { error: "Failed to generate download link" };
  }

  return { url: data.signedUrl };
}
