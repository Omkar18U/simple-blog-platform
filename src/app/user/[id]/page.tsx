"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Calendar, FileText, Users, UserPlus, Loader2 } from "lucide-react";
import PostCard from "@/components/ui/PostCard";
import FollowButton from "@/components/ui/FollowButton";
import { formatDate } from "@/lib/utils";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  bio: string | null;
  createdAt: string;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
}

interface PostData {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  readTime: number;
  createdAt: string;
  author: { id: string; name: string; image?: string | null };
  tags?: { tag: { id: string; name: string; color: string } }[];
  _count?: { likes: number; comments: number; bookmarks: number };
}

export default function UserProfilePage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    async function load() {
      const { id } = await paramsPromise;
      setUserId(id);

      try {
        const res = await fetch(`/api/users/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          setPosts(data.posts);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [paramsPromise]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          User not found
        </h1>
        <p className="text-muted">This user doesn&apos;t exist or has been removed.</p>
      </div>
    );
  }

  const isOwnProfile = session?.user?.id === userId;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile header */}
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl shrink-0">
            {profile.name.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {profile.name}
                </h1>
              </div>
              {!isOwnProfile && userId && (
                <FollowButton userId={userId} size="md" />
              )}
            </div>

            {profile.bio && (
              <p className="text-sm text-foreground/80 mt-3">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex items-center flex-wrap gap-4 sm:gap-6 mt-4">
              <div className="flex items-center gap-1.5 text-sm text-muted">
                <FileText className="h-4 w-4" />
                <span>
                  <strong className="text-foreground">{profile._count.posts}</strong>{" "}
                  posts
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted">
                <Users className="h-4 w-4" />
                <span>
                  <strong className="text-foreground">{profile._count.followers}</strong>{" "}
                  followers
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted">
                <UserPlus className="h-4 w-4" />
                <span>
                  <strong className="text-foreground">{profile._count.following}</strong>{" "}
                  following
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Published Posts */}
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Published Posts
      </h2>

      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} variant="standard" />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No posts yet
          </h3>
          <p className="text-sm text-muted">
            This author hasn&apos;t published any stories yet.
          </p>
        </div>
      )}
    </div>
  );
}
