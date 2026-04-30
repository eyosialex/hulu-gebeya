import { useState } from "react";
import { useDashboard } from "../DashboardContext";
import { Activity } from "lucide-react";
import { PageWrap } from "../PageWrap";
import { useActivityLogs } from "@/hooks/useActivityLogs";

export function SettingsView() {
  const { user } = useDashboard();
  const [gpsHighAccuracy, setGpsHighAccuracy] = useState(true);

  return (
    <div>
      <PageWrap title="Settings" subtitle="Account intelligence and control">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-1">
          <div className="rounded-3xl border border-border/60 bg-gradient-card p-5 shadow-elegant">
            <div className="flex items-center gap-4">
               <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-300/30 bg-linear-to-br from-blue-500 via-indigo-500 to-cyan-500 text-2xl font-bold text-white shadow-lg shadow-blue-950/40">
                  {user.initials}
               </div>
               <div>
                  <h3 className="text-xl font-semibold text-foreground">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
               </div>
            </div>
            <div className="mt-6 space-y-4">
               <SettingsToggle label="GPS High Accuracy" on={gpsHighAccuracy} onToggle={() => setGpsHighAccuracy(!gpsHighAccuracy)} hint="Precision mapping mode" />
               <div className="rounded-xl border border-border/40 bg-surface/40 p-4">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-widest">Recent Activity</p>
                  <ActivityList />
               </div>
            </div>
          </div>
        </div>
      </PageWrap>
    </div>
  );
}

function SettingsToggle({
  label,
  on,
  hint,
  onToggle,
}: {
  label: string;
  on?: boolean;
  hint?: string;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg border border-border/40 bg-surface/40 px-3 py-2 text-left transition hover:border-primary/40 hover:bg-surface/60"
    >
      <div>
        <p className="text-xs text-foreground">{label}</p>
        {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      </div>
      <span className={`relative h-5 w-9 rounded-full ${on ? "bg-primary" : "bg-surface"} transition`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition ${on ? "left-4.5" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function ActivityList() {
  const { data: logs = [], isLoading } = useActivityLogs();
  if (isLoading) return <p>...</p>;
  return (
    <div className="space-y-2 mt-3">
      {logs.map((log: any) => (
        <div key={log.id} className="text-xs text-muted-foreground flex justify-between">
          <span>{log.action}</span>
          <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
        </div>
      ))}
      {logs.length === 0 && <p className="text-[10px] text-muted-foreground">No recent activity.</p>}
    </div>
  );
}
