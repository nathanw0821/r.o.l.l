import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { importWorkbook } from "@/lib/importer";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, errors: [{ type: "invalid", message: "Unauthorized" }] }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, errors: [{ type: "invalid", message: "Missing file" }] }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await importWorkbook(buffer, file.name);

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
