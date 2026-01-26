import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Mundial 2026 - Predicciones | Compite con tus amigos",
  description: "Participa en la mejor plataforma de predicciones del Mundial 2026. Predice resultados, compite con amigos y gana premios. Fase de grupos, eliminatorias y final.",
  keywords: ["mundial 2026", "predicciones mundial", "quiniela mundial", "copa del mundo 2026", "predicciones futbol", "USA Mexico Canada 2026"],
  authors: [{ name: "Mundial 2026 Predicciones" }],
  openGraph: {
    title: "Mundial 2026 - Predicciones",
    description: "Participa en la mejor plataforma de predicciones del Mundial 2026. Predice resultados, compite con amigos y gana premios.",
    type: "website",
    locale: "es_ES",
    siteName: "Mundial 2026 Predicciones",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mundial 2026 - Predicciones",
    description: "Participa en la mejor plataforma de predicciones del Mundial 2026.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="canonical" href="https://mundial2026.fun" />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
