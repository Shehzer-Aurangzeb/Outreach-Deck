import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { MOCK_PROFILE, USE_MOCK_DATA } from "@/lib/mock-data";

import type { ParsedCv, ProfileFormInput } from "../schema";
import type { Profile } from "../types";
import { getProfile, saveProfile, uploadCv, getCvDownloadUrl } from "../actions/profile-actions";
import { profileKeys } from "../keys";

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: () => (USE_MOCK_DATA ? Promise.resolve(MOCK_PROFILE) : getProfile()),
    staleTime: 1000 * 60 * 5,
  });
}

interface SaveProfileInput {
  data: ProfileFormInput;
  cvFile?: { url: string; name: string };
}

export function useSaveProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, cvFile }: SaveProfileInput) => {
      // Mock mode: return mock profile, no server call
      if (USE_MOCK_DATA) {
        return MOCK_PROFILE;
      }
      const result = await saveProfile(data, cvFile ? { cvFile } : undefined);
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result.profile;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData<Profile>(profileKeys.detail(), profile);
    },
  });
}


export function useUploadCv() {
  return useMutation({
    mutationFn: async (file: File) => {
      // Mock mode: no-op
      if (USE_MOCK_DATA) {
        return { url: "mock://cv.pdf", fileName: file.name };
      }
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadCv(formData);
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
  });
}

export function useDownloadCv() {
  return useMutation({
    mutationFn: async () => {
      // Mock mode: no-op
      if (USE_MOCK_DATA) {
        return "mock://cv.pdf";
      }
      const result = await getCvDownloadUrl();
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result.url;
    },
  });
}

export function useParseCv() {
  return useMutation({
    mutationFn: async (cvText: string): Promise<ParsedCv> => {
      // Mock mode: return mock profile data
      if (USE_MOCK_DATA) {
        return {
          name: MOCK_PROFILE.name,
          role: MOCK_PROFILE.role,
          location: MOCK_PROFILE.location,
          stack: MOCK_PROFILE.stack,
          experience: MOCK_PROFILE.experience,
          education: MOCK_PROFILE.education,
          summary: MOCK_PROFILE.summary ?? "",
        };
      }
      const response = await fetch("/api/parse-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to parse CV");
      }

      const data = await response.json();
      return data.parsed;
    },
  });
}


export function useParsePdf() {
  return useMutation({
    mutationFn: async (file: File): Promise<ParsedCv> => {
      // Mock mode: return mock profile data
      if (USE_MOCK_DATA) {
        return {
          name: MOCK_PROFILE.name,
          role: MOCK_PROFILE.role,
          location: MOCK_PROFILE.location,
          stack: MOCK_PROFILE.stack,
          experience: MOCK_PROFILE.experience,
          education: MOCK_PROFILE.education,
          summary: MOCK_PROFILE.summary ?? "",
        };
      }
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-cv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to parse PDF");
      }

      const data = await response.json();
      return data.parsed;
    },
  });
}
