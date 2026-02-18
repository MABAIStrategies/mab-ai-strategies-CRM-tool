import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { noteId: string } }
) {
  const note = await prisma.note.findUnique({
    where: { id: params.noteId },
    select: {
      id: true,
      summary: true,
      structuredExtract: true,
      updatedAt: true
    }
  });

  if (!note) {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  return NextResponse.json({ note });
}
