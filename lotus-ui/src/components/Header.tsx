import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import WalletConnection from './WalletConnection'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from '@/contexts/LanguageContext'

const Header = () => {
	const { t } = useTranslation()
	const [isDark, setIsDark] = useState(false)

	useEffect(() => {
		// Check for saved theme preference or default to light mode
		const savedTheme = localStorage.getItem('theme')
		const prefersDark = window.matchMedia(
			'(prefers-color-scheme: dark)'
		).matches

		if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
			setIsDark(true)
			document.documentElement.classList.add('dark')
		}
	}, [])

	const toggleTheme = () => {
		const newTheme = !isDark
		setIsDark(newTheme)

		if (newTheme) {
			document.documentElement.classList.add('dark')
			localStorage.setItem('theme', 'dark')
		} else {
			document.documentElement.classList.remove('dark')
			localStorage.setItem('theme', 'light')
		}
	}

	return (
		<header className="sticky top-0 z-50 glass-card border-b border-white/20 shadow-lg">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					{/* Logo Section */}
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 rounded-full lotus-gradient lotus-gradient-logo gradient-animate spin-on-hover lotus-float flex items-center justify-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								className="lucide lucide-flower w-4 h-4 text-white"
							>
								<circle cx="12" cy="12" r="3"></circle>
								<path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"></path>
								<path d="M12 7.5V9"></path>
								<path d="M7.5 12H9"></path>
								<path d="M16.5 12H15"></path>
								<path d="M12 16.5V15"></path>
								<path d="m8 8 1.88 1.88"></path>
								<path d="M14.12 9.88 16 8"></path>
								<path d="m8 16 1.88-1.88"></path>
								<path d="M14.12 14.12 16 16"></path>
							</svg>
						</div>
						<div>
							<h1 className="text-2xl font-bold text-[#26282A]">Lotus Bridge</h1>
							<p className="text-xs text-muted-foreground hidden sm:block">
								{t('header.subtitle')}
							</p>
						</div>
					</div>

					{/* Navigation Controls */}
					<div className="flex items-center space-x-4">
						{/* Theme Toggle */}
						<Button
							variant="outline"
							size="sm"
							onClick={toggleTheme}
							className="hidden sm:flex glass-button border-white/30"
						>
							<span className="text-sm">{isDark ? '☀️' : '🌙'}</span>
						</Button>

						{/* Language Switcher */}
						<div className="hidden sm:block">
							<LanguageSwitcher />
						</div>

						{/* Wallet Connection */}
						<WalletConnection />
					</div>
				</div>
			</div>
		</header>
	)
}

export default Header
