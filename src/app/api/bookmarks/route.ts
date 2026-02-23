import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET /api/bookmarks — Get current user's bookmarked posts
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: {
        post: {
          include: {
            author: { select: { id: true, name: true, image: true } },
            tags: { include: { tag: true } },
            _count: { select: { likes: true, comments: true, bookmarks: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const posts = bookmarks.map((b) => b.post);
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}
