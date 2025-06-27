import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { game_id, home_guess, away_guess } = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const { error } = await supabase.from("guesses").upsert(
      {
        game_id,
        user_id: user.id,
        home_guess: Number(home_guess),
        away_guess: Number(away_guess),
      },
      { onConflict: "user_id,game_id" }
    );

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar palpite:", error);
    return NextResponse.json(
      { error: "Erro ao salvar palpite" },
      { status: 500 }
    );
  }
} 