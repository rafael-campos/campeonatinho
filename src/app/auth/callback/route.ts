import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

import type { Database } from "@/types/supabase";
import { cookies } from "next/headers";

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");

	if (code) {
		const supabase = createRouteHandlerClient<Database>({ cookies });
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (error) {
			console.error(
				"callback route: Erro ao trocar código por sessão:",
				error.message,
			);
		}

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (user) {
			const { data: exists } = await supabase
				.from("profiles")
				.select("id")
				.eq("id", user.id)
				.maybeSingle();

			if (!exists) {
				await supabase.from("profiles").insert({
					id: user.id,
					name: user.user_metadata?.full_name ?? null,
					avatar_url: user.user_metadata?.avatar_url ?? null,
					created_at: new Date().toISOString(),
				});
			}
		}
	}

	const redirectUrl = new URL("/", request.url);
	return NextResponse.redirect(redirectUrl);
}
