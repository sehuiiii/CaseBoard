import Link from "next/link";
import {FileQuestion} from "lucide-react";

export default function NotFound() {
  return (
    <main className="container page-section">
      <section className="panel max-w-xl p-8">
        <FileQuestion className="mb-4 h-9 w-9 text-[var(--cb-teal)]" />
        <h1 className="text-2xl font-bold">Case file not found.</h1>
        <p className="mt-3 text-[var(--cb-muted)]">
          The address is wrong or you do not have access to this record.
        </p>
        <Link className="button mt-6" href="/ko">
          Back home
        </Link>
      </section>
    </main>
  );
}
