import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET /api/posts/[id]/status — Get current user's interaction with a post
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ liked: false, bookmarked: false });
    }

    const { id } = await params;

    const [like, bookmark] = await Promise.all([
      prisma.like.findUnique({
        where: { userId_postId: { userId: user.id, postId: id } },
      }),
      prisma.bookmark.findUnique({
        where: { userId_postId: { userId: user.id, postId: id } },
      }),
    ]);

    return NextResponse.json({
      liked: !!like,
      bookmarked: !!bookmark,
    });
  } catch (error) {
    console.error("Error fetching status:", error);
    return NextResponse.json({ liked: false, bookmarked: false });
  }
}
