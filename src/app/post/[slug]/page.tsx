import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Clock, Eye } from "lucide-react";
import TagPill from "@/components/ui/TagPill";
import PostActions from "./PostActions";
import PostComments from "./PostComments";
import AudioReader from "@/components/ui/AudioReader";

interface PostTag {
  tag: { id: string; name: string; color: string };
}

interface PostComment {
  id: string;
  content: string;
  createdAt: Date;
  author: { id: string; name: string; image: string | null };
}

interface PostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  readTime: number;
  views: number;
  createdAt: Date;
  author: { id: string; name: string; image: string | null; bio: string | null };
  tags: PostTag[];
  comments: PostComment[];
  _count: { likes: number; comments: number; bookmarks: number };
}

async function getPost(slug: string): Promise<PostData | null> {
  try {
    const post = await prisma.post.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      include: {
        author: { select: { id: true, name: true, image: true, bio: true } },
        tags: { include: { tag: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { likes: true, comments: true, bookmarks: true } },
      },
    });

    if (!post) return null;

    // Increment views
    await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    return post as PostData;
  } catch {
    return null;
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map(({ tag }) => (
          <TagPill key={tag.id} name={tag.name} color={tag.color} size="sm" />
        ))}
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4">
        {post.title}
      </h1>

      {/* Author info */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
          {post.author.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {post.author.name}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>{formatDate(post.createdAt)}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readTime} min read
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {post.views} views
            </span>
          </div>
        </div>
      </div>

      {/* Audio Reader */}
      <AudioReader text={post.content} title={post.title} />

      {/* Cover image */}
      {post.coverImage && (
        <div className="rounded-2xl overflow-hidden mb-8 bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-auto"
          />
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-lg max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Actions bar — client component for interactivity */}
      <PostActions
        postId={post.id}
        authorId={post.author.id}
        postSlug={post.slug}
        likesCount={post._count.likes}
        commentsCount={post._count.comments}
      />

      {/* Comments section */}
      <PostComments postId={post.id} initialComments={post.comments} />

      {/* Author bio */}
      <div className="mt-8 bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
            {post.author.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-foreground">{post.author.name}</p>
            {post.author.bio && (
              <p className="text-sm text-muted mt-0.5">{post.author.bio}</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
