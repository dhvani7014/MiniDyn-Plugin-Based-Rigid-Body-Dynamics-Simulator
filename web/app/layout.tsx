import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MiniDyn: Plugin Based 3D Rigid Body Dynamics Simulator",
  description: "C++17 multibody dynamics engine compiled to WebAssembly, running a real time pendulum simulation with live energy and constraint error telemetry.",
  openGraph: {
    title: "MiniDyn: Plugin Based 3D Rigid Body Dynamics Simulator",
    description: "C++17 multibody dynamics engine compiled to WebAssembly, running a real time pendulum simulation with live energy and constraint error telemetry.",
    url: "https://mini-dyn-plugin-based-rigid-body-dynamics-sim-git-c01028-dd7014.vercel.app/",
    siteName: "MiniDyn Simulator",
    images: [
      {
        url: "https://mini-dyn-plugin-based-rigid-body-dynamics-sim-git-c01028-dd7014.vercel.app/og-image.png",
        width: 1200,
        height: 600,
        alt: "MiniDyn 3D Physics Simulator Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MiniDyn: Plugin Based 3D Rigid Body Dynamics Simulator",
    description: "C++17 multibody dynamics engine compiled to WebAssembly, running a real time pendulum simulation with live energy and constraint error telemetry.",
    images: ["https://mini-dyn-plugin-based-rigid-body-dynamics-sim-git-c01028-dd7014.vercel.app/og-image.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
