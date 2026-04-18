import { Link } from "@tanstack/react-router";
import { Map } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Map className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-extrabold">Smart Map</span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              Explore. Play. Earn. — Turn your everyday city into a board of missions and rewards.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold mb-4 text-sm uppercase tracking-widest text-muted-foreground">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold mb-4 text-sm uppercase tracking-widest text-muted-foreground">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 Smart Map Platform. All rights reserved.</p>
          <p className="font-display font-semibold text-gradient">Explore. Play. Earn.</p>
        </div>
      </div>
    </footer>
  );
}
