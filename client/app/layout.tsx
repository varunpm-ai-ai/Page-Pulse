import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Page Pulse",
  description: "Website health inspector",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
