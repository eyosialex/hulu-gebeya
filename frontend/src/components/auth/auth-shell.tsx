import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Map } from "lucide-react";

type AuthShellProps = {
  title: React.ReactNode;
  description: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/30 blur-[140px] animate-float" />
        <div
          className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-accent/20 blur-[140px] animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/90 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="glass rounded-3xl p-8 md:p-10 shadow-glow">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Map className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-extrabold">
              Smart Map
            </span>
          </Link>

          <h1 className="font-display text-3xl font-extrabold mb-2">{title}</h1>
          <p className="text-sm text-muted-foreground mb-8">{description}</p>

          {children}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          {footer}
        </p>
      </div>
    </div>
  );
}
