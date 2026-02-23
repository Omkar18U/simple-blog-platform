import Link from "next/link";
import { Feather } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Feather className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">InkFlow</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted">
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted">
            Copyright &copy; {new Date().getFullYear()} InkFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
