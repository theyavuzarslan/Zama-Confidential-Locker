// Contract addresses - update these after deployment
export const CONTRACTS = {
    LockerPass: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`,
    ComplianceRegistry: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as `0x${string}`,
    MockConfidentialERC20: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' as `0x${string}`,
    ConfidentialLocker: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' as `0x${string}`,
    MockDEX: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707' as `0x${string}`,
    ConfidentialBuyback: '0x0165878A594ca255338adfa4d48449f69242Eb8F' as `0x${string}`,
} as const

// Import ABIs
import ConfidentialLockerABI from './abis/ConfidentialLocker.json'
import ConfidentialBuybackABI from './abis/ConfidentialBuyback.json'
import MockConfidentialERC20ABI from './abis/MockConfidentialERC20.json'

export const ABIS = {
    ConfidentialLocker: ConfidentialLockerABI,
    ConfidentialBuyback: ConfidentialBuybackABI,
    MockConfidentialERC20: MockConfidentialERC20ABI,
} as const
