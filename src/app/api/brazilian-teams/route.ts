import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    let currentUserBetTeamId: string | null = null;

    // Carregar times
    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("*")
      .eq("is_brazilian", true)
      .order("name");

    if (teamsError) {
      throw teamsError;
    }

    // Se houver usuário logado, carregar palpite
    if (user) {
      const { data: existingBet, error: fetchError } = await supabase
        .from("brazil_bet")
        .select("team_id")
        .eq("user_id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }
      
      if (existingBet) {
        currentUserBetTeamId = existingBet.team_id;
      }
    }

    // Reordenar times se houver um palpite de usuário
    let teams = teamsData || [];
    if (currentUserBetTeamId) {
      const userTeam = teams.find(team => team.id === currentUserBetTeamId);
      if (userTeam) {
        const otherTeams = teams.filter(team => team.id !== currentUserBetTeamId);
        teams = [userTeam, ...otherTeams];
      }
    }

    return NextResponse.json({ teams, userBetTeamId: currentUserBetTeamId });
  } catch (error) {
    console.error("Erro ao carregar times:", error);
    return NextResponse.json(
      { error: "Erro ao carregar times" },
      { status: 500 }
    );
  }
} 