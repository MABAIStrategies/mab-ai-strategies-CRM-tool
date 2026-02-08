import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../../../src/lib/db";
import { enqueueJob } from "../../../src/lib/queue";
import { rateLimit } from "../../../src/lib/rate-limit";

const parseTags = (value: unknown) => {
  if (!value || typeof value !== "string") {
    return [];
  }
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const persistUpload = async (file: File) => {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const fileName = `${Date.now()}-${safeName}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);
  return { fileName, storageUri: `local://uploads/${fileName}` };
};

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("assets", 30, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const assets = await prisma.asset.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" }
  });
  const response = NextResponse.json({ assets });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("assets", 20, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }
  const contentType = request.headers.get("content-type") ?? "";
  let payload: {
    title?: string;
    description?: string | null;
    tags?: string[];
    version?: string;
    status?: string;
    type?: string;
    storageUri?: string;
    file?: File | null;
  } = {};

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    payload = {
      title: formData.get("title")?.toString(),
      description: formData.get("description")?.toString() ?? null,
      tags: parseTags(formData.get("tags")?.toString()),
      version: formData.get("version")?.toString(),
      status: formData.get("status")?.toString(),
      type: formData.get("type")?.toString(),
      storageUri: formData.get("storageUri")?.toString(),
      file: formData.get("file") as File | null
    };
  } else {
    const body = await request.json();
    payload = {
      title: body.title,
      description: body.description ?? null,
      tags: body.tags ?? [],
      version: body.version,
      status: body.status,
      type: body.type,
      storageUri: body.storageUri
    };
  }

  if (!payload.title || typeof payload.title !== "string") {
    return NextResponse.json({ error: "title is required." }, { status: 400 });
  }

  let storageUri = payload.storageUri ?? "local://assets";
  if (payload.file) {
    if (!payload.storageUri || payload.storageUri.startsWith("local://")) {
      const upload = await persistUpload(payload.file);
      storageUri = upload.storageUri;
    }
  }

  const asset = await prisma.asset.create({
    data: {
      type: payload.type ?? "OTHER",
      title: payload.title,
      description: payload.description ?? null,
      tags: payload.tags ?? [],
      version: payload.version ?? "1.0",
      status: payload.status ?? "DRAFT",
      storageUri
    }
  });

  await enqueueJob({
    type: "ASSET_CLASSIFY",
    payload: { assetId: asset.id },
    idempotencyKey: `asset-classify-${asset.id}`
  });

  const response = NextResponse.json({ asset });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
