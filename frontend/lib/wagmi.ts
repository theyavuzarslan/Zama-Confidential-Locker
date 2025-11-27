import { http, createConfig } from 'wagmi'
import { hardhat, sepolia } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || ''

import { defineChain } from 'viem'

const zamaDevnet = defineChain({
    id: 8009,
    name: 'Zama Devnet',
    nativeCurrency: {
        decimals: 18,
        name: 'ZAMA',
        symbol: 'ZAMA',
    },
    rpcUrls: {
        default: { http: ['https://devnet.zama.ai'] },
    },
    blockExplorers: {
        default: { name: 'Zama Explorer', url: 'https://main.explorer.zama.ai' },
    },
    testnet: true,
})

export const config = createConfig({
    chains: [hardhat, sepolia, zamaDevnet],
    connectors: [
        injected(),
        walletConnect({ projectId }),
        metaMask(),
        safe(),
    ],
    transports: {
        [hardhat.id]: http(),
        [sepolia.id]: http(),
        [zamaDevnet.id]: http(),
    },
})

declare module 'wagmi' {
    interface Register {
        config: typeof config
    }
}
