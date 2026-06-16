import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {GraphEditor} from "@/components/graph/graph-editor";
import {isLocale, type Locale} from "@/i18n/routing";
import {requireUser} from "@/lib/auth";
import {caseNodeTypes, type CaseNodeType} from "@/lib/case-types";
import {prisma} from "@/lib/prisma";

export default async function BoardDetailPage({
  params
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale: rawLocale, id} = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ko";
  const user = await requireUser(locale);
  const t = await getTranslations({locale, namespace: "editor"});

  const board = await prisma.board.findFirst({
    where: {
      id,
      ownerId: user.id
    },
    include: {
      nodes: {
        orderBy: {
          createdAt: "asc"
        }
      },
      edges: {
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  if (!board) {
    notFound();
  }

  const typeLabels = Object.fromEntries(
    caseNodeTypes.map((type) => [type, t(`types.${type}`)])
  ) as Record<CaseNodeType, string>;

  return (
    <main className="px-4 py-4">
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">{t("caseFile")}</p>
          <h1 className="mt-2 text-3xl font-black">{board.title}</h1>
          {board.description ? (
            <p className="section-caption mt-2">{board.description}</p>
          ) : null}
        </div>
      </div>

      <GraphEditor
        boardId={board.id}
        copy={{
          addNode: t("addNode"),
          empty: t("empty"),
          emptyHint: t("emptyHint"),
          nodeTitle: t("nodeTitle"),
          nodeContent: t("nodeContent"),
          nodeType: t("nodeType"),
          save: t("save"),
          delete: t("delete"),
          analysis: t("analysis"),
          totalNodes: t("totalNodes"),
          totalEdges: t("totalEdges"),
          isolated: t("isolated"),
          critical: t("critical"),
          reorder: t("reorder"),
          focus: t("focus"),
          focusOff: t("focusOff"),
          searchNode: t("searchNode"),
          suggestions: t("suggestions"),
          connect: t("connect"),
          saving: t("saving"),
          saved: t("saved"),
          selectNode: t("selectNode"),
          edgeDeleteHint: t("edgeDeleteHint"),
          connectTitle: t("connectTitle"),
          connectFrom: t("connectFrom"),
          connectTo: t("connectTo"),
          noConnectTarget: t("noConnectTarget"),
          searchResults: t("searchResults"),
          noSearchResults: t("noSearchResults"),
          saveError: t("saveError"),
          typeLabels
        }}
        initialEdges={board.edges.map((edge) => ({
          id: edge.id,
          sourceNodeId: edge.sourceNodeId,
          targetNodeId: edge.targetNodeId,
          label: edge.label
        }))}
        initialNodes={board.nodes.map((node) => ({
          id: node.id,
          type: node.type as CaseNodeType,
          title: node.title,
          content: node.content,
          x: node.x,
          y: node.y
        }))}
        locale={locale}
      />
    </main>
  );
}
