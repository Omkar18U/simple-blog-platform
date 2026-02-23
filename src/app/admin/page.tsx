"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  Users,
  FileText,
  Heart,
  TrendingUp,
  Trash2,
  ShieldCheck,
  ShieldOff,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "@/components/ui/StatCard";
import { formatDate } from "@/lib/utils";

interface Stats {
  totalViews: number;
  newFollowers: number;
  postsPublished: number;
  totalLikes: number;
}

interface MonthlyData {
  month: string;
  posts: number;
  views: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  createdAt: string;
  _count: { posts: number; followers: number };
}

interface AdminPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  views: number;
  createdAt: string;
  author: { id: string; name: string; email: string };
  _count: { likes: number; comments: number };
}

const mockStats: Stats = {
  totalViews: 4750,
  newFollowers: 120,
  postsPublished: 536,
  totalLikes: 1240,
};

const mockMonthlyData: MonthlyData[] = [
  { month: "Jul", posts: 30, views: 120 },
  { month: "Aug", posts: 45, views: 180 },
  { month: "Sep", posts: 80, views: 280 },
  { month: "Oct", posts: 60, views: 220 },
  { month: "Nov", posts: 90, views: 310 },
  { month: "Dec", posts: 70, views: 250 },
];

type Tab = "overview" | "users" | "posts";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats>(mockStats);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>(mockMonthlyData);
  const [statsLoading, setStatsLoading] = useState(true);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);

  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsLoaded, setPostsLoaded] = useState(false);

  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setMonthlyData(data.monthlyEngagement);
        }
      } catch {
        // fallback to mock
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab !== "users" || usersLoaded) return;
    setUsersLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => { setUsers(data.users ?? []); setUsersLoaded(true); })
      .catch(() => {})
      .finally(() => setUsersLoading(false));
  }, [activeTab, usersLoaded]);

  useEffect(() => {
    if (activeTab !== "posts" || postsLoaded) return;
    setPostsLoading(true);
    fetch("/api/admin/posts")
      .then((r) => r.json())
      .then((data) => { setPosts(data.posts ?? []); setPostsLoaded(true); })
      .catch(() => {})
      .finally(() => setPostsLoading(false));
  }, [activeTab, postsLoaded]);

  async function toggleUserRole(userId: string, currentRole: string) {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    setActionInProgress(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      } else { alert("Failed to update role"); }
    } catch { alert("Something went wrong"); }
    finally { setActionInProgress(null); }
  }

  async function deleteUser(userId: string, name: string) {
    if (!confirm(`Delete user "${name}"? This will remove all their data.`)) return;
    setActionInProgress(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) { setUsers((prev) => prev.filter((u) => u.id !== userId)); }
      else { const err = await res.json(); alert(err.error || "Failed to delete user"); }
    } catch { alert("Something went wrong"); }
    finally { setActionInProgress(null); }
  }

  async function deletePost(postId: string, title: string) {
    if (!confirm(`Delete post "${title}"?`)) return;
    setActionInProgress(postId);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (res.ok) { setPosts((prev) => prev.filter((p) => p.id !== postId)); }
      else { alert("Failed to delete post"); }
    } catch { alert("Something went wrong"); }
    finally { setActionInProgress(null); }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { id: "posts", label: "Posts", icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">Administrator</span>
      </div>

      <div className="flex items-center gap-1 mb-8 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Views" value={statsLoading ? 0 : stats.totalViews} change="All time" trend="up" icon={Eye} />
            <StatCard title="Followers" value={statsLoading ? 0 : stats.newFollowers} change="Registered users" trend="up" icon={Users} />
            <StatCard title="Posts Published" value={statsLoading ? 0 : stats.postsPublished} change="Live posts" trend="up" icon={FileText} />
            <StatCard title="Total Likes" value={statsLoading ? 0 : stats.totalLikes} change="Across all posts" trend="up" icon={Heart} />
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Monthly Engagement</h2>
              <TrendingUp className="h-5 w-5 text-muted" />
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B49DF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B49DF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }} />
                  <Area type="monotone" dataKey="views" stroke="#3B49DF" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">
              All Users {usersLoaded && <span className="text-muted text-sm font-normal ml-1">({users.length})</span>}
            </h2>
          </div>
          {usersLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted text-xs border-b border-border bg-gray-50">
                    <th className="text-left px-6 py-3 font-medium">User</th>
                    <th className="text-left px-6 py-3 font-medium">Email</th>
                    <th className="text-left px-6 py-3 font-medium">Role</th>
                    <th className="text-left px-6 py-3 font-medium">Posts</th>
                    <th className="text-left px-6 py-3 font-medium">Joined</th>
                    <th className="text-right px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-medium text-foreground">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${user.role === "ADMIN" ? "bg-primary/10 text-primary" : "bg-gray-100 text-muted"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted">{user._count.posts}</td>
                      <td className="px-6 py-4 text-muted">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleUserRole(user.id, user.role)}
                            disabled={actionInProgress === user.id}
                            title={user.role === "ADMIN" ? "Demote to User" : "Promote to Admin"}
                            className={`p-1.5 rounded-lg transition-colors ${user.role === "ADMIN" ? "text-primary hover:bg-primary/10" : "text-muted hover:bg-gray-100 hover:text-primary"} disabled:opacity-40`}
                          >
                            {actionInProgress === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : user.role === "ADMIN" ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => deleteUser(user.id, user.name)}
                            disabled={actionInProgress === user.id}
                            title="Delete user"
                            className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className="text-center py-12 text-muted text-sm">No users found.</div>}
            </div>
          )}
        </div>
      )}

      {activeTab === "posts" && (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">
              All Posts {postsLoaded && <span className="text-muted text-sm font-normal ml-1">({posts.length})</span>}
            </h2>
          </div>
          {postsLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted text-xs border-b border-border bg-gray-50">
                    <th className="text-left px-6 py-3 font-medium">Title</th>
                    <th className="text-left px-6 py-3 font-medium">Author</th>
                    <th className="text-left px-6 py-3 font-medium">Status</th>
                    <th className="text-left px-6 py-3 font-medium">Views</th>
                    <th className="text-left px-6 py-3 font-medium">Likes</th>
                    <th className="text-left px-6 py-3 font-medium">Date</th>
                    <th className="text-right px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b border-border/50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <a href={`/post/${post.slug}`} className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1 max-w-64 block">
                          {post.title}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-muted">{post.author.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${post.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-muted"}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted">{post.views}</td>
                      <td className="px-6 py-4 text-muted">{post._count.likes}</td>
                      <td className="px-6 py-4 text-muted">{formatDate(post.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => deletePost(post.id, post.title)}
                            disabled={actionInProgress === post.id}
                            title="Delete post"
                            className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors disabled:opacity-40"
                          >
                            {actionInProgress === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {posts.length === 0 && <div className="text-center py-12 text-muted text-sm">No posts found.</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
