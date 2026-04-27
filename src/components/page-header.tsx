import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PageHeader({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children && (
        <CardContent className="pt-0 sm:pt-6 sm:pb-6">
          {children}
        </CardContent>
      )}
    </Card>
  );
}
