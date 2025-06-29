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

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			// Se não houver usuário, retorna uma lista vazia, pois não há palpite para mostrar.
			return NextResponse.json({ data: [] });
		}

		// 1. Buscar detalhes do jogo para verificar se já tem placar
		const { data: game, error: gameError } = await supabase
			.from("games")
			.select("home_score, away_score")
			.eq("id", gameId)
			.single();

		if (gameError || !game) {
			return NextResponse.json(
				{ error: "Jogo não encontrado" },
				{ status: 404 },
			);
		}

		// 2. Verificar se o jogo já tem um placar final
		const hasResult = game.home_score !== null && game.away_score !== null;

		let query = supabase
			.from("guesses")
			.select(
				`
        *,
        profiles(name, avatar_url)
      `,
			)
			.eq("game_id", gameId);

		// 3. Se o jogo não tiver resultado, mostrar apenas o palpite do usuário logado
		if (!hasResult) {
			query = query.eq("user_id", user.id);
		}

		const { data, error } = await query.order("created_at", {
			ascending: false,
		});

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
