import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const supabase = createRouteHandlerClient({ cookies });

		const { data, error } = await supabase
			.from("champion_bet")
			.select(`
        *,
        team:teams(*),
        user:profiles(avatar_url, name)
      `)
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

export async function POST(request: Request) {
	try {
		const supabase = createRouteHandlerClient({ cookies });
		const { team_id } = await request.json();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json(
				{ error: "Usuário não autenticado" },
				{ status: 401 },
			);
		}

		// Verificar se o usuário já tem um palpite
		const { data: existingBet, error: fetchError } = await supabase
			.from("champion_bet")
			.select("id")
			.eq("user_id", user.id)
			.single();

		if (fetchError && fetchError.code !== "PGRST116") {
			throw fetchError;
		}

		if (existingBet) {
			// Se já existe, atualiza
			const { error: updateError } = await supabase
				.from("champion_bet")
				.update({ team_id })
				.eq("id", existingBet.id);

			if (updateError) throw updateError;
		} else {
			// Se não existe, insere
			const { error: insertError } = await supabase
				.from("champion_bet")
				.insert({
					user_id: user.id,
					team_id,
				});

			if (insertError) throw insertError;
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Erro ao salvar palpite:", error);
		return NextResponse.json(
			{ error: "Erro ao salvar palpite" },
			{ status: 500 },
		);
	}
}
