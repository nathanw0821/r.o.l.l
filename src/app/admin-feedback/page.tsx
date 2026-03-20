import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import AdminFeedbackList from "@/components/admin-feedback-list";
import { authOptions } from "@/lib/auth";
import { isAdminUser } from "@/lib/app-config";
import { prisma } from "@/lib/prisma";

export default async function AdminFeedbackPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, username: true }
  });

  if (!isAdminUser(user)) {
    redirect("/");
  }

  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      submittedBy: { select: { username: true, email: true } },
      reviewedBy: { select: { username: true, email: true } }
    }
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Feedback Review</h1>
        <p className="text-sm text-foreground/70">
          Review user feedback, add notes, and track resolution status.
        </p>
      </header>
      <AdminFeedbackList
        initialFeedback={feedback.map((item) => ({
          id: item.id,
          subject: item.subject,
          message: item.message,
          replyEmail: item.replyEmail,
          status: item.status,
          adminNotes: item.adminNotes,
          reviewedAt: item.reviewedAt ? item.reviewedAt.toISOString() : null,
          createdAt: item.createdAt.toISOString(),
          submittedBy: item.submittedBy
            ? { username: item.submittedBy.username, email: item.submittedBy.email }
            : null,
          reviewedBy: item.reviewedBy
            ? { username: item.reviewedBy.username, email: item.reviewedBy.email }
            : null
        }))}
      />
    </div>
  );
}
