import Link from "next/link";
import {FileText} from "lucide-react";
import {getTranslations} from "next-intl/server";
import {BoardCreateForm} from "@/components/boards/board-create-form";
import {BoardDeleteButton} from "@/components/boards/board-delete-button";
import {BoardSearch} from "@/components/boards/board-search";
import {isLocale, type Locale} from "@/i18n/routing";
import {requireUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";

export default async function BoardsPage({
  params,
  searchParams
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{q?: string}>;
}) {
  const {locale: rawLocale} = await params;
  const {q = ""} = await searchParams;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ko";
  const user = await requireUser(locale);
  const t = await getTranslations({locale, namespace: "boards"});
  const keyword = q.trim();

  const boards = await prisma.board.findMany({
    where: {
      ownerId: user.id,
      ...(keyword
        ? {
            OR: [
              {
                title: {
                  contains: keyword,
                  mode: "insensitive"
                }
              },
              {
                description: {
                  contains: keyword,
                  mode: "insensitive"
                }
              }
            ]
          }
        : {})
    },
    orderBy: {
      updatedAt: "desc"
    },
    include: {
      _count: {
        select: {
          nodes: true,
          edges: true
        }
      }
    }
  });

  return (
    <main className="container page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t("title")}</p>
          <h1 className="mt-3 text-4xl font-black">{t("subtitle")}</h1>
        </div>
        <div className="w-full md:w-80">
          <BoardSearch
            label={t("search")}
            placeholder={t("searchPlaceholder")}
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <BoardCreateForm
          copy={{
            new: t("new"),
            titleLabel: t("titleLabel"),
            descriptionLabel: t("descriptionLabel"),
            descriptionPlaceholder: t("descriptionPlaceholder"),
            create: t("create")
          }}
          locale={locale}
        />

        <section className="grid gap-4">
          {boards.length === 0 ? (
            <div className="empty-state panel flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <FileText className="h-10 w-10 text-[var(--cb-teal-strong)]" />
              <p className="mt-4 text-lg font-bold">{t("empty")}</p>
            </div>
          ) : (
            boards.map((board) => (
              <article
                className="case-card panel flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"
                key={board.id}
              >
                <div>
                  <p className="text-xs font-black uppercase text-[var(--cb-teal)]">
                    {t("caseFile")}
                  </p>
                  <h2 className="mt-1 text-2xl font-black">{board.title}</h2>
                  {board.description ? (
                    <p className="mt-2 max-w-2xl text-[var(--cb-muted)]">
                      {board.description}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-[var(--cb-muted)]">
                    <span className="rounded-md border border-[var(--cb-border)] bg-[rgba(9,13,12,0.42)] px-2.5 py-1">
                      {t("nodeCount", {count: board._count.nodes})}
                    </span>
                    <span className="rounded-md border border-[var(--cb-border)] bg-[rgba(9,13,12,0.42)] px-2.5 py-1">
                      {t("edgeCount", {count: board._count.edges})}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    className="button secondary"
                    href={`/${locale}/boards/${board.id}`}
                  >
                    {t("open")}
                  </Link>
                  <BoardDeleteButton
                    boardId={board.id}
                    label={t("delete")}
                    locale={locale}
                  />
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
