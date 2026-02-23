"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Send } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: string | Date;
  author: {
    id: string;
    name: string;
    image?: string | null;
  };
}

interface PostCommentsProps {
  postId: string;
  initialComments: Comment[];
}

export default function PostComments({
  postId,
  initialComments,
}: PostCommentsProps) {
  const { status } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    const content = newComment.trim();
    if (!content || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [data.comment, ...prev]);
        setNewComment("");
      }
    } catch {
      // Silently fail
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="comments" className="mt-8">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Comments ({comments.length})
      </h2>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                status === "authenticated"
                  ? "Share your thoughts..."
                  : "Sign in to leave a comment"
              }
              disabled={status !== "authenticated"}
              rows={3}
              className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
          </div>
        </div>
        {status === "authenticated" && (
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        )}
      </form>

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 p-4 bg-card rounded-xl border border-border"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                {comment.author.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {comment.author.name}
                  </span>
                  <span className="text-xs text-muted">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted text-center py-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}
    </div>
  );
}
