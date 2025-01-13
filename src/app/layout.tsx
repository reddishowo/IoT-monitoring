import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";

export const metadata: Metadata = {
  title: "Traffic Monitoring System",
  description: "Real-time traffic monitoring system with MQTT integration",
  keywords: ["traffic", "monitoring", "real-time", "mqtt", "sensors"],
  authors: [{ name: "Traffic System" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="id" data-theme="light" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-base-100 font-sans antialiased">
        <main className="relative flex min-h-screen flex-col">
          <div className="flex-1 flex-grow">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
