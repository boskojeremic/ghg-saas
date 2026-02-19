import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { checkUserLicense } from "@/lib/license";

export async function middleware(req: any) {
  const token = await getToken({ req });

  if (!token?.email) {
    return NextResponse.next();
  }

  // dozvoli license page
  if (req.nextUrl.pathname.startsWith("/license-expired")) {
    return NextResponse.next();
  }

  const license = await checkUserLicense(token.email);

  if (!license || license.licenseState !== "ACTIVE") {
    return NextResponse.redirect(new URL("/license-expired", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"], // samo app deo
};