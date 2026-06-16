"use client";

import {Search} from "lucide-react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useState, useTransition, type FormEvent} from "react";

export function BoardSearch({
  label,
  placeholder
}: {
  label: string;
  placeholder: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    const keyword = value.trim();

    if (keyword) {
      params.set("q", keyword);
    } else {
      params.delete("q");
    }

    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {scroll: false});
    });
  }

  return (
    <form className="block space-y-2" onSubmit={submitSearch}>
      <span className="text-sm font-bold text-[var(--cb-muted)]">{label}</span>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cb-muted)]" />
          <input
            className="input pl-10"
            disabled={isPending}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            value={value}
          />
        </div>
        <button
          aria-label={label}
          className="button secondary px-3"
          disabled={isPending}
          type="submit"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
