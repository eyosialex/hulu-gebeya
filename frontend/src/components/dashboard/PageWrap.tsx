import React from "react";

export function PageWrap({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5 p-6 lg:p-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{title}</p>
        <h1 className="mt-1 text-3xl font-bold text-foreground">{subtitle}</h1>
      </header>
      {children}
    </div>
  );
}
