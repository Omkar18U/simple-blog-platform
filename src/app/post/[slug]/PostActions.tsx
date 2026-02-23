"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Bookmark, Pencil, Trash2 } from "lucide-react";

interface PostActionsProps {
  postId: string;
  authorId: string;
  postSlug: string;
  likesCount: number;
  commentsCount: number;
}

export default function PostActions({
  postId,
  authorId,
  postSlug,
  likesCount,
  commentsCount,
}: PostActionsProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isOwner = session?.user?.id === authorId;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  const canManage = isOwner || isAdmin;
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likes, setLikes] = useState(likesCount);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fetch initial like/bookmark status
  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/posts/${postId}/status`);
        if (res.ok) {
          const data = await res.json();
          setLiked(data.liked);
          setBookmarked(data.bookmarked);
        }
      } catch {
        // Silently fail
      }
    }
    fetchStatus();
  }, [postId, status]);

  async function handleLike() {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikes((prev) => (data.liked ? prev + 1 : prev - 1));
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleBookmark() {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/posts/${postId}/bookmark`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        alert("Failed to delete post");
        setDeleting(false);
        setConfirmDelete(false);
      }
    } catch {
      alert("Something went wrong");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between py-4 border-t border-b border-border">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            disabled={loading}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              liked ? "text-error" : "text-muted hover:text-error"
            }`}
          >
            <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
            <span>{likes}</span>
          </button>
          <a
            href="#comments"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{commentsCount}</span>
          </a>
        </div>

        <div className="flex items-center gap-3">
          {/* Edit / Delete — only for author or admin */}
          {canManage && (
            <>
              <button
                onClick={() => router.push(`/write?edit=${postSlug}`)}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors"
                title="Edit post"
              >
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  confirmDelete
                    ? "text-error font-medium"
                    : "text-muted hover:text-error"
                }`}
                title={confirmDelete ? "Click again to confirm" : "Delete post"}
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {deleting ? "Deleting…" : confirmDelete ? "Confirm?" : "Delete"}
                </span>
              </button>
              {confirmDelete && (
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              )}
            </>
          )}

          <button
            onClick={handleBookmark}
            disabled={loading}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              bookmarked ? "text-primary" : "text-muted hover:text-primary"
            }`}
          >
            <Bookmark className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`} />
            <span>{bookmarked ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>
    </>
  );
}
