"use server";

import {revalidatePath} from "next/cache";
import {notFound, redirect} from "next/navigation";
import type {Locale} from "@/i18n/routing";
import {requireUser} from "@/lib/auth";
import type {CaseNodeType} from "@/lib/case-types";
import {prisma} from "@/lib/prisma";
import {readString} from "@/lib/validation";

function revalidateBoardSurfaces(locale: Locale, boardId: string) {
  revalidatePath(`/${locale}/boards`);
  revalidatePath(`/${locale}/boards/${boardId}`);
  revalidatePath(`/${locale}/mypage`);
}

export async function createBoardAction(locale: Locale, formData: FormData) {
  const user = await requireUser(locale);
  const title = readString(formData, "title");
  const description = readString(formData, "description");

  if (!title) {
    return;
  }

  const board = await prisma.board.create({
    data: {
      title,
      description: description || null,
      ownerId: user.id
    }
  });

  revalidatePath(`/${locale}/boards`);
  redirect(`/${locale}/boards/${board.id}`);
}

export async function deleteBoardAction(locale: Locale, boardId: string) {
  const user = await requireUser(locale);

  await prisma.board.deleteMany({
    where: {
      id: boardId,
      ownerId: user.id
    }
  });

  revalidatePath(`/${locale}/boards`);
}

export async function createNodeAction(
  locale: Locale,
  boardId: string,
  input: {
    type: CaseNodeType;
    title: string;
    content?: string;
    x: number;
    y: number;
  }
) {
  const user = await requireUser(locale);
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId: user.id
    },
    select: {
      id: true
    }
  });

  if (!board) {
    notFound();
  }

  const [node] = await prisma.$transaction([
    prisma.caseNode.create({
      data: {
        boardId,
        type: input.type,
        title: input.title,
        content: input.content || null,
        x: input.x,
        y: input.y
      }
    }),
    prisma.board.update({
      where: {
        id: boardId
      },
      data: {
        updatedAt: new Date()
      }
    })
  ]);

  revalidateBoardSurfaces(locale, boardId);
  return node;
}

export async function updateNodeAction(
  locale: Locale,
  boardId: string,
  nodeId: string,
  input: {
    type: CaseNodeType;
    title: string;
    content?: string;
  }
) {
  const user = await requireUser(locale);
  const node = await prisma.caseNode.findFirst({
    where: {
      id: nodeId,
      boardId,
      board: {
        ownerId: user.id
      }
    }
  });

  if (!node) {
    notFound();
  }

  const [updated] = await prisma.$transaction([
    prisma.caseNode.update({
      where: {
        id: nodeId
      },
      data: {
        type: input.type,
        title: input.title,
        content: input.content || null
      }
    }),
    prisma.board.update({
      where: {
        id: boardId
      },
      data: {
        updatedAt: new Date()
      }
    })
  ]);

  revalidateBoardSurfaces(locale, boardId);
  return updated;
}

export async function deleteNodeAction(
  locale: Locale,
  boardId: string,
  nodeId: string
) {
  const user = await requireUser(locale);

  await prisma.$transaction([
    prisma.caseNode.deleteMany({
      where: {
        id: nodeId,
        boardId,
        board: {
          ownerId: user.id
        }
      }
    }),
    prisma.board.updateMany({
      where: {
        id: boardId,
        ownerId: user.id
      },
      data: {
        updatedAt: new Date()
      }
    })
  ]);

  revalidateBoardSurfaces(locale, boardId);
}

export async function createEdgeAction(
  locale: Locale,
  boardId: string,
  sourceNodeId: string,
  targetNodeId: string
) {
  const user = await requireUser(locale);
  const nodes = await prisma.caseNode.count({
    where: {
      boardId,
      board: {
        ownerId: user.id
      },
      id: {
        in: [sourceNodeId, targetNodeId]
      }
    }
  });

  if (nodes !== 2 || sourceNodeId === targetNodeId) {
    throw new Error("Invalid evidence link");
  }

  const [edge] = await prisma.$transaction([
    prisma.caseEdge.upsert({
      where: {
        boardId_sourceNodeId_targetNodeId: {
          boardId,
          sourceNodeId,
          targetNodeId
        }
      },
      update: {},
      create: {
        boardId,
        sourceNodeId,
        targetNodeId
      }
    }),
    prisma.board.update({
      where: {
        id: boardId
      },
      data: {
        updatedAt: new Date()
      }
    })
  ]);

  revalidateBoardSurfaces(locale, boardId);
  return edge;
}

export async function deleteEdgeAction(
  locale: Locale,
  boardId: string,
  edgeId: string
) {
  const user = await requireUser(locale);

  await prisma.$transaction([
    prisma.caseEdge.deleteMany({
      where: {
        id: edgeId,
        boardId,
        board: {
          ownerId: user.id
        }
      }
    }),
    prisma.board.updateMany({
      where: {
        id: boardId,
        ownerId: user.id
      },
      data: {
        updatedAt: new Date()
      }
    })
  ]);

  revalidateBoardSurfaces(locale, boardId);
}

export async function saveNodePositionsAction(
  locale: Locale,
  boardId: string,
  positions: Array<{id: string; x: number; y: number}>
) {
  const user = await requireUser(locale);
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId: user.id
    },
    select: {
      id: true
    }
  });

  if (!board) {
    notFound();
  }

  await prisma.$transaction([
    ...positions.map((position) =>
      prisma.caseNode.updateMany({
        where: {
          id: position.id,
          boardId
        },
        data: {
          x: position.x,
          y: position.y
        }
      })
    ),
    prisma.board.update({
      where: {
        id: boardId
      },
      data: {
        updatedAt: new Date()
      }
    })
  ]);

  revalidateBoardSurfaces(locale, boardId);
}
