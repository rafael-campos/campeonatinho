import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // --- START: Logic for Furthest Brazilian Team Bonus ---
    // TODO: Este ID precisa ser atualizado manualmente ou via uma interface de administração
    // assim que o torneio progredir e o time brasileiro que for mais longe for conhecido.
    // Para testes, você pode defini-lo para um ID de um time brasileiro da sua tabela 'teams'.
    const FURTHEST_BRAZILIAN_TEAM_ID = ""; // Ex: "e82bb843-1d9f-4c0f-a949-e7b4f5d7f100" para o Palmeiras
    // --- END: Logic for Furthest Brazilian Team Bonus ---
    
    // Buscar todos os perfis
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    if (profilesError) throw profilesError;

    // Buscar todos os jogos finalizados
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("*")
      .not("home_score", "is", null)
      .not("away_score", "is", null);

    if (gamesError) throw gamesError;

    // Buscar todos os palpites
    const { data: guesses, error: guessesError } = await supabase
      .from("guesses")
      .select("*, user_id, game_id, home_guess, away_guess");

    if (guessesError) throw guessesError;

    // Buscar todos os palpites de time brasileiro
    const { data: brazilBets, error: brazilBetsError } = await supabase
      .from("brazil_bet")
      .select("user_id, team_id");

    if (brazilBetsError) throw brazilBetsError;

    const brazilBetsMap = new Map(brazilBets.map(bet => [bet.user_id, bet.team_id]));


    // Calcular pontuação para cada perfil
    const leaderboardData = profiles.map((profile) => {
      const userGuesses = guesses.filter((g) => g.user_id === profile.id);
      let exactScoreHits = 0;
      let winnerHits = 0;
      let brazilBonusPoints = 0; // Initialize bonus points

      userGuesses.forEach((guess) => {
        const game = games.find((g) => g.id === guess.game_id);
        if (!game) return;

        // Verificar acerto exato do placar
        if (
          guess.home_guess === game.home_score &&
          guess.away_guess === game.away_score
        ) {
          exactScoreHits++;
        }
        // Verificar acerto do vencedor
        else {
          const guessWinner =
            guess.home_guess > guess.away_guess
              ? "home"
              : guess.home_guess < guess.away_guess
                ? "away"
                : "draw";
          const actualWinner =
            (game.home_score ?? 0) > (game.away_score ?? 0)
              ? "home"
              : (game.home_score ?? 0) < (game.away_score ?? 0)
                ? "away"
                : "draw";

          if (guessWinner === actualWinner) {
            winnerHits++;
          }
        }
      });

      // Adicionar pontos bônus para o palpite do time brasileiro
      const userBrazilBetTeamId = brazilBetsMap.get(profile.id);
      if (userBrazilBetTeamId && userBrazilBetTeamId === FURTHEST_BRAZILIAN_TEAM_ID) {
          brazilBonusPoints = 3;
      }

      return {
        profile,
        exactScoreHits,
        winnerHits,
        totalPoints: exactScoreHits * 3 + winnerHits + brazilBonusPoints, // Adicionar pontos bônus aqui
      };
    });

    // Ordenar por pontuação total (decrescente)
    leaderboardData.sort((a, b) => {
      // Primeiro ordena por pontuação
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      // Em caso de empate, ordena alfabeticamente
      return (a.profile.name || "").localeCompare(b.profile.name || "");
    });

    return NextResponse.json({ data: leaderboardData });
  } catch (error) {
    console.error("Erro ao carregar leaderboard:", error);
    return NextResponse.json(
      { error: "Erro ao carregar leaderboard" },
      { status: 500 }
    );
  }
} 