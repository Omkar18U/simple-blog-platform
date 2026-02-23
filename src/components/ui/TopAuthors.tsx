"use client";

import Link from "next/link";
import FollowButton from "@/components/ui/FollowButton";

interface Author {
  id: string;
  name: string;
  image: string | null;
  _count: {
    posts: number;
    followers: number;
  };
}

export default function TopAuthors({ authors }: { authors: Author[] }) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
      <h3 className="font-semibold text-foreground mb-4">Top Authors</h3>
      <div className="space-y-4">
        {authors.map((author) => (
          <div key={author.id} className="flex items-center justify-between">
            <Link
              href={`/user/${author.id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                {author.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {author.name}
                </p>
                <p className="text-xs text-muted">
                  {author._count.posts} posts · {author._count.followers}{" "}
                  followers
                </p>
              </div>
            </Link>
            <FollowButton userId={author.id} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
