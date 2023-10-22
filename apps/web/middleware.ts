import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
	function middleware(request) {
		if (request.nextUrl.pathname === "/")
			return NextResponse.rewrite(new URL("/trending", request.url));

		if (request.nextUrl.pathname === "/profile") {
			if (request.nextauth.token?.username)
				return NextResponse.rewrite(
					new URL(`/profile/${request.nextauth.token.username}`, request.url),
				);
			return NextResponse.rewrite(new URL("/auth", request.url));
		}
		return NextResponse.next();
	},
	{ pages: { signIn: "/auth", signOut: "/auth", error: "/auth" } },
);

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
