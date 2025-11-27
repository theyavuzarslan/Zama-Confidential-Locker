'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Lock, TrendingUp, Shield } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Sidebar() {
    const pathname = usePathname()
    const { address, isConnected } = useAccount()
    const { connect, connectors } = useConnect()
    const { disconnect } = useDisconnect()

    const navigation = [
        { name: 'Locker', href: '/', icon: Lock },
        { name: 'Buyback', href: '/buyback', icon: TrendingUp },
        { name: 'Compliance', href: '/compliance', icon: Shield },
    ]

    return (
        <div className="flex h-screen w-64 flex-col border-r border-gray-800 bg-gray-950">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-gray-800 px-6">
                <h1 className="text-xl font-bold text-white">Confidential</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Wallet Connection */}
            <div className="border-t border-gray-800 p-4">
                {isConnected ? (
                    <div className="space-y-2">
                        <div className="rounded-lg bg-gray-800 p-3">
                            <p className="text-xs text-gray-400">Connected</p>
                            <p className="mt-1 font-mono text-sm text-white">
                                {address?.slice(0, 6)}...{address?.slice(-4)}
                            </p>
                        </div>
                        <button
                            onClick={() => disconnect()}
                            className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => connect({ connector: connectors[0] })}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Connect Wallet
                    </button>
                )}
            </div>
        </div>
    )
}
