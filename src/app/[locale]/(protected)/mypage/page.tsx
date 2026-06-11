import Link from "next/link";
import {FileText, Network, Route} from "lucide-react";
import {getTranslations} from "next-intl/server";
import {isLocale, type Locale} from "@/i18n/routing";
import {requireUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";

export default async function MyPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale: rawLocale} = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ko";
  const user = await requireUser(locale);
  const t = await getTranslations({locale, namespace: "mypage"});

  const [boardCount, nodeCount, edgeCount, recentBoards] = await Promise.all([
    prisma.board.count({where: {ownerId: user.id}}),
    prisma.caseNode.count({where: {board: {ownerId: user.id}}}),
    prisma.caseEdge.count({where: {board: {ownerId: user.id}}}),
    prisma.board.findMany({
      where: {ownerId: user.id},
      orderBy: {updatedAt: "desc"},
      take: 5,
      include: {
        _count: {
          select: {
            nodes: true,
            edges: true
          }
        }
      }
    })
  ]);

  const stats = [
    {label: t("totalBoards"), value: boardCount, icon: FileText},
    {label: t("totalNodes"), value: nodeCount, icon: Network},
    {label: t("totalEdges"), value: edgeCount, icon: Route}
  ];

  return (
    <main className="container page-section">
      <div className="mb-8">
        <p className="eyebrow">{user.email}</p>
        <h1 className="mt-3 text-4xl font-black">{t("title")}</h1>
        <p className="section-caption mt-3">{t("subtitle")}</p>
      </div>

      <section className="grid-cards">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article className="stat-card panel p-5" key={stat.label}>
              <span className="stat-icon">
                <Icon className="h-5 w-5 text-[var(--cb-teal-strong)]" />
              </span>
              <p className="mt-4 text-sm font-bold text-[var(--cb-muted)]">
                {stat.label}
              </p>
              <p className="mt-1 text-4xl font-black">{stat.value}</p>
            </article>
          );
        })}
      </section>

      <section className="panel mt-8 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">{t("recentBoards")}</h2>
          <span className="status-dot" />
        </div>
        <div className="mt-4 grid gap-3">
          {recentBoards.length === 0 ? (
            <p className="empty-state rounded-md p-4 text-sm text-[var(--cb-muted)]">
              {t("emptyRecent")}
            </p>
          ) : (
            recentBoards.map((board) => (
              <Link
                className="case-card panel p-4"
                href={`/${locale}/boards/${board.id}`}
                key={board.id}
              >
                <p className="font-bold">{board.title}</p>
                <p className="mt-1 text-sm text-[var(--cb-muted)]">
                  {t("recentSummary", {
                    edges: board._count.edges,
                    nodes: board._count.nodes
                  })}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
