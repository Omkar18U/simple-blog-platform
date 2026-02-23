import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET /api/admin/stats — Admin analytics data
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [totalViews, totalPosts, totalUsers, totalLikes, recentUsers] =
      await Promise.all([
        prisma.post.aggregate({ _sum: { views: true } }),
        prisma.post.count({ where: { status: "PUBLISHED" } }),
        prisma.user.count(),
        prisma.like.count(),
        prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

    // Monthly engagement (last 6 months placeholder)
    const monthlyEngagement = await getMonthlyEngagement();

    return NextResponse.json({
      stats: {
        totalViews: totalViews._sum.views || 0,
        newFollowers: await prisma.follow.count(),
        postsPublished: totalPosts,
        totalLikes,
      },
      recentUsers,
      monthlyEngagement,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

// Helper: Get monthly post engagement for last 6 months
async function getMonthlyEngagement() {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const [posts, views] = await Promise.all([
      prisma.post.count({
        where: {
          createdAt: { gte: start, lte: end },
          status: "PUBLISHED",
        },
      }),
      prisma.post.aggregate({
        _sum: { views: true },
        where: {
          createdAt: { gte: start, lte: end },
        },
      }),
    ]);

    months.push({
      month: start.toLocaleString("default", { month: "short" }),
      posts,
      views: views._sum.views || 0,
    });
  }

  return months;
}
