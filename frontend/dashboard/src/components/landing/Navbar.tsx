import { Link } from "@tanstack/react-router";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 px-6 pt-4">
      <nav className="max-w-6xl mx-auto glass rounded-2xl px-5 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
            <Map className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-extrabold">Smart Map</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#categories" className="hover:text-foreground transition-colors">Categories</a>
          <a href="#community" className="hover:text-foreground transition-colors">Community</a>
        </div>
        <Button asChild variant="hero" size="sm">
          <Link to="/signin">Get Started</Link>
        </Button>
      </nav>
    </header>
  );
}
