import { AcalaEvmCall, AcalaEvmEvent } from '@subql/acala-evm-processor';
import { claim } from '../handlers';
import { TransferEventArgs } from '../utils';

// Setup types from ABI


export async function handleClaim(event: AcalaEvmEvent<TransferEventArgs>): Promise<void> {
    return await claim(event);
}
