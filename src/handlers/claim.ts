import { getOrCreateAccount, getOrCreateClaim, TransferEventArgs, getOrCreateDistributor, getOrCreateDistributorDailyStat, getClaimTx, createClaimTx, getAccountTokenClaimed, createAccountTokenClaimed, getDailyTokenClaimed, createDailyTokenClaimed } from "../utils/record";
import { AcalaEvmEvent } from '@subql/acala-evm-processor';
import { getStartOfDay } from "../utils";

// Ensures extrinsic data is populated
export const claim = async ({address, blockTimestamp, transactionHash, logIndex, args: {userAddress, token, amount}}: AcalaEvmEvent<TransferEventArgs>) => {
	const account = await getOrCreateAccount(userAddress);
	const distributor = await getOrCreateDistributor(address);
    const startOfDay = getStartOfDay(blockTimestamp)
	const stats = await getOrCreateDistributorDailyStat(distributor, startOfDay);

	let claimTx = await getClaimTx(transactionHash);
    if (!claimTx) {
        claimTx = await createClaimTx(account, distributor, stats, transactionHash, blockTimestamp)
    }
	await getOrCreateClaim(claimTx, stats, logIndex, userAddress, token, amount);
    const accClaimed = await getAccountTokenClaimed(account, token) || await createAccountTokenClaimed(account, token, amount)
    accClaimed.amount += amount.toBigInt();
    await accClaimed.save();

    const dailyClaimed = await getDailyTokenClaimed(stats, token) || await createDailyTokenClaimed(stats, token, amount)
    dailyClaimed.amount += amount.toBigInt();
    await dailyClaimed.save();


    
};