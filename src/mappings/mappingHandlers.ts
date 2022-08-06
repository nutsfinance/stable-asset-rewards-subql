import { AcalaEvmCall, AcalaEvmEvent } from '@subql/acala-evm-processor';
import { claim } from '../handlers';
import { ClaimEventArgs } from '../utils';

// Setup types from ABI


export async function handleClaim(event: AcalaEvmEvent<ClaimEventArgs>): Promise<void> {
    return await claim(event);
}
