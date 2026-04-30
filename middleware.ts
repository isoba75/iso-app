export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/((?!api/auth|login|preview|dashboard|_next/static|_next/image|favicon.ico).*)"],
};
