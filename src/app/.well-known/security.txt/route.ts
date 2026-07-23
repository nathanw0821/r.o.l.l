import { NextResponse } from "next/server";

export function GET() {
  const content = `Contact: mailto:nathanw@gmail.com
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://fallout76.wiki/.well-known/security.txt
Policy: https://fallout76.wiki/privacy
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
