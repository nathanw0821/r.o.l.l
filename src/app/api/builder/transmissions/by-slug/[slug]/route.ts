import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminUser } from "@/lib/app-config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;
    const isAdmin = isAdminUser(session?.user);

    const record = await prisma.sharedBuild.findUnique({
      where: { slug },
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
    console.error("Failed to get transmission by slug:", error);
    return NextResponse.json({ success: false, error: "Failed to retrieve transmission." }, { status: 500 });
  }
}
