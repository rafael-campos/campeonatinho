import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const supabase = createRouteHandlerClient({ cookies });
		const { game_id, home_score, away_score } = await request.json();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json(
				{ error: "Usuário não autenticado" },
				{ status: 401 },
			);
		}

		// Verifica se o usuário tem permissão para atualizar o resultado
		if (user.id !== "631aa0ad-e28f-46cc-b655-bb141c04488a") {
			return NextResponse.json(
				{ error: "Usuário não tem permissão para atualizar resultados" },
				{ status: 403 },
			);
		}

		const { error } = await supabase
			.from("games")
			.update({
				home_score: Number(home_score),
				away_score: Number(away_score),
			})
			.eq("id", game_id);

		if (error) {
			throw error;
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Erro ao atualizar resultado:", error);
		return NextResponse.json(
			{ error: "Erro ao atualizar resultado" },
			{ status: 500 },
		);
	}
}
