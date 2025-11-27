import type { FhevmInstance } from 'fhevmjs'

// Simplified encryption for demo purposes
// In production with Zama Devnet, this would use the full fhevmjs API
export async function encryptUint32(
    instance: FhevmInstance | null,
    value: number,
    contractAddress: string
): Promise<string> {
    if (!instance) {
        // Fallback for local dev without FHE
        return '0x' + value.toString(16).padStart(64, '0')
    }

    try {
        // Attempt to use fhevmjs if available
        const input = instance.createEncryptedInput(contractAddress)
        input.add32(value)
        const encrypted = await input.encrypt()
        // Convert handles to hex string
        return '0x' + Buffer.from(encrypted.handles[0]).toString('hex')
    } catch (error) {
        console.warn('FHE encryption failed, using fallback:', error)
        return '0x' + value.toString(16).padStart(64, '0')
    }
}

export async function encryptUint128(
    instance: FhevmInstance | null,
    value: bigint,
    contractAddress: string
): Promise<string> {
    if (!instance) {
        return '0x' + value.toString(16).padStart(64, '0')
    }

    try {
        const input = instance.createEncryptedInput(contractAddress)
        input.add128(value)
        const encrypted = await input.encrypt()
        return '0x' + Buffer.from(encrypted.handles[0]).toString('hex')
    } catch (error) {
        console.warn('FHE encryption failed, using fallback:', error)
        return '0x' + value.toString(16).padStart(64, '0')
    }
}

export function uint8ArrayToHex(arr: Uint8Array): string {
    return '0x' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
}
