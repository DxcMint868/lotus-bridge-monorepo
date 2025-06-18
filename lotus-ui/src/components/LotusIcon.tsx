import React from 'react'

interface LotusIconProps {
	size?: number
	className?: string
}

const LotusIcon: React.FC<LotusIconProps> = ({ size = 24, className = '' }) => {
	return (
		<image
			width={size}
			height={size}
			href="/logs/lotus-glass-1.png"
			className={className}
		/>
		// <svg
		// 	width={size}
		// 	height={size}
		// 	viewBox="0 0 24 24"
		// 	fill="none"
		// 	xmlns="http://www.w3.org/2000/svg"
		// 	className={`${className}`}
		// >
		// 	<defs>
		// 		<linearGradient id="lotusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
		// 			<stop offset="0%" stopColor="#ec4899" />
		// 			<stop offset="50%" stopColor="#f472b6" />
		// 			<stop offset="100%" stopColor="#22c55e" />
		// 		</linearGradient>
		// 	</defs>

		// 	{/* Lotus Petals */}
		// 	<path
		// 		d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z"
		// 		fill="url(#lotusGradient)"
		// 		opacity="0.9"
		// 	/>
		// 	<path
		// 		d="M6 8C6 8 2 10 2 14C2 16.21 3.79 18 6 18C8.21 18 10 16.21 10 14C10 12 6 8 6 8Z"
		// 		fill="url(#lotusGradient)"
		// 		opacity="0.7"
		// 	/>
		// 	<path
		// 		d="M18 8C18 8 22 10 22 14C22 16.21 20.21 18 18 18C15.79 18 14 16.21 14 14C14 12 18 8 18 8Z"
		// 		fill="url(#lotusGradient)"
		// 		opacity="0.7"
		// 	/>
		// 	<path
		// 		d="M8 16C8 16 6 20 10 22C12.21 22 14 20.21 14 18C14 15.79 12.21 14 10 14C10 14 8 16 8 16Z"
		// 		fill="url(#lotusGradient)"
		// 		opacity="0.6"
		// 	/>
		// 	<path
		// 		d="M16 16C16 16 18 20 14 22C11.79 22 10 20.21 10 18C10 15.79 11.79 14 14 14C14 14 16 16 16 16Z"
		// 		fill="url(#lotusGradient)"
		// 		opacity="0.6"
		// 	/>

		// 	{/* Center Circle */}
		// 	<circle cx="12" cy="12" r="2" fill="url(#lotusGradient)" />
		// </svg>
	)
}

export default LotusIcon
