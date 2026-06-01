import {Loader2} from "lucide-react";

export default function Loading() {
  return (
    <main className="container page-section">
      <div className="panel flex items-center gap-3 p-6 text-sm text-[var(--cb-muted)]">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--cb-teal)]" />
        <span>Loading records...</span>
      </div>
    </main>
  );
}
