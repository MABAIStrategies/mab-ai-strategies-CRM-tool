import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "../../../../src/lib/db";
import { rateLimit } from "../../../../src/lib/rate-limit";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("assets-upload", 10, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required." }, { status: 400 });
  }

  const title = formData.get("title");
  const description = formData.get("description");
  const version = formData.get("version");
  const type = formData.get("type");
  const tags = formData.get("tags");

  const uploadDir = path.join(process.cwd(), "public", "uploads", "assets");
  await mkdir(uploadDir, { recursive: true });
  const extension = path.extname(file.name);
  const filename = `${randomUUID()}${extension}`;
  const storageUri = `/uploads/assets/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  const asset = await prisma.asset.create({
    data: {
      title: typeof title === "string" && title.trim() ? title.trim() : file.name,
      description: typeof description === "string" && description.trim() ? description.trim() : null,
      version: typeof version === "string" && version.trim() ? version.trim() : "1.0",
      type: typeof type === "string" && type.trim() ? type.trim() : "OTHER",
      tags:
        typeof tags === "string" && tags.trim()
          ? tags.split(",").map((tag) => tag.trim()).filter(Boolean)
          : [],
      status: "DRAFT",
      storageUri
    }
  });

  const response = NextResponse.json({ asset });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
