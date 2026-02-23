import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// POST /api/users/[id]/follow — Toggle follow on a user
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: followingId } = await params;

    // Can't follow yourself
    if (user.id === followingId) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
    });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId,
        },
      },
    });

    if (existingFollow) {
      await prisma.follow.delete({ where: { id: existingFollow.id } });
      return NextResponse.json({ following: false });
    }

    await prisma.follow.create({
      data: { followerId: user.id, followingId },
    });

    // Create follow notification for the target user
    await prisma.notification.create({
      data: {
        type: "FOLLOW",
        recipientId: followingId,
        issuerId: user.id,
      },
    });

    return NextResponse.json({ following: true });
  } catch (error) {
    console.error("Error toggling follow:", error);
    return NextResponse.json(
      { error: "Failed to toggle follow" },
      { status: 500 }
    );
  }
}

// GET /api/users/[id]/follow — Check if current user follows target
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ following: false });
    }

    const { id: followingId } = await params;

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId,
        },
      },
    });

    return NextResponse.json({ following: !!existingFollow });
  } catch {
    return NextResponse.json({ following: false });
  }
}
