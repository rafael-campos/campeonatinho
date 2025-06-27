import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	try {
		const cookieStore = cookies();
		const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
		const { searchParams } = new URL(request.url);
		const gameId = searchParams.get("gameId");

		if (!gameId) {
			return NextResponse.json(
				{ error: "ID do jogo não fornecido" },
				{ status: 400 },
			);
		}

		const { data, error } = await supabase
			.from("guesses")
			.select(`
        *,
        profiles(name, avatar_url)
      `)
			.eq("game_id", gameId)
			.order("created_at", { ascending: false });

		if (error) {
			throw error;
		}

		return NextResponse.json({ data });
	} catch (error) {
		console.error("Erro ao carregar palpites:", error);
		return NextResponse.json(
			{ error: "Erro ao carregar palpites" },
			{ status: 500 },
		);
	}
}
