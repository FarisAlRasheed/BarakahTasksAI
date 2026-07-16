import type { Metadata } from "next";
import { Amiri, Aref_Ruqaa } from "next/font/google";
import "./globals.css";
import BackgroundElements from "@/components/BackgroundElements";
import Footer from "@/components/Footer";

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-amiri",
  display: "swap",
});

const arefRuqaa = Aref_Ruqaa({
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-aref-ruqaa",
  display: "swap",
});

export const metadata: Metadata = {
  title: "سِجل الدراسة — Study Flow",
  description:
    "نظّم جدولك الدراسي حول أوقات الصلاة بذكاء باستخدام الذكاء الاصطناعي",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${amiri.variable} ${arefRuqaa.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative z-0">
        <BackgroundElements />
        <main className="flex-1 flex flex-col relative z-10">
          {children}
        </main>
        <div className="relative z-10">
          <Footer />
        </div>
      </body>
    </html>
  );
}
