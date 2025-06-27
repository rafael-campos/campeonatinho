import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import type { Database } from "./types/supabase";

export async function middleware(req: NextRequest) {
	const res = NextResponse.next();
	const supabase = createMiddlewareClient<Database>({ req, res });

	const {
		data: { session },
	} = await supabase.auth.getSession();

	const url = new URL(req.url);

	// ✅ Libera totalmente a rota de callback OAuth
	if (url.pathname.startsWith("/auth/callback")) {
		return res;
	}

	if (session) {
		if (url.pathname === "/login") {
			url.pathname = "/";
			return NextResponse.redirect(url);
		}
	} else {
		if (url.pathname !== "/login") {
			url.pathname = "/login";
			return NextResponse.redirect(url);
		}
	}

	return res;
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)",
	],
};
