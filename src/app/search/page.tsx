"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search as SearchIcon, Loader2, X } from "lucide-react";
import PostCard from "@/components/ui/PostCard";

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

interface Pagination {
  page: number;
  total: number;
  totalPages: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQuery);

  const search = useCallback(
    async (q: string, page = 1) => {
      if (!q.trim()) return;
      setLoading(true);
      setSearched(true);

      try {
        const res = await fetch(
          `/api/posts?search=${encodeURIComponent(q.trim())}&page=${page}&limit=10`
        );
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts);
          setPagination(data.pagination);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Run search on mount if query param exists
  useEffect(() => {
    if (initialQuery) {
      search(initialQuery);
    }
  }, [initialQuery, search]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    search(query);
  }

  function handleClear() {
    setQuery("");
    setPosts([]);
    setPagination(null);
    setSearched(false);
    router.push("/search");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">Search</h1>
      <p className="text-muted mb-8">
        Find stories, ideas, and inspiration across InkFlow.
      </p>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="relative mb-8">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts by title or content..."
              className="w-full pl-12 pr-10 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length > 0 ? (
        <>
          <p className="text-sm text-muted mb-4">
            {pagination?.total} result{pagination?.total !== 1 ? "s" : ""} for &ldquo;{initialQuery || query}&rdquo;
          </p>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} variant="standard" />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {pagination.page > 1 && (
                <button
                  onClick={() => search(query, pagination.page - 1)}
                  className="px-4 py-2 text-sm font-medium bg-white border border-border rounded-full hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
              <span className="px-4 py-2 text-sm text-muted">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              {pagination.page < pagination.totalPages && (
                <button
                  onClick={() => search(query, pagination.page + 1)}
                  className="px-4 py-2 text-sm font-medium bg-white border border-border rounded-full hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </>
      ) : searched ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <SearchIcon className="h-12 w-12 mx-auto text-muted/30 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No results found
          </h2>
          <p className="text-sm text-muted">
            Try different keywords or check your spelling.
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <SearchIcon className="h-12 w-12 mx-auto text-muted/30 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Start searching
          </h2>
          <p className="text-sm text-muted">
            Enter a keyword to find stories on InkFlow.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
