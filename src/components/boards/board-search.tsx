"use client";

import {Search} from "lucide-react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useTransition} from "react";

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

  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-[var(--cb-muted)]">{label}</span>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cb-muted)]" />
        <input
          className="input pl-10"
          defaultValue={searchParams.get("q") ?? ""}
          disabled={isPending}
          onChange={(event) => {
            const value = event.target.value;
            const params = new URLSearchParams(searchParams);

            if (value) {
              params.set("q", value);
            } else {
              params.delete("q");
            }

            startTransition(() => {
              router.replace(`${pathname}?${params.toString()}`);
            });
          }}
          placeholder={placeholder}
        />
      </div>
    </label>
  );
}
