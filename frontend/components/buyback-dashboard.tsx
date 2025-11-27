'use client'

import { useState } from 'react'
import { TrendingUp, DollarSign, Clock } from 'lucide-react'

export function BuybackDashboard() {
    const [activeTab, setActiveTab] = useState<'configure' | 'execute'>('configure')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Buyback & TWAP</h1>
                <p className="mt-2 text-gray-400">
                    Automate token buybacks with encrypted strategies
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-800">
                <button
                    onClick={() => setActiveTab('configure')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'configure'
                            ? 'border-b-2 border-blue-500 text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Configure
                </button>
                <button
                    onClick={() => setActiveTab('execute')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'execute'
                            ? 'border-b-2 border-blue-500 text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Execute
                </button>
            </div>

            {/* Content */}
            {activeTab === 'configure' ? <ConfigureBuyback /> : <ExecuteBuyback />}
        </div>
    )
}

function ConfigureBuyback() {
    return (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
            <div className="space-y-6">
                {/* Stablecoin Address */}
                <div>
                    <label className="block text-sm font-medium text-gray-300">
                        Stablecoin Address
                    </label>
                    <input
                        type="text"
                        placeholder="0x..."
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                </div>

                {/* Project Token Address */}
                <div>
                    <label className="block text-sm font-medium text-gray-300">
                        Project Token Address
                    </label>
                    <input
                        type="text"
                        placeholder="0x..."
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                </div>

                {/* Buyback Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-300">
                        Buyback Amount (per interval)
                    </label>
                    <input
                        type="number"
                        placeholder="0.0"
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Amount of stablecoin to spend per buyback execution
                    </p>
                </div>

                {/* Interval */}
                <div>
                    <label className="block text-sm font-medium text-gray-300">
                        Interval (seconds)
                    </label>
                    <input
                        type="number"
                        placeholder="86400"
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Time between buybacks (e.g., 86400 = 1 day)
                    </p>
                </div>

                {/* Target Price */}
                <div>
                    <label className="block text-sm font-medium text-gray-300">
                        Target Price (Optional)
                    </label>
                    <input
                        type="number"
                        placeholder="0"
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Only execute buyback if price is below this threshold
                    </p>
                </div>

                {/* Submit Button */}
                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
                    <TrendingUp className="h-5 w-5" />
                    Configure Buyback
                </button>

                {/* Info Box */}
                <div className="rounded-lg bg-blue-950/30 border border-blue-900/50 p-4">
                    <p className="text-sm text-blue-300">
                        <strong>Privacy Note:</strong> Your buyback strategy (amount, interval, price target)
                        will be encrypted. Market observers won't be able to predict your buyback schedule.
                    </p>
                </div>
            </div>
        </div>
    )
}

function ExecuteBuyback() {
    return (
        <div className="space-y-6">
            {/* Current Status */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                    <div className="flex items-center gap-3">
                        <DollarSign className="h-8 w-8 text-blue-500" />
                        <div>
                            <p className="text-sm text-gray-400">Treasury Balance</p>
                            <p className="text-2xl font-bold text-white">Encrypted</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                    <div className="flex items-center gap-3">
                        <Clock className="h-8 w-8 text-green-500" />
                        <div>
                            <p className="text-sm text-gray-400">Next Buyback</p>
                            <p className="text-2xl font-bold text-white">Encrypted</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="h-8 w-8 text-purple-500" />
                        <div>
                            <p className="text-sm text-gray-400">Status</p>
                            <p className="text-2xl font-bold text-green-400">Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Manual Execution */}
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                <h3 className="text-lg font-semibold text-white">Manual Execution</h3>
                <p className="mt-2 text-sm text-gray-400">
                    Trigger a buyback manually by providing the current price
                </p>
                <div className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            Current Price
                        </label>
                        <input
                            type="number"
                            placeholder="0.0"
                            className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <button className="w-full rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700">
                        Execute Buyback
                    </button>
                </div>
            </div>

            {/* Deposit Funds */}
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                <h3 className="text-lg font-semibold text-white">Deposit Funds</h3>
                <p className="mt-2 text-sm text-gray-400">
                    Add stablecoins to the buyback treasury
                </p>
                <div className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            Amount
                        </label>
                        <input
                            type="number"
                            placeholder="0.0"
                            className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <button className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
                        Deposit
                    </button>
                </div>
            </div>
        </div>
    )
}
