import {Plus} from "lucide-react";
import type {Locale} from "@/i18n/routing";
import {createBoardAction} from "@/lib/actions/board-actions";

export function BoardCreateForm({
  copy,
  locale
}: {
  locale: Locale;
  copy: {
    new: string;
    titleLabel: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    create: string;
  };
}) {
  return (
    <form
      action={createBoardAction.bind(null, locale)}
      className="panel grid content-start gap-4 p-5"
    >
      <div>
        <p className="eyebrow">{copy.new}</p>
        <div className="mt-3 h-px w-16 bg-[var(--cb-border-strong)]" />
      </div>
      <label className="space-y-2">
        <span className="text-sm font-bold text-[var(--cb-muted)]">
          {copy.titleLabel}
        </span>
        <input className="input" name="title" required />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-bold text-[var(--cb-muted)]">
          {copy.descriptionLabel}
        </span>
        <textarea
          className="textarea"
          name="description"
          placeholder={copy.descriptionPlaceholder}
        />
      </label>
      <button className="button" type="submit">
        <Plus className="h-4 w-4" />
        {copy.create}
      </button>
    </form>
  );
}
