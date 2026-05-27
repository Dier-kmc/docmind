import type { Metadata } from "next"
import "@/app/globals.css" // 🎯 CRITICAL: This line injects Tailwind back into your app!
import { ThemeProvider } from "@/components/theme-provider"
import { Manrope } from "next/font/google";
import { cn } from "@/lib/utils";

const manrope = Manrope({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "DocMind",
  description: "Interrogate your documents with AI",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", manrope.variable)}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}