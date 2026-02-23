"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  userId: string;
  size?: "sm" | "md";
}

export default function FollowButton({ userId, size = "sm" }: FollowButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  // Don't show button for own profile
  const isOwnProfile = session?.user?.id === userId;

  useEffect(() => {
    if (status !== "authenticated" || isOwnProfile) return;

    async function checkFollow() {
      try {
        const res = await fetch(`/api/users/${userId}/follow`);
        if (res.ok) {
          const data = await res.json();
          setFollowing(data.following);
        }
      } catch {
        // Silently fail
      } finally {
        setChecked(true);
      }
    }
    checkFollow();
  }, [userId, status, isOwnProfile]);

  async function handleFollow() {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  if (isOwnProfile) return null;

  // Don't render until we've checked status (avoid flash)
  if (status === "authenticated" && !checked) return null;

  const sizeClasses =
    size === "sm"
      ? "px-3 py-1 text-xs"
      : "px-4 py-2 text-sm";

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`${sizeClasses} font-medium rounded-full transition-colors disabled:opacity-50 ${
        following
          ? "bg-gray-100 text-muted hover:bg-gray-200 hover:text-foreground"
          : "bg-primary text-white hover:bg-primary-hover"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
