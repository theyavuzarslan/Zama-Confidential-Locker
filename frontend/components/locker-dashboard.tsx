'use client'

import { useState } from 'react'
import { Plus, Clock, Loader2 } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useFhevm } from '@/lib/fhevm'
import { encryptUint32, encryptUint128 } from '@/lib/encryption'

export function LockerDashboard() {
    const [activeTab, setActiveTab] = useState<'create' | 'view'>('create')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Confidential Locker</h1>
                <p className="mt-2 text-gray-400">
                    Lock tokens with encrypted amounts and unlock conditions
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-800">
                <button
                    onClick={() => setActiveTab('create')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'create'
                        ? 'border-b-2 border-blue-500 text-white'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Create Lock
                </button>
                <button
                    onClick={() => setActiveTab('view')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'view'
                        ? 'border-b-2 border-blue-500 text-white'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    My Locks
                </button>
            </div>

            {/* Content */}
            {activeTab === 'create' ? <CreateLockForm /> : <ViewLocks />}
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
                '3. Receive LockerPass NFT\n\n' +
                'To enable this:\n' +
                '- Deploy contracts with `npx hardhat run scripts/deploy.ts`\n' +
                '- Update addresses in frontend/lib/contracts.ts\n' +
                '- Uncomment the writeContract code below'
            )

            // In production, this would call the contract:
            // 1. First approve token spending
            /*
            await writeContract({
              address: tokenAddress as `0x${string}`,
              abi: ABIS.MockConfidentialERC20,
              functionName: 'approve',
              args: [CONTRACTS.ConfidentialLocker, encryptedAmount]
            })
            */

            // 2. Then create the lock
            /*
            await writeContract({
              address: CONTRACTS.ConfidentialLocker,
              abi: ABIS.ConfidentialLocker,
              functionName: 'lock',
              args: [
                tokenAddress,
                encryptedAmount,
                '0x', // amountProof
                encryptedTime,
                '0x', // timeProof
                encryptedKPI,
                '0x'  // kpiProof
              ]
            })
            */

            alert('Transaction simulation successful! To execute real transactions, uncomment the writeContract calls in the code.')


        } catch (error) {
            console.error('Encryption failed:', error)
            alert('Encryption failed. See console for details.')
        } finally {
            setIsEncrypting(false)
        }
    }

    return (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
            <div className="space-y-6">
                {/* Wallet Status */}
                {!address && (
                    <div className="rounded-lg border border-yellow-900/50 bg-yellow-950/30 p-3">
                        <p className="text-sm text-yellow-300">
                            ⚠️ Please connect your wallet to create a lock
                        </p>
                    </div>
                )}

                {/* FHE Status */}
                <div className={`rounded-lg border p-3 ${isInitialized
                    ? 'border-green-900/50 bg-green-950/30'
                    : 'border-yellow-900/50 bg-yellow-950/30'
                    }`}>
                    <p className={`text-sm ${isInitialized ? 'text-green-300' : 'text-yellow-300'}`}>
                        {isInitialized
                            ? '🔒 FHE encryption initialized'
                            : '⚠️ FHE not initialized (using fallback encryption)'}
                    </p>
                </div>

                {/* Token Address */}
                <div>
                    <label className="block text-sm font-medium text-gray-300">
                        Token Address
                    </label>
                    <input
                        type="text"
                        value={tokenAddress}
                        onChange={(e) => setTokenAddress(e.target.value)}
                        placeholder="0x..."
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-300">
                        Amount
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.0"
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        This value will be encrypted before submission
                    </p>
                </div>

                {/* Unlock Time */}
                <div>
                    <label className="block text-sm font-medium text-gray-300">
                        Unlock Date
                    </label>
                    <input
                        type="datetime-local"
                        value={unlockDate}
                        onChange={(e) => setUnlockDate(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    />
                </div>

                {/* KPI Target */}
                <div>
                    <label className="block text-sm font-medium text-gray-300">
                        KPI Target (Optional)
                    </label>
                    <input
                        type="number"
                        value={kpiTarget}
                        onChange={(e) => setKpiTarget(e.target.value)}
                        placeholder="0"
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Set to 0 for time-only locks. Both conditions must be met for withdrawal.
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleCreateLock}
                    disabled={isEncrypting || !address}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
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
                <div className="rounded-lg bg-blue-950/30 border border-blue-900/50 p-4">
                    <p className="text-sm text-blue-300">
                        <strong>Privacy Note:</strong> Your lock amount and conditions will be encrypted
                        using FHE before being stored on-chain. Only you can decrypt and view the details.
                    </p>
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
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-12 text-center">
                    <Clock className="mx-auto h-12 w-12 text-gray-600" />
                    <h3 className="mt-4 text-lg font-medium text-white">No locks found</h3>
                    <p className="mt-2 text-sm text-gray-400">
                        Create your first confidential lock to get started
                    </p>
                </div>
            ) : (
                mockLocks.map((lock) => (
                    <div
                        key={lock.id}
                        className="rounded-lg border border-gray-800 bg-gray-900 p-6"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-400">Token</p>
                                    <p className="font-mono text-white">{lock.token}</p>
                                </div>
                                <div className="flex gap-6">
                                    <div>
                                        <p className="text-sm text-gray-400">Amount</p>
                                        <p className="text-white">{lock.amount}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Unlock Time</p>
                                        <p className="text-white">{lock.unlockTime}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${lock.status === 'Locked'
                                        ? 'bg-yellow-900/30 text-yellow-400'
                                        : 'bg-green-900/30 text-green-400'
                                        }`}
                                >
                                    {lock.status}
                                </span>
                                {lock.status === 'Unlocked' && (
                                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
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
