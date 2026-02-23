"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bookmark, Loader2 } from "lucide-react";
import PostCard from "@/components/ui/PostCard";

interface BookmarkPost {
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

export default function BookmarksPage() {
  const { status } = useSession();
  const [posts, setPosts] = useState<BookmarkPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchBookmarks() {
      try {
        const res = await fetch("/api/bookmarks");
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts);
        }
      } catch {
        // Silently fail — show empty state
      } finally {
        setLoading(false);
      }
    }
    fetchBookmarks();
  }, [status]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">Bookmarks</h1>
      <p className="text-muted mb-8">Your saved stories for later reading.</p>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} variant="standard" />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Bookmark className="h-12 w-12 mx-auto text-muted/30 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No bookmarks yet
          </h2>
          <p className="text-sm text-muted">
            Save stories to read them later. Click the bookmark icon on any post.
          </p>
        </div>
      )}
    </div>
  );
}
