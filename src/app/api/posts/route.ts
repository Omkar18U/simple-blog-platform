import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { postSchema } from "@/lib/validations";
import { slugify, calculateReadTime } from "@/lib/utils";

// GET /api/posts — List published posts (public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "latest"; // latest | trending

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

    const orderBy =
      sort === "trending"
        ? [{ views: "desc" as const }, { createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }];

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, image: true } },
          tags: { include: { tag: true } },
          _count: { select: { likes: true, comments: true, bookmarks: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts — Create a new post (auth required)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = postSchema.parse(body);

    // Generate unique slug
    let slug = slugify(validated.title);
    const existingSlug = await prisma.post.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const readTime = calculateReadTime(validated.content);

    // Create post with tags
    const post = await prisma.post.create({
      data: {
        title: validated.title,
        slug,
        content: validated.content,
        excerpt: validated.excerpt || validated.content.replace(/<[^>]*>/g, "").slice(0, 200),
        coverImage: validated.coverImage || null,
        status: validated.status,
        readTime,
        authorId: user.id,
        tags: validated.tags
          ? {
              create: validated.tags.map((tagName) => ({
                tag: {
                  connectOrCreate: {
                    where: { name: tagName },
                    create: { name: tagName },
                  },
                },
              })),
            }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
