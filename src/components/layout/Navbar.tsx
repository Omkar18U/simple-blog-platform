"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  Feather,
  Search,
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
} from "lucide-react";
import { navLinks } from "@/lib/constants";
import NotificationBell from "@/components/ui/NotificationBell";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Feather className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">InkFlow</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Link
              href="/search"
              className="hidden sm:flex p-2 text-muted hover:text-foreground rounded-full hover:bg-gray-100 transition-colors"
            >
              <Search className="h-4 w-4" />
            </Link>

            {session?.user ? (
              <>
                {/* Notification Bell */}
                <NotificationBell />

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-lg border border-border py-1 animate-fade-in">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium truncate text-foreground">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-muted truncate">
                          {session.user.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-muted hover:bg-gray-50 hover:text-foreground"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-muted hover:bg-gray-50 hover:text-foreground"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-error hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>

                {/* Write Button */}
                <Link
                  href="/write"
                  className="hidden sm:flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Write a Story
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted hover:text-foreground transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-muted hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-border animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {session?.user && (
              <Link
                href="/write"
                className="block w-full text-center bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-full text-sm font-medium mt-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Write a Story
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

