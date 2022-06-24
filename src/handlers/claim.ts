import { getOrCreateAccount, getOrCreateClaim, TransferEventArgs, getOrCreateDistributor, getOrCreateDistributorDailyStat, getClaimTx, createClaimTx, getAccountTokenClaimed, createAccountTokenClaimed } from "../utils/record";
import { AcalaEvmEvent } from '@subql/acala-evm-processor';
import { getStartOfDay } from "../utils";

// Ensures extrinsic data is populated
export const claim = async ({address, blockTimestamp, transactionHash, logIndex, args: {userAddress, token, amount}}: AcalaEvmEvent<TransferEventArgs>) => {
	const account = await getOrCreateAccount(userAddress);
	const distributor = await getOrCreateDistributor(address);
    const startOfDay = getStartOfDay(blockTimestamp).getTime()
	const stats = await getOrCreateDistributorDailyStat(distributor, startOfDay);
    stats.claimCount += 1;
    account.claimCount +=1;
	let claimTx = await getClaimTx(account, distributor, stats, transactionHash);
    if (!claimTx) {
        claimTx = await createClaimTx(account, distributor, stats, transactionHash)
        stats.txCount += 1;
        account.claimTxCount +=1;
    }
	await getOrCreateClaim(claimTx, stats, logIndex, userAddress, token, amount);
    let claimed = await getAccountTokenClaimed(account, token);
    if (!claimed) {
        claimed = await createAccountTokenClaimed(account, token, amount);
    } else {
        claimed.amount += amount.toBigInt();
        await claimed.save();
    }
    await stats.save();
    await account.save();
};