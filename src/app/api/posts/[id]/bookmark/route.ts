import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// POST /api/posts/[id]/bookmark — Toggle bookmark on a post
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingBookmark = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId: user.id, postId: id } },
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({ where: { id: existingBookmark.id } });
      return NextResponse.json({ bookmarked: false });
    }

    await prisma.bookmark.create({ data: { userId: user.id, postId: id } });
    return NextResponse.json({ bookmarked: true });
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return NextResponse.json({ error: "Failed to toggle bookmark" }, { status: 500 });
  }
}
