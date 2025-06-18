'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { enTranslations } from '@/translations/en'
import { viTranslations } from '@/translations/vi'

export type Language = 'en' | 'vi'

export type Translations = typeof enTranslations

interface LanguageContextType {
	language: Language
	setLanguage: (lang: Language) => void
	t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined
)

const translations = {
	en: enTranslations,
	vi: viTranslations,
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
	const [language, setLanguage] = useState<Language>('vi') // Default to Vietnamese

	const value = {
		language,
		setLanguage,
		t: translations[language],
	}

	return (
		<LanguageContext.Provider value={value}>
			{children}
		</LanguageContext.Provider>
	)
}

export const useLanguage = () => {
	const context = useContext(LanguageContext)
	if (context === undefined) {
		throw new Error('useLanguage must be used within a LanguageProvider')
	}
	return context
}
