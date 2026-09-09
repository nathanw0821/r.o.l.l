import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminUser } from "@/lib/app-config";
import { prisma } from "@/lib/prisma";
import { safeRevalidateTag } from "@/lib/revalidate";
import { sharedBuildTagForSlug } from "@/lib/cache-tags";
import type { BuilderPayload } from "@/lib/builder/types";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;
    const isAdmin = isAdminUser(session?.user);

    const record = await prisma.sharedBuild.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    if (!record || !record.published) {
      return NextResponse.json({ success: false, error: "Transmission not found." }, { status: 404 });
    }

    const isOwner = Boolean((currentUserId && record.userId === currentUserId) || isAdmin);

    return NextResponse.json({
      success: true,
      data: {
        id: record.id,
        slug: record.slug,
        title: record.title,
        description: record.description,
        payload: record.payload,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
        userId: record.userId,
        isOwner,
        author: record.user ? {
          id: record.userId,
          name: record.user.name,
          username: record.user.username,
          image: record.user.image,
        } : null,
      },
    });
  } catch (error) {
    console.error("Failed to get transmission by ID:", error);
    return NextResponse.json({ success: false, error: "Failed to retrieve transmission." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;
    const isAdmin = isAdminUser(session?.user);

    const record = await prisma.sharedBuild.findUnique({ where: { id } });
    if (!record) {
      return NextResponse.json({ success: false, error: "Transmission not found." }, { status: 404 });
    }

    const body = ((await request.json().catch(() => ({}))) || {}) as Record<string, unknown>;
    const editToken = typeof body.editToken === "string" ? body.editToken : null;
    const payloadEditToken = (record.payload as Record<string, unknown>)?._editToken;

    const isAuthorized = Boolean(
      (currentUserId && record.userId === currentUserId) ||
      isAdmin ||
      (editToken && payloadEditToken && editToken === payloadEditToken)
    );

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to modify this transmission." },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (typeof body.title === "string" && body.title.trim().length >= 2) {
      updateData.title = body.title.trim().slice(0, 120);
    }

    if (body.description !== undefined) {
      updateData.description = typeof body.description === "string" ? body.description.trim().slice(0, 500) : null;
    }

    if (body.payload && typeof body.payload === "object") {
      // Preserve original _editToken inside payload
      const updatedPayload = {
        ...(body.payload as BuilderPayload),
        ...(payloadEditToken ? { _editToken: payloadEditToken } : {}),
      };
      updateData.payload = updatedPayload;
    }

    // If user is logged in and build previously had no userId, claim it to this user
    if (currentUserId && !record.userId) {
      updateData.userId = currentUserId;
    }

    const updated = await prisma.sharedBuild.update({
      where: { id },
      data: updateData,
    });

    safeRevalidateTag(sharedBuildTagForSlug(record.slug), { expire: 0 });

    return NextResponse.json({
      success: true,
      slug: updated.slug,
      path: `/l/${updated.slug}`,
      data: {
        id: updated.id,
        slug: updated.slug,
        title: updated.title,
        description: updated.description,
      },
    });
  } catch (error) {
    console.error("Failed to update transmission:", error);
    return NextResponse.json({ success: false, error: "Failed to update transmission." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;
    const isAdmin = isAdminUser(session?.user);

    const record = await prisma.sharedBuild.findUnique({ where: { id } });
    if (!record) {
      return NextResponse.json({ success: false, error: "Transmission not found." }, { status: 404 });
    }

    // Check editToken in body or query param
    const { searchParams } = new URL(request.url);
    const queryToken = searchParams.get("editToken");
    let bodyToken: string | null = null;
    try {
      const body = ((await request.json().catch(() => ({}))) || {}) as Record<string, unknown>;
      bodyToken = typeof body.editToken === "string" ? body.editToken : null;
    } catch {
      // Empty body is acceptable if using queryToken or session
    }

    const editToken = bodyToken || queryToken;
    const payloadEditToken = (record.payload as Record<string, unknown>)?._editToken;

    const isAuthorized = Boolean(
      (currentUserId && record.userId === currentUserId) ||
      isAdmin ||
      (editToken && payloadEditToken && editToken === payloadEditToken)
    );

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to delete this transmission." },
        { status: 403 }
      );
    }

    await prisma.sharedBuild.delete({ where: { id } });

    safeRevalidateTag(sharedBuildTagForSlug(record.slug), { expire: 0 });

    return NextResponse.json({
      success: true,
      message: "Transmission successfully deleted from the vault.",
    });
  } catch (error) {
    console.error("Failed to delete transmission:", error);
    return NextResponse.json({ success: false, error: "Failed to delete transmission." }, { status: 500 });
  }
}
