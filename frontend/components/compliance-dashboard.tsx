'use client'

import { Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export function ComplianceDashboard() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Compliance</h1>
                <p className="mt-2 text-gray-400">
                    View your compliance status and allowlist information
                </p>
            </div>

            {/* Status Card */}
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-green-900/30 p-3">
                            <CheckCircle className="h-8 w-8 text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">Verified</h3>
                            <p className="mt-1 text-sm text-gray-400">
                                Your address is whitelisted and can use the platform
                            </p>
                        </div>
                    </div>
                    <span className="rounded-full bg-green-900/30 px-3 py-1 text-xs font-medium text-green-400">
                        Active
                    </span>
                </div>
            </div>

            {/* Compliance Features */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                    <div className="flex items-center gap-3">
                        <Shield className="h-6 w-6 text-blue-500" />
                        <h3 className="font-semibold text-white">Allowlist Status</h3>
                    </div>
                    <p className="mt-3 text-sm text-gray-400">
                        The compliance registry controls who can interact with the locker and buyback
                        contracts. Your address is currently approved.
                    </p>
                </div>

                <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-6 w-6 text-yellow-500" />
                        <h3 className="font-semibold text-white">Future Features</h3>
                    </div>
                    <p className="mt-3 text-sm text-gray-400">
                        Upcoming: AML/Sanction checks via GoPlus and Chainalysis, automated policy
                        management, and holder reveal mechanisms.
                    </p>
                </div>
            </div>

            {/* Info Box */}
            <div className="rounded-lg bg-blue-950/30 border border-blue-900/50 p-6">
                <h3 className="font-semibold text-blue-300">About Compliance</h3>
                <p className="mt-2 text-sm text-blue-200">
                    The Confidential Token Management Dashboard integrates compliance features to ensure
                    regulatory adherence while maintaining privacy. The allowlist can be enabled or
                    disabled by the contract owner, allowing for flexible deployment strategies.
                </p>
            </div>
        </div>
    )
}
