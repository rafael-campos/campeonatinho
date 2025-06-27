"use client";

import { supabase } from "@/lib/supabase-client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { AlertCircle, Award, Clock, Trophy, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const router = useRouter();

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
			<div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
				{/* Coluna da Esquerda - Login */}
				<div className="bg-white shadow-lg rounded-lg overflow-hidden h-fit ">
					<div className="relative w-full h-[400px] shadow-md">
						<Image
							src="/palpit.png"
							alt="Palp.it"
							fill
							className="object-cover"
							priority
							quality={100}
						/>
					</div>
					<div className="p-8">
						<div className="text-center mb-8">
							<h1 className="text-2xl font-bold text-gray-900 mb-2">Palp.it</h1>
							<p className="text-gray-600">
								Entre com sua conta Google para começar
							</p>
						</div>
						<Auth
							supabaseClient={supabase}
							appearance={{
								theme: ThemeSupa,
								variables: {
									default: {
										colors: {
											brand: "#404040",
											brandAccent: "#262626",
										},
									},
								},
							}}
							providers={["google"]}
							redirectTo={
								typeof window !== "undefined"
									? `${window.location.origin}/auth/callback`
									: ""
							}
							view="sign_in"
							showLinks={false}
							onlyThirdPartyProviders={true}
							localization={{
								variables: {
									sign_in: {
										social_provider_text: "Entrar com Google",
									},
								},
							}}
						/>
					</div>
				</div>

				{/* Coluna da Direita - Regras */}
				<div className="bg-white shadow-lg rounded-lg p-8">
					<h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
						<Trophy className="w-6 h-6 text-yellow-500" />
						Regras do Bolão
					</h2>

					<div className="space-y-6">
						{/* Funcionamento Geral */}
						<div>
							<h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
								<Users className="w-5 h-5 text-gray-600" />
								Funcionamento Geral
							</h3>
							<ul className="list-disc list-inside text-gray-600 space-y-1">
								<li>Todos os jogos do Super Mundial disponíveis</li>
								<li>Valor de entrada: R$ 50,00 por participante</li>
								<li>Vencedor: maior pontuação total</li>
							</ul>
						</div>

						{/* Pontuação */}
						<div>
							<h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
								<Award className="w-5 h-5 text-gray-600" />
								Pontuação
							</h3>
							<ul className="space-y-2">
								<li className="flex items-center gap-2 text-gray-600">
									<span className="text-green-500 font-bold">✅</span>
									Acertou o placar exato: 3 pontos
								</li>
								<li className="flex items-center gap-2 text-gray-600">
									<span className="text-yellow-500 font-bold">🥇</span>
									Acertou apenas o vencedor: 1 ponto
								</li>
								<li className="flex items-center gap-2 text-gray-600">
									<span className="text-red-500 font-bold">❌</span>
									Errou tudo: 0 pontos
								</li>
							</ul>
						</div>

						{/* Time Brasileiro */}
						<div>
							<h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
								<span className="text-2xl">🇧🇷</span>
								Palpite bônus — Time brasileiro
							</h3>
							<p className="text-gray-600">
								30 pontos bônus divididos entre os acertadores do time
								brasileiro que for mais longe.
							</p>
						</div>

						{/* Importante */}
						<div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
							<h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
								<Clock className="w-5 h-5 text-yellow-600" />
								Importante
							</h3>
							<p className="text-gray-600">
								Palpites devem ser enviados até 1h antes do jogo. Após isso, o
								sistema bloqueia automaticamente.
							</p>
						</div>

						{/* Premiação */}
						<div>
							<h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
								<Award className="w-5 h-5 text-gray-600" />
								Premiação
							</h3>
							<p className="text-gray-600">
								Vencedor leva 100% do valor arrecadado no bolão.
							</p>
						</div>

						{/* Responsabilidades */}
						<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
							<h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
								<AlertCircle className="w-5 h-5 text-gray-600" />
								Responsabilidades
							</h3>
							<p className="text-gray-600">
								Não palpitou? Menos chance de vencer. A responsabilidade é
								inteiramente sua.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
