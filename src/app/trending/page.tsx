import { prisma } from "@/lib/prisma";
import PostCard from "@/components/ui/PostCard";

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

async function getTrendingPosts(): Promise<PostData[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      include: {
        author: { select: { id: true, name: true, image: true } },
        tags: { include: { tag: true } },
        _count: { select: { likes: true, comments: true, bookmarks: true } },
      },
      orderBy: [{ views: "desc" }, { createdAt: "desc" }],
      take: 20,
    });
    return posts as PostData[];
  } catch {
    return [] as PostData[];
  }
}

export default async function TrendingPage() {
  const trendingPosts = await getTrendingPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">Trending</h1>
      <p className="text-muted mb-8">
        The most popular stories on InkFlow right now.
      </p>

      {trendingPosts.length > 0 ? (
        <div className="space-y-4">
          {trendingPosts.map((post, i) => (
            <div key={post.id} className="flex items-start gap-4">
              <span className="text-3xl font-bold text-primary/20 shrink-0 w-10 text-right">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <PostCard post={post} variant="standard" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No trending posts yet
          </h2>
          <p className="text-sm text-muted">
            Posts will appear here once they start getting views and engagement.
          </p>
        </div>
      )}
    </div>
  );
}
