import Header from '../components/Header'
import BridgeInterface from '../components/BridgeInterface'
import TransactionHistory from '../components/TransactionHistory'
import WalletStatus from '../components/WalletStatus'
import Footer from '../components/Footer'
import { useTranslation } from '@/contexts/LanguageContext'

const Index = () => {
	const { t } = useTranslation()

	return (
		<div className="min-h-screen relative">
			{/* Sticky Header */}
			<div className="sticky top-0 z-50">
				<Header />
			</div>

			{/* Main Content with Background */}
			<div className="relative overflow-hidden bg-slate-50">
				{/* Modern Background Layer */}
				<div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20"></div>

				{/* Geometric Shapes */}
				<div className="absolute inset-0 opacity-40">
					{/* Large circles */}
					<div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/20 rounded-full blur-3xl"></div>
					<div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-purple-200/30 to-pink-200/20 rounded-full blur-3xl"></div>
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-100/20 to-blue-100/20 rounded-full blur-3xl"></div>

					{/* Medium floating elements */}
					{/* <div className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-300/20 to-cyan-300/15 rounded-2xl rotate-12 blur-xl"></div>
				<div className="absolute bottom-40 right-1/4 w-24 h-24 bg-gradient-to-br from-purple-300/20 to-pink-300/15 rounded-full blur-lg"></div>
				<div className="absolute top-1/3 right-1/3 w-40 h-20 bg-gradient-to-r from-indigo-200/25 to-blue-200/20 rounded-full rotate-45 blur-xl"></div> */}

					{/* Small accent shapes */}
					{/* <div className="absolute top-32 right-20 w-16 h-16 bg-gradient-to-br from-cyan-400/30 to-blue-400/25 rounded-lg rotate-45 blur-sm"></div>
				<div className="absolute bottom-20 left-20 w-12 h-12 bg-gradient-to-br from-purple-400/30 to-indigo-400/25 rounded-full blur-sm"></div> */}
				</div>

				{/* Subtle Grid Pattern */}
				<div
					className="absolute inset-0 opacity-[0.02]"
					style={{
						backgroundImage: `radial-gradient(circle at 1px 1px, rgb(51, 65, 85) 1px, transparent 0)`,
						backgroundSize: '40px 40px',
					}}
				></div>

				{/* Noise Texture Overlay */}
				<div
					className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
					}}
				></div>

				{/* Content */}
				<div className="relative z-10">
					<main className="container mx-auto px-4 py-8 space-y-8">
						<div className="text-center mb-12">
							<div className="flex justify-center mb-6">
								<div className="relative">
									{/* Logo glow effect */}
									{/* <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl scale-110"></div> */}
									<img
										width={'50%'}
										height={'50%'}
										src="/logos/lotus-glass-1.png"
										alt="Lotus Bridge Logo"
										className="object-contain relative z-10 mx-auto"
									/>
								</div>
							</div>
							<p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
								{t('bridge.subtitle')}
							</p>
						</div>

						<div className="grid lg:grid-cols-3 gap-8">
							<div className="lg:col-span-2 space-y-6">
								<BridgeInterface />
							</div>

							<div className="space-y-6">
								<WalletStatus />
								<TransactionHistory />
							</div>
						</div>
					</main>
					<Footer />
				</div>

				{/* Floating Animation Elements */}
				<div className="absolute inset-0 pointer-events-none overflow-hidden">
					{/* Animated particles */}
					<div className="absolute top-1/4 left-1/6 w-2 h-2 bg-blue-400/40 rounded-full animate-pulse"></div>
					<div
						className="absolute top-3/4 right-1/5 w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-pulse"
						style={{ animationDelay: '1s' }}
					></div>
					<div
						className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-cyan-400/40 rounded-full animate-pulse"
						style={{ animationDelay: '2s' }}
					></div>
					<div
						className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-indigo-400/40 rounded-full animate-pulse"
						style={{ animationDelay: '3s' }}
					></div>

					{/* Slow floating shapes */}
					<div
						className="absolute top-20 left-1/5 w-6 h-6 border border-blue-300/30 rounded-full animate-bounce"
						style={{ animationDuration: '6s' }}
					></div>
					<div
						className="absolute bottom-32 right-1/6 w-4 h-4 border border-purple-300/30 rounded-full animate-bounce"
						style={{ animationDuration: '8s', animationDelay: '2s' }}
					></div>
				</div>
			</div>
		</div>
	)
}

export default Index
