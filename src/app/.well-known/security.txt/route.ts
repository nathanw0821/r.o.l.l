import { NextResponse } from "next/server";

export function GET() {
  const content = `Contact: mailto:nathanw@gmail.com
Preferred-Languages: en
Canonical: https://fallout76.wiki/.well-known/security.txt
Expires: 2027-06-22T05:00:00.000Z
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
