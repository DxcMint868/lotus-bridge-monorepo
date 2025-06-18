import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Globe, ExternalLink, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

const networks = [
	{
		name: 'Ethereum',
		logo: '/chain-icons/ethereum.png',
		color: 'from-blue-400 to-blue-600',
	},
	{
		name: 'BSC',
		logo: '/chain-icons/bsc.png',
		color: 'from-yellow-400 to-yellow-600',
	},
	{
		name: 'Polygon',
		logo: '/chain-icons/polygon.png',
		color: 'from-purple-400 to-purple-600',
	},
	{
		name: 'Base',
		logo: '/chain-icons/base.png',
		color: 'from-blue-500 to-indigo-600',
	},
	{
		name: 'Arbitrum',
		logo: '/chain-icons/arbitrum.png',
		color: 'from-blue-400 to-blue-600',
	},
	{
		name: 'Optimism',
		logo: '/chain-icons/optimism.png',
		color: 'from-red-500 to-pink-600',
	},
]

type ChainStatus = 'testing' | 'development' | 'production'

const vietnameseChains = [
	{
		name: 'ndachain',
		status: 'testing' as ChainStatus,
		icon: 'https://s3-sgn10.fptcloud.com/phygix-assets/ndachain/logo_NDA_v1.png',
		color: 'from-white-500 to-yellow-500',
		website: 'https://ndachain.vn/',
	},
	{
		name: 'ronin',
		status: 'production' as ChainStatus,
		color: 'from-blue-500 to-blue-700',
		icon: 'https://d1k8z2xrei817b.cloudfront.net/images/logo/ronin-c9868d1a.png',
		website: 'https://roninchain.com/',
	},
	{
		name: 'onemount',
		status: 'development' as ChainStatus,
		color: 'from-white-500 to-yellow-500',
		icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLe0OrLLceAIGhVlCWOkjayXRCNpwuXkyd-w&s',
		website:
			'https://baochinhphu.vn/one-mount-group-nhan-nhiem-vu-xay-dung-mang-blockchain-layer-1-make-in-vietnam-10225011516435619.htm',
	},
]

export const NetworksSection = () => {
	const { t } = useLanguage()

	return (
		<section id="networks" className="py-20 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						<span className="bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
							{t.networks.title}
						</span>
					</h2>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						{t.networks.subtitle}
					</p>
				</div>

				{/* International Networks */}
				<div className="mb-16">
					<h3 className="text-2xl font-semibold text-center mb-8 text-gray-700">
						{t.networks.international}
					</h3>
					<div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-6">
						{networks.map((network, index) => (
							<Card
								key={index}
								className="backdrop-blur-md bg-white/40 border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
							>
								<CardContent className="p-6 text-center">
									<div
										className={`w-16 h-16 bg-gradient-to-br ${network.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
									>
										<Image
											src={network.logo || '/placeholder.svg'}
											alt={network.name}
											width={40}
											height={40}
											className="rounded-full"
										/>
									</div>
									<h3 className="font-semibold text-gray-700">
										{network.name}
									</h3>
								</CardContent>
							</Card>
						))}
					</div>

					{/* More Networks Indicator */}
					<div className="text-center mt-8">
						<Card className="backdrop-blur-md bg-white/30 border-white/20 max-w-2xl mx-auto">
							<CardContent className="p-6">
								<div className="flex items-center justify-center gap-3 mb-3">
									<div className="flex -space-x-2">
										<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white"></div>
										<div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full border-2 border-white"></div>
										<div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full border-2 border-white"></div>
										<div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
											<span className="text-xs font-bold text-gray-600">
												+10
											</span>
										</div>
									</div>
									<Globe className="w-5 h-5 text-gray-600" />
								</div>
								<p className="text-gray-700 font-medium mb-2">
									{t.networks.moreNetworks}
								</p>
								<p className="text-sm text-gray-600">{t.networks.upcoming}</p>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Vietnamese Blockchain Ecosystem */}
				<div className="mt-20">
					<div className="text-center mb-12">
						<div className="inline-flex items-center gap-3 mb-6">
							<h3 className="text-2xl font-bold text-gray-800">
								{t.networks.vietnamese.title}
							</h3>
						</div>
						<p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
							{t.networks.vietnamese.description.split('{madeInVietnam}')[0]}
							<span className="font-semibold text-red-600">
								{t.networks.vietnamese.madeInVietnam}
							</span>
							{t.networks.vietnamese.description.split('{madeInVietnam}')[1]}
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 mb-12">
						{vietnameseChains.map((chain, index) => (
							<Card
								key={index}
								className="group relative overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
							>
								{/* Status indicator */}
								<div className="absolute top-4 right-4">
									<span
										className={`px-2 py-1 rounded-full text-xs font-medium ${
											chain.status === 'development'
												? 'bg-blue-50 text-blue-700 border border-blue-200'
												: 'bg-green-50 text-green-700 border border-green-200'
										}`}
									>
										{(t.networks.vietnamese as any)[chain.status] ||
											chain.status}
									</span>
								</div>

								<CardContent className="p-6">
									<div className="flex items-start gap-4">
										<div
											className={`w-12 h-12 bg-gradient-to-br ${chain.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}
										>
											{chain.icon ? (
												<Image
													src={chain.icon || '/placeholder.svg'}
													alt="Blockchain Icon"
													width={30}
													height={30}
													className="rounded-full object-cover"
												/>
											) : (
												<span className="text-white font-bold text-lg">
													{chain.name.charAt(0)}
												</span>
											)}
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-2">
												<h4 className="font-semibold text-lg text-gray-900 truncate">
													{
														t.networks.vietnamese.chains[
															chain.name as keyof typeof t.networks.vietnamese.chains
														].name
													}
												</h4>
											</div>

											<p className="text-gray-600 text-sm leading-relaxed mb-4">
												{
													t.networks.vietnamese.chains[
														chain.name as keyof typeof t.networks.vietnamese.chains
													].description
												}
											</p>

											{chain.website !== '#' && (
												<Button
													size="sm"
													variant="outline"
													className="text-xs border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
													onClick={() => window.open(chain.website, '_blank')}
												>
													{t.networks.vietnamese.learnMore}
													<ExternalLink className="ml-1 w-3 h-3" />
												</Button>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Partnership CTA */}
					<Card className="bg-gradient-to-r from-red-50 to-yellow-50 border border-red-100">
						<CardContent className="p-8 text-center">
							<div className="max-w-3xl mx-auto">
								<div className="w-16 h-16 bg-gradient-to-r from-red-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
									<Users className="w-8 h-8 text-white" />
								</div>

								<h4 className="text-2xl font-bold text-gray-900 mb-4">
									{t.networks.partnership.title}
								</h4>

								<p className="text-lg text-gray-700 mb-6 leading-relaxed">
									{t.networks.partnership.description}
								</p>

								<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
									<Button
										size="lg"
										className="bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-white"
									>
										{t.networks.partnership.register}
										<Users className="ml-2 w-5 h-5" />
									</Button>
									<Button size="lg" variant="outline">
										<Link href="https://lotus-bridge-documentation.vercel.app/">
											{t.networks.partnership.documentation}
										</Link>
										<ExternalLink className="mr-2 w-4 h-4" />
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	)
}
