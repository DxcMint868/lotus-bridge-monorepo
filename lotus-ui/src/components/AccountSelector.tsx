import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Copy, Check, Wallet, AlertCircle } from 'lucide-react'
import { useWalletAccounts } from '@/hooks/useWalletAccounts'
import { useTranslation } from '@/contexts/LanguageContext'

interface AccountSelectorProps {
	onSelectAccount: (address: string) => void
	selectedAddress?: string
	disabled?: boolean
}

const AccountSelector = ({
	onSelectAccount,
	selectedAddress,
	disabled,
}: AccountSelectorProps) => {
	const { t } = useTranslation()
	const { accounts, isLoading, currentAddress } = useWalletAccounts()
	const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
	const [isOpen, setIsOpen] = useState(false)

	const formatAddress = (address: string) => {
		return `${address.slice(0, 6)}...${address.slice(-4)}`
	}

	const handleCopyAddress = async (
		address: string,
		event: React.MouseEvent
	) => {
		event.stopPropagation()
		try {
			await navigator.clipboard.writeText(address)
			setCopiedAddress(address)
			setTimeout(() => setCopiedAddress(null), 2000)
		} catch (error) {
			console.error('Failed to copy address:', error)
		}
	}

	const handleSelectAccount = (address: string) => {
		onSelectAccount(address)
		setIsOpen(false)
	}

	// Show nothing if no accounts and not loading
	if (accounts.length === 0 && !isLoading) {
		return (
			<div className="flex items-center space-x-2 text-xs text-gray-500">
				<AlertCircle className="w-3 h-3" />
				<span>{t('bridge.noAccountsFound')}</span>
			</div>
		)
	}

	const selectedAccount = accounts.find(
		(acc) => acc.address.toLowerCase() === selectedAddress?.toLowerCase()
	)

	return (
		<div className="flex items-center space-x-2">
			<span className="text-sm text-gray-600 font-medium">
				{t('bridge.selectFromWallet')}:
			</span>
			<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						disabled={disabled || isLoading || accounts.length === 0}
						className="text-xs h-8 px-3 glass-button border-pink-200 text-gray-700 min-w-[120px]"
					>
						<Wallet className="w-3 h-3 mr-1" />
						{isLoading ? (
							<div className="flex items-center space-x-1">
								<div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
								<span>{t('bridge.loadingAccounts')}</span>
							</div>
						) : accounts.length === 0 ? (
							t('bridge.noAccountsFound')
						) : (
							<div className="flex items-center space-x-1 overflow-hidden">
								{selectedAccount ? (
									<>
										<span className="truncate">
											{formatAddress(selectedAccount.address)}
										</span>
										{selectedAccount.isConnected && (
											<div className="w-2 h-2 flex-shrink-0 bg-green-500 rounded-full"></div>
										)}
									</>
								) : (
									t('bridge.selectAccount')
								)}
								<ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
							</div>
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					className="w-72 glass-card max-w-[90vw]"
				>
					<div className="px-3 py-2 text-xs text-gray-500 font-medium">
						{t('bridge.availableAccounts')} ({accounts.length})
					</div>
					<DropdownMenuSeparator />
					<div className="max-h-[40vh] overflow-y-auto">
						{accounts.map((account, index) => (
							<DropdownMenuItem
								key={account.address}
								className="flex items-start justify-between p-3 cursor-pointer hover:bg-white/20 focus:bg-white/20"
								onClick={() => handleSelectAccount(account.address)}
							>
								<div className="flex flex-col space-y-1 flex-1 min-w-0">
									<div className="flex items-center flex-wrap gap-2">
										<span className="text-sm font-medium truncate">
											{formatAddress(account.address)}
										</span>
										<div className="flex flex-wrap gap-1">
											{account.isConnected && (
												<span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full whitespace-nowrap">
													{t('bridge.connected')}
												</span>
											)}
											{selectedAddress?.toLowerCase() ===
												account.address.toLowerCase() && (
												<span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">
													{t('bridge.selected')}
												</span>
											)}
										</div>
									</div>
									<span className="text-xs text-gray-500 font-mono truncate">
										{account.address}
									</span>
								</div>
								<Button
									variant="ghost"
									size="sm"
									className="h-6 w-6 p-0 hover:bg-gray-100 flex-shrink-0 ml-2"
									onClick={(e) => handleCopyAddress(account.address, e)}
								>
									{copiedAddress === account.address ? (
										<Check className="w-3 h-3 text-green-600" />
									) : (
										<Copy className="w-3 h-3 text-gray-400" />
									)}
								</Button>
							</DropdownMenuItem>
						))}
						{accounts.length === 0 && !isLoading && (
							<div className="px-3 py-4 text-center text-xs text-gray-500">
								{t('bridge.noAccountsAvailable')}
							</div>
						)}
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}

export default AccountSelector
