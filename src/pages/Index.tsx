import Header from '../components/Header'
import BridgeInterface from '../components/BridgeInterface'
import TransactionHistory from '../components/TransactionHistory'
import WalletStatus from '../components/WalletStatus'
import Footer from '../components/Footer'
import { useTranslation } from '@/contexts/LanguageContext'

const Index = () => {
	const { t } = useTranslation()

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5 dong-son-pattern">
			<Header />
			<main className="container mx-auto px-4 py-8 space-y-8">
				<div className="text-center mb-12">
					<div className="flex justify-center">
						<img
							width={'25%'}
							height={'25%'}
							src="/logos/lotus-glass-1.png"
							alt="Lotus Bridge Logo"
							className="object-contain"
						/>
					</div>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
	)
}

export default Index
