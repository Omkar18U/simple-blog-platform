import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Bookmark, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    coverImage?: string | null;
    readTime: number;
    createdAt: string | Date;
    author: {
      id: string;
      name: string;
      image?: string | null;
    };
    tags?: { tag: { id: string; name: string; color: string } }[];
    _count?: {
      likes: number;
      comments: number;
      bookmarks: number;
    };
  };
  variant?: "featured" | "standard" | "compact";
}

export default function PostCard({ post, variant = "standard" }: PostCardProps) {
  if (variant === "featured") {
    return <FeaturedCard post={post} />;
  }

  if (variant === "compact") {
    return <CompactCard post={post} />;
  }

  return <StandardCard post={post} />;
}

// ─── Featured Card (3-column grid on home) ──────────────

function FeaturedCard({ post }: { post: PostCardProps["post"] }) {
  return (
    <Link
      href={`/post/${post.slug}`}
      className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="relative h-48 w-full bg-gray-100">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-4xl">✍️</span>
          </div>
        )}
        {post.tags?.[0] && (
          <span
            className="absolute top-3 left-3 px-3 py-1 text-xs font-medium rounded-full text-white"
            style={{ backgroundColor: post.tags[0].tag.color || "#3B49DF" }}
          >
            {post.tags[0].tag.name}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <div className="flex items-center gap-2 mt-3">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
            {post.author.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-muted">{post.author.name}</span>
          <span className="text-xs text-muted">·</span>
          <span className="text-xs text-muted">
            {formatDate(post.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Standard Card (list layout) ────────────────────────

function StandardCard({ post }: { post: PostCardProps["post"] }) {
  return (
    <Link
      href={`/post/${post.slug}`}
      className="group flex gap-4 bg-card rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-32 w-40 shrink-0 rounded-xl overflow-hidden bg-gray-100">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-2xl">✍️</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          {post.tags?.[0] && (
            <span
              className="inline-block px-2 py-0.5 text-xs font-medium rounded-full text-white mb-2"
              style={{ backgroundColor: post.tags[0].tag.color || "#3B49DF" }}
            >
              {post.tags[0].tag.name}
            </span>
          )}
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-muted line-clamp-2 mt-1">
            {post.excerpt}
          </p>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
              {post.author.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-muted">{post.author.name}</span>
            <span className="text-xs text-muted">
              {formatDate(post.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-muted">
            <span className="flex items-center gap-1 text-xs">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime} min read
            </span>
            <span className="flex items-center gap-1 text-xs">
              <Heart className="h-3.5 w-3.5" />
              {post._count?.likes || 0}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <Bookmark className="h-3.5 w-3.5" />
              {post._count?.bookmarks || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Compact Card (sidebar trending list) ───────────────

function CompactCard({ post }: { post: PostCardProps["post"] }) {
  return (
    <Link
      href={`/post/${post.slug}`}
      className="group block hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
    >
      <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
        {post.title}
      </h4>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-muted">{post.author.name}</span>
        <span className="text-xs text-muted">·</span>
        <span className="text-xs text-muted">
          {formatDate(post.createdAt)}
        </span>
      </div>
    </Link>
  );
}
