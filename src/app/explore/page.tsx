import { prisma } from "@/lib/prisma";
import PostCard from "@/components/ui/PostCard";
import TagPill from "@/components/ui/TagPill";
import Link from "next/link";

interface ExplorePageProps {
  searchParams: Promise<{ tag?: string; page?: string; search?: string }>;
}

interface PostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  readTime: number;
  createdAt: Date;
  author: { id: string; name: string; image: string | null };
  tags: { tag: { id: string; name: string; color: string } }[];
  _count: { likes: number; comments: number; bookmarks: number };
}

interface TagData {
  id: string;
  name: string;
  color: string;
  _count: { posts: number };
}

async function getExploreData(tag?: string, search?: string, page = 1) {
  try {
    const limit = 12;
    const where: Record<string, unknown> = { status: "PUBLISHED" };

    if (tag) {
      where.tags = { some: { tag: { name: tag } } };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [posts, total, allTags] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, image: true } },
          tags: { include: { tag: true } },
          _count: { select: { likes: true, comments: true, bookmarks: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
      prisma.tag.findMany({
        include: { _count: { select: { posts: true } } },
        orderBy: { posts: { _count: "desc" } },
        take: 12,
      }),
    ]);

    return {
      posts: posts as PostData[],
      allTags: allTags as TagData[],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch {
    return { posts: [] as PostData[], allTags: [] as TagData[], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } };
  }
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { tag, page, search } = await searchParams;
  const currentPage = parseInt(page || "1");
  const { posts, allTags, pagination } = await getExploreData(tag, search, currentPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">Explore</h1>
      <p className="text-muted mb-8">
        Discover stories, thinking, and expertise from writers on any topic.
      </p>

      {/* Tags filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/explore">
          <span
            className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !tag
                ? "bg-primary text-white"
                : "bg-gray-100 text-muted hover:bg-gray-200"
            }`}
          >
            All
          </span>
        </Link>
        {allTags.map((t) => (
          <Link key={t.id} href={`/explore?tag=${encodeURIComponent(t.name)}`}>
            <TagPill
              name={`${t.name} (${t._count.posts})`}
              color={tag === t.name ? t.color : "#9CA3AF"}
              size="md"
            />
          </Link>
        ))}
      </div>

      {/* Posts grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} variant="featured" />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No posts found
          </h2>
          <p className="text-sm text-muted">
            {tag
              ? `No posts tagged with "${tag}" yet.`
              : search
              ? `No results for "${search}".`
              : "No published posts yet. Be the first to write!"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {currentPage > 1 && (
            <Link
              href={`/explore?${tag ? `tag=${encodeURIComponent(tag)}&` : ""}page=${currentPage - 1}`}
              className="px-4 py-2 text-sm font-medium bg-white border border-border rounded-full hover:bg-gray-50 transition-colors"
            >
              Previous
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-muted">
            Page {currentPage} of {pagination.totalPages}
          </span>
          {currentPage < pagination.totalPages && (
            <Link
              href={`/explore?${tag ? `tag=${encodeURIComponent(tag)}&` : ""}page=${currentPage + 1}`}
              className="px-4 py-2 text-sm font-medium bg-white border border-border rounded-full hover:bg-gray-50 transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
