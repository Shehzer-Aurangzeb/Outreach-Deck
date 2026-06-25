"use client";

import { useState } from "react";

import { useProfile } from "../hooks/use-profile";
import { ProfileSetup } from "./profile-setup";
import { ProfileSkeleton } from "./profile-skeleton";
import { ProfileView, type CvUploadData } from "./profile-view";

export function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [cvUploadData, setCvUploadData] = useState<CvUploadData | null>(null);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // No profile → show setup wizard
  if (!profile) {
    return <ProfileSetup />;
  }

  // Has profile but editing → show setup wizard with pre-filled data
  if (isEditing) {
    return (
      <ProfileSetup
        existingProfile={profile}
        uploadedCvData={cvUploadData ?? undefined}
        onCancel={() => {
          setIsEditing(false);
          setCvUploadData(null);
        }}
      />
    );
  }

  // Has profile → show profile view
  return (
    <ProfileView
      profile={profile}
      onEdit={() => setIsEditing(true)}
      onEditWithCv={(data) => {
        setCvUploadData(data);
        setIsEditing(true);
      }}
    />
  );
}
