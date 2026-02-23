import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// POST /api/posts/[id]/like — Toggle like on a post
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

    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId: user.id, postId: id } },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      return NextResponse.json({ liked: false });
    }

    await prisma.like.create({ data: { userId: user.id, postId: id } });

    // Create notification for post author (skip if liking own post)
    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (post && post.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          type: "LIKE",
          recipientId: post.authorId,
          issuerId: user.id,
          postId: id,
        },
      });
    }

    return NextResponse.json({ liked: true });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
