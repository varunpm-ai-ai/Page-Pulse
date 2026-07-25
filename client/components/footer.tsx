"use client"

import Link from "next/link"

export function Footer() {
	return (
		<footer className="border-t border-border/60 bg-background/95 px-4 py-6 backdrop-blur supports-backdrop-filter:bg-background/80">
			<div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
				<p className="text-sm text-muted-foreground">
					Page Pulse · audit reports
				</p>

				<div className="flex items-center gap-4 text-sm text-muted-foreground">
					<Link href="/" className="transition-colors hover:text-foreground">
						Home
					</Link>
					<a
						href="https://github.com/varunpm-ai-ai/Page-Pulse"
						target="_blank"
						rel="noreferrer"
						className="transition-colors hover:text-foreground"
					>
						GitHub
					</a>
				</div>
			</div>
		</footer>
	)
}

export default Footer
