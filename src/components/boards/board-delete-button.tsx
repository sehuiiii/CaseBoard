"use client";

import {Trash2} from "lucide-react";
import {useTransition} from "react";
import type {Locale} from "@/i18n/routing";
import {deleteBoardAction} from "@/lib/actions/board-actions";

export function BoardDeleteButton({
  boardId,
  label,
  locale
}: {
  boardId: string;
  label: string;
  locale: Locale;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="button danger min-h-9 px-3 text-sm"
      disabled={isPending}
      onClick={() => startTransition(() => deleteBoardAction(locale, boardId))}
      type="button"
    >
      <Trash2 className="h-4 w-4" />
      {label}
    </button>
  );
}
