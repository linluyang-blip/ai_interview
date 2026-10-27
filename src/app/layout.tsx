import type { Metadata } from "next";
import { Instrument_Serif, Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

// 中文字型沒有 chinese subset 可預載，交給瀏覽器依需要分段下載
const sans = Noto_Sans_TC({
  variable: "--font-sans-tc",
  preload: false,
});

const serif = Noto_Serif_TC({
  variable: "--font-serif-tc",
  preload: false,
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rehearse｜AI 面試演練",
  description: "貼上職缺描述，AI 面試官即時提問、追問，最後給你評分與逐題示範回答。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      className={`${sans.variable} ${serif.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
