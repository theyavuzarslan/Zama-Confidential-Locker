'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { type State, WagmiProvider } from 'wagmi'

import { config } from '@/lib/wagmi'
import { FhevmProvider } from '@/lib/fhevm'

export function Providers(props: {
    children: ReactNode
    initialState?: State
}) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <WagmiProvider config={config} initialState={props.initialState}>
            <QueryClientProvider client={queryClient}>
                <FhevmProvider>
                    {props.children}
                </FhevmProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
