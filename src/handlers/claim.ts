import { getOrCreateAccount, getOrCreateClaim, TransferEventArgs, getOrCreateDistributor, getOrCreateDistributorDailyStat, getClaimTx, createClaimTx, getAccountTokenClaimed, createAccountTokenClaimed, getDailyTokenClaimed, createDailyTokenClaimed } from "../utils/record";
import { AcalaEvmEvent } from '@subql/acala-evm-processor';
import { getStartOfDay } from "../utils";

// Ensures extrinsic data is populated
export const claim = async ({address, blockTimestamp, transactionHash, logIndex, args: {userAddress, token, amount}}: AcalaEvmEvent<TransferEventArgs>) => {
	const account = await getOrCreateAccount(userAddress);
	const distributor = await getOrCreateDistributor(address);
    const startOfDay = getStartOfDay(blockTimestamp).getTime()
	const stats = await getOrCreateDistributorDailyStat(distributor, startOfDay);
    // stats.claimCount += 1;
    // await stats.save();
    // account.claimCount +=1;
    // await account.save();

	let claimTx = await getClaimTx(account, distributor, stats, transactionHash);
    if (!claimTx) {
        claimTx = await createClaimTx(account, distributor, stats, transactionHash)
        // stats.txCount += 1;
        // await stats.save();
        // account.claimTxCount +=1;
        // await account.save();
    }
	await getOrCreateClaim(claimTx, stats, logIndex, userAddress, token, amount);
    const accClaimed = await getAccountTokenClaimed(account, token) || await createAccountTokenClaimed(account, token, amount)
    accClaimed.amount += amount.toBigInt();
    await accClaimed.save();

    const dailyClaimed = await getDailyTokenClaimed(stats, token) || await createDailyTokenClaimed(stats, token, amount)
    dailyClaimed.amount += amount.toBigInt();
    await dailyClaimed.save();


    
};