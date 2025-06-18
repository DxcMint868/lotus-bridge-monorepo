import Link from 'next/link'
import { AlternativeLogo } from '../decoration/AlternativeLogo'
import { useLanguage } from '@/contexts/LanguageContext'

export const Footer = () => {
	const { t } = useLanguage()

	return (
		<footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					<div className="lg:col-span-1">
						<div className="flex items-center space-x-3 mb-4">
							<div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center">
								<AlternativeLogo />
							</div>
							<span className="text-2xl font-bold">Lotus Bridge</span>
						</div>
						<p className="text-gray-300 mb-4 max-w-md">
							{t.footer.description}
						</p>
						<p className="text-pink-400 font-medium">{t.footer.madeWithLove}</p>
					</div>

					<div>
						<h3 className="text-lg font-bold mb-4">
							{t.footer.products.title}
						</h3>
						<ul className="space-y-2 text-gray-300">
							<li>
								<a href="#" className="hover:text-pink-400 transition-colors">
									{t.footer.products.bridge}
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-pink-400 transition-colors">
									{t.footer.products.swap}
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-pink-400 transition-colors">
									{t.footer.products.api}
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-pink-400 transition-colors">
									{t.footer.products.sdk}
								</a>
							</li>
						</ul>
					</div>

					<div>
						<h3 className="text-lg font-bold mb-4">{t.footer.support.title}</h3>
						<ul className="space-y-2 text-gray-300">
							<li>
								<a
									href="https://lotus-bridge-documentation.vercel.app/"
									className="hover:text-pink-400 transition-colors"
								>
									{t.footer.support.documentation}
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-pink-400 transition-colors">
									{t.footer.support.faq}
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-pink-400 transition-colors">
									{t.footer.support.contact}
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-pink-400 transition-colors">
									{t.footer.support.reportBug}
								</a>
							</li>
						</ul>
					</div>

					<div>
						<h3 className="text-lg font-bold mb-4">
							{t.footer.community.title}
						</h3>
						<ul className="space-y-2 text-gray-300">
							<li>
								<a href="#" className="hover:text-pink-400 transition-colors">
									{t.footer.community.telegram}
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-pink-400 transition-colors">
									{t.footer.community.discord}
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-pink-400 transition-colors">
									{t.footer.community.twitter}
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-pink-400 transition-colors">
									{t.footer.community.facebook}
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
					<p>{t.footer.copyright}</p>
				</div>
			</div>
		</footer>
	)
}
