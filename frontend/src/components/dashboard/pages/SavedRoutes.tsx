import { useSavedRoutes } from "@/hooks/useRoute";
import { PageWrap } from "../PageWrap";

export function SavedRoutes() {
  const { data: routes = [], isLoading } = useSavedRoutes();

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <PageWrap title="Saved Routes" subtitle="Your history">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {routes.map((route: any) => (
          <div key={route.id} className="rounded-2xl border border-border/60 bg-gradient-card p-5">
             <h3 className="text-sm font-bold text-foreground">{route.name}</h3>
             <p className="text-xs text-muted-foreground mt-1">{new Date(route.createdAt).toLocaleDateString()}</p>
             <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
                <span>From: {route.originLat.toFixed(4)}, {route.originLng.toFixed(4)}</span>
             </div>
             <button className="mt-4 w-full rounded-full bg-gradient-primary py-2 text-xs font-bold text-white shadow-glow">Replay Route</button>
          </div>
        ))}
        {routes.length === 0 && <p className="text-muted-foreground text-sm col-span-full">You haven't saved any routes yet.</p>}
      </div>
    </PageWrap>
  );
}
