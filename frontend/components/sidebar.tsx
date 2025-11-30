'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Lock, TrendingUp, Shield, Wallet } from 'lucide-react'
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
        <div className="flex h-screen w-72 flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl">
            {/* Logo */}
            <div className="flex h-20 items-center px-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
                        <Lock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">Confidential</h1>
                        <p className="text-xs text-gray-400">Locker Protocol</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 px-4 py-8">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-white/10 text-white shadow-lg shadow-black/20 backdrop-blur-sm'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Wallet Connection */}
            <div className="border-t border-white/10 p-6">
                {isConnected ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 backdrop-blur-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-700 to-gray-800">
                                <Wallet className="h-5 w-5 text-gray-300" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400">Connected</p>
                                <p className="font-mono text-sm font-bold text-white">
                                    {address?.slice(0, 6)}...{address?.slice(-4)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => disconnect()}
                            className="w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                        >
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => connect({ connector: connectors[0] })}
                        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
                    >
                        Connect Wallet
                    </button>
                )}
            </div>
        </div>
    )
}
