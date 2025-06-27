import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

if (process.env.NODE_ENV === "development") {
	const originalError = console.error;
	console.error = (...args) => {
		if (
			typeof args[0] === "string" &&
			args[0].includes("Hydration failed because the server rendered HTML didn't match the client")
		) {
			// Ignora o erro de hydration em dev
			return;
		}
		originalError(...args);
	};
}

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Rafa.bet - Bolão do Super Mundial de Clubes 2025",
	description:
		"Participe do bolão mais insano do Super Mundial de Clubes! Dê seus palpites, acumule pontos e concorra ao prêmio total. Simples, direto e competitivo.",
	openGraph: {
		title: "Rafa.bet - Bolão do Super Mundial de Clubes 2025",
		description:
			"Participe do bolão mais insano do Super Mundial de Clubes! Dê seus palpites, acumule pontos e concorra ao prêmio total. Simples, direto e competitivo.",
		url: "https://palp-it.vercel.app",
		siteName: "Rafa.bet",
		images: [
			{
				url: "https://palp-it.vercel.app/og-image.png",
				width: 1200,
				height: 630,
				alt: "Rafa.bet - Bolão",
			},
		],
		locale: "pt_BR",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Rafa.bet - Bolão do Super Mundial de Clubes 2025",
		description:
			"Dê seus palpites e dispute o prêmio total. Entrada R$50. Vencedor leva tudo!",
		images: ["https://palp-it.vercel.app/og-image.png"],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}