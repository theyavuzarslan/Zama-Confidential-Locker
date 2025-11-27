'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { FhevmInstance } from 'fhevmjs'

interface FhevmContextType {
    instance: FhevmInstance | null
    isInitialized: boolean
}

const FhevmContext = createContext<FhevmContextType>({
    instance: null,
    isInitialized: false,
})

export function FhevmProvider({ children }: { children: ReactNode }) {
    const [instance, setInstance] = useState<FhevmInstance | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        const init = async () => {
            try {
                // Dynamically import fhevmjs to avoid SSR issues
                const { initFhevm, createInstance } = await import('fhevmjs')

                // Initialize fhEVM
                await initFhevm()

                // For local development, we'll skip full FHE initialization
                // In production with Zama Devnet, proper addresses would be used
                const fhevmInstance = await createInstance({
                    chainId: 31337,
                    networkUrl: 'http://localhost:8545',
                    gatewayUrl: 'http://localhost:8545',
                    // Mock addresses for local dev - these would be real on Zama Devnet
                    kmsContractAddress: '0x0000000000000000000000000000000000000000',
                    aclContractAddress: '0x0000000000000000000000000000000000000000',
                })

                setInstance(fhevmInstance)
                setIsInitialized(true)
            } catch (error) {
                console.error('Failed to initialize fhEVM:', error)
                // For development, we'll continue without FHE
                setIsInitialized(false)
            }
        }

        init()
    }, [])

    return (
        <FhevmContext.Provider value={{ instance, isInitialized }}>
            {children}
        </FhevmContext.Provider>
    )
}

export function useFhevm() {
    const context = useContext(FhevmContext)
    if (!context) {
        throw new Error('useFhevm must be used within FhevmProvider')
    }
    return context
}
