import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PostCard from "@/components/ui/PostCard";
import TagPill from "@/components/ui/TagPill";
import TopAuthors from "@/components/ui/TopAuthors";
import { prisma } from "@/lib/prisma";

async function getHomeData() {
  try {
    const [featuredPosts, standardPosts, trendingPosts, popularTags, topAuthors] =
      await Promise.all([
        prisma.post.findMany({
          where: { status: "PUBLISHED" },
          include: {
            author: { select: { id: true, name: true, image: true } },
            tags: { include: { tag: true } },
            _count: { select: { likes: true, comments: true, bookmarks: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 3,
        }),
        prisma.post.findMany({
          where: { status: "PUBLISHED" },
          include: {
            author: { select: { id: true, name: true, image: true } },
            tags: { include: { tag: true } },
            _count: { select: { likes: true, comments: true, bookmarks: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: 3,
          take: 4,
        }),
        prisma.post.findMany({
          where: { status: "PUBLISHED" },
          include: {
            author: { select: { id: true, name: true, image: true } },
            _count: { select: { likes: true, comments: true, bookmarks: true } },
          },
          orderBy: { views: "desc" },
          take: 4,
        }),
        prisma.tag.findMany({
          include: { _count: { select: { posts: true } } },
          orderBy: { posts: { _count: "desc" } },
          take: 6,
        }),
        prisma.user.findMany({
          select: {
            id: true,
            name: true,
            image: true,
            createdAt: true,
            _count: { select: { posts: true, followers: true } },
          },
          orderBy: { followers: { _count: "desc" } },
          take: 3,
        }),
      ]);

    return { featuredPosts, standardPosts, trendingPosts, popularTags, topAuthors };
  } catch {
    // Fallback to empty arrays if DB is not available
    return {
      featuredPosts: [],
      standardPosts: [],
      trendingPosts: [],
      popularTags: [],
      topAuthors: [],
    };
  }
}

// ─── Page Component ─────────────────────────────────────

export default async function HomePage() {
  const { featuredPosts, standardPosts, trendingPosts, popularTags, topAuthors } =
    await getHomeData();

  const hasPosts = featuredPosts.length > 0 || standardPosts.length > 0;

  return (
    <div>
      {/* ─── Hero Section ──────────────────────────── */}
      <section className="relative overflow-hidden bg-linear-to-b from-white to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Where Great{" "}
            <span className="text-primary">Stories</span> Live
          </h1>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Discover thoughtful writing from world-class authors on technology,
            culture, and design.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/explore"
              className="bg-white border border-border hover:bg-gray-50 text-foreground px-6 py-3 rounded-full font-medium transition-colors"
            >
              Explore Posts
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Featured Posts ────────────────────────── */}
      {featuredPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <PostCard key={post.id} post={post} variant="featured" />
            ))}
          </div>
        </section>
      )}

      {/* ─── Main Content + Sidebar ────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left — Post List */}
          <div className="flex-1 space-y-4">
            {standardPosts.length > 0 ? (
              standardPosts.map((post) => (
                <PostCard key={post.id} post={post} variant="standard" />
              ))
            ) : !hasPosts ? (
              <div className="bg-card rounded-2xl border border-border p-12 text-center">
                <p className="text-lg font-semibold text-foreground mb-2">No posts yet</p>
                <p className="text-sm text-muted mb-4">
                  Be the first to share a story on InkFlow.
                </p>
                <Link
                  href="/write"
                  className="inline-flex bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
                >
                  Write a Story
                </Link>
              </div>
            ) : null}

            {hasPosts && (
              <div className="text-center pt-4">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-medium text-sm transition-colors"
                >
                  View all posts <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Right — Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 space-y-8">
            {/* Trending Posts */}
            {trendingPosts.length > 0 && (
              <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
                <h3 className="font-semibold text-foreground mb-4">
                  Trending Posts
                </h3>
                <div className="space-y-3">
                  {trendingPosts.map((post, i) => (
                    <div key={post.id} className="flex items-start gap-3">
                      <span
                        className={`text-lg font-bold shrink-0 w-6 ${
                          i === 0
                            ? "text-primary"
                            : i === 1
                            ? "text-accent"
                            : "text-muted"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <PostCard post={post} variant="compact" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Tags */}
            {popularTags.length > 0 && (
              <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
                <h3 className="font-semibold text-foreground mb-4">
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Link key={tag.id} href={`/explore?tag=${tag.name}`}>
                      <TagPill name={tag.name} color={tag.color} size="md" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Top Authors */}
            {topAuthors.length > 0 && (
              <TopAuthors authors={topAuthors} />
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
