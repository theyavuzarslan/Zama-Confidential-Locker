'use client'

import { useState } from 'react'
import { Plus, Clock, Loader2, Lock, Unlock, ShieldCheck } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useFhevm } from '@/lib/fhevm'
import { encryptUint32, encryptUint128 } from '@/lib/encryption'

export function LockerDashboard() {
    const [activeTab, setActiveTab] = useState<'create' | 'view'>('create')

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Confidential Locker</h1>
                <p className="mt-2 text-lg text-gray-400">
                    Secure your assets with FHE-powered privacy and conditional logic.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('create')}
                    className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${activeTab === 'create'
                        ? 'border-b-2 border-blue-500 text-white'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Create Lock
                </button>
                <button
                    onClick={() => setActiveTab('view')}
                    className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${activeTab === 'view'
                        ? 'border-b-2 border-blue-500 text-white'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    My Locks
                </button>
            </div>

            {/* Content */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl -z-10" />
                {activeTab === 'create' ? <CreateLockForm /> : <ViewLocks />}
            </div>
        </div>
    )
}

function CreateLockForm() {
    const { instance, isInitialized } = useFhevm()
    const { address } = useAccount()
    const [tokenAddress, setTokenAddress] = useState('')
    const [amount, setAmount] = useState('')
    const [unlockDate, setUnlockDate] = useState('')
    const [kpiTarget, setKpiTarget] = useState('')
    const [isEncrypting, setIsEncrypting] = useState(false)

    const handleCreateLock = async () => {
        if (!address) {
            alert('Please connect your wallet first')
            return
        }

        if (!tokenAddress || !amount || !unlockDate) {
            alert('Please fill in all required fields')
            return
        }

        setIsEncrypting(true)
        try {
            // Convert unlock date to timestamp
            const unlockTimestamp = Math.floor(new Date(unlockDate).getTime() / 1000)

            // Encrypt values
            const encryptedAmount = await encryptUint128(
                instance,
                BigInt(Math.floor(parseFloat(amount) * 1e18)), // Convert to wei
                tokenAddress
            )

            const encryptedTime = await encryptUint32(
                instance,
                unlockTimestamp,
                tokenAddress
            )

            const encryptedKPI = await encryptUint32(
                instance,
                parseInt(kpiTarget || '0'),
                tokenAddress
            )

            console.log('Encrypted values:', {
                amount: encryptedAmount,
                time: encryptedTime,
                kpi: encryptedKPI,
            })

            alert(
                'Values encrypted successfully!\n\n' +
                'In production, this would:\n' +
                '1. Approve token spending\n' +
                '2. Call lock() on ConfidentialLocker\n' +
                '3. Receive LockerPass NFT'
            )

        } catch (error) {
            console.error('Encryption failed:', error)
            alert('Encryption failed. See console for details.')
        } finally {
            setIsEncrypting(false)
        }
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 shadow-2xl">
            <div className="space-y-8">
                {/* Status Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {!address && (
                        <div className="flex items-center gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                            <div className="rounded-full bg-yellow-500/20 p-2">
                                <ShieldCheck className="h-5 w-5 text-yellow-400" />
                            </div>
                            <p className="text-sm font-medium text-yellow-200">
                                Connect wallet to start
                            </p>
                        </div>
                    )}

                    <div className={`flex items-center gap-3 rounded-xl border p-4 transition-colors ${isInitialized
                        ? 'border-green-500/20 bg-green-500/10'
                        : 'border-yellow-500/20 bg-yellow-500/10'
                        }`}>
                        <div className={`rounded-full p-2 ${isInitialized ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                            <Lock className={`h-5 w-5 ${isInitialized ? 'text-green-400' : 'text-yellow-400'}`} />
                        </div>
                        <p className={`text-sm font-medium ${isInitialized ? 'text-green-200' : 'text-yellow-200'}`}>
                            {isInitialized ? 'FHE Encryption Ready' : 'Initializing FHE...'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Token Address */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Token Address
                        </label>
                        <input
                            type="text"
                            value={tokenAddress}
                            onChange={(e) => setTokenAddress(e.target.value)}
                            placeholder="0x..."
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Amount
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.0"
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            Encrypted before submission
                        </p>
                    </div>

                    {/* Unlock Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Unlock Date
                        </label>
                        <input
                            type="datetime-local"
                            value={unlockDate}
                            onChange={(e) => setUnlockDate(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    {/* KPI Target */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            KPI Target (Optional)
                        </label>
                        <input
                            type="number"
                            value={kpiTarget}
                            onChange={(e) => setKpiTarget(e.target.value)}
                            placeholder="0"
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            Set a minimum KPI score required for withdrawal. This condition is checked privately off-chain.
                        </p>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleCreateLock}
                    disabled={isEncrypting || !address}
                    className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                    {isEncrypting ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Encrypting...
                        </>
                    ) : (
                        <>
                            <Plus className="h-5 w-5" />
                            Create Lock
                        </>
                    )}
                </button>

                {/* Info Box */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                    <div className="flex gap-3">
                        <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0" />
                        <p className="text-sm text-blue-200">
                            <strong>Privacy Note:</strong> Your lock amount and conditions will be encrypted
                            using FHE before being stored on-chain. Only you can decrypt and view the details.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ViewLocks() {
    const mockLocks = [
        {
            id: 1,
            token: '0x1234...5678',
            status: 'Locked',
            unlockTime: 'Encrypted',
            amount: 'Encrypted',
        },
        {
            id: 2,
            token: '0xabcd...efgh',
            status: 'Unlocked',
            unlockTime: 'Encrypted',
            amount: 'Encrypted',
        },
    ]

    return (
        <div className="space-y-4">
            {mockLocks.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-16 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-800/50">
                        <Clock className="h-8 w-8 text-gray-600" />
                    </div>
                    <h3 className="mt-6 text-xl font-medium text-white">No locks found</h3>
                    <p className="mt-2 text-gray-400">
                        Create your first confidential lock to get started
                    </p>
                </div>
            ) : (
                mockLocks.map((lock) => (
                    <div
                        key={lock.id}
                        className="group rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 transition-all hover:border-white/20 hover:bg-black/50"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Token</p>
                                    <p className="font-mono text-lg text-white">{lock.token}</p>
                                </div>
                                <div className="flex gap-8">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Amount</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Lock className="h-3 w-3 text-gray-400" />
                                            <p className="text-white">{lock.amount}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Unlock Time</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Clock className="h-3 w-3 text-gray-400" />
                                            <p className="text-white">{lock.unlockTime}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                                <span
                                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${lock.status === 'Locked'
                                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                        : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                        }`}
                                >
                                    {lock.status === 'Locked' ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                                    {lock.status}
                                </span>
                                {lock.status === 'Unlocked' && (
                                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                                        Withdraw
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}
