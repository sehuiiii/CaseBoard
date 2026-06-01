import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  {
    params
  }: {
    params: Promise<{boardId: string; nodeId: string}>;
  }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({message: "Unauthorized"}, {status: 401});
  }

  const {boardId, nodeId} = await params;
  const body = (await request.json()) as {x?: number; y?: number};

  if (typeof body.x !== "number" || typeof body.y !== "number") {
    return NextResponse.json({message: "Invalid position"}, {status: 400});
  }

  const result = await prisma.caseNode.updateMany({
    where: {
      id: nodeId,
      boardId,
      board: {
        ownerId: user.id
      }
    },
    data: {
      x: body.x,
      y: body.y
    }
  });

  if (result.count === 0) {
    return NextResponse.json({message: "Not found"}, {status: 404});
  }

  return NextResponse.json({ok: true});
}
