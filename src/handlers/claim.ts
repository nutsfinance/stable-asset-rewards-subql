import { getAccount, createClaim, TransferEventArgs, getDistributor, getDistributorDailyStat, getClaimTx, getAccountTokenClaimed, getDailyTokenClaimed } from "../utils/record";
import { AcalaEvmEvent } from '@subql/acala-evm-processor';
import { getStartOfDay } from "../utils";

// Ensures extrinsic data is populated
export const claim = async ({address, blockTimestamp, transactionHash, logIndex, args: {user, userAddress, token, amount}}: AcalaEvmEvent<TransferEventArgs>) => {
	const account = await getAccount(user, userAddress);
	const distributor = await getDistributor(address);
    const startOfDay = getStartOfDay(blockTimestamp)
	const stats = await getDistributorDailyStat(distributor, startOfDay);

	let claimTx = await getClaimTx(account, distributor, stats, transactionHash, blockTimestamp);
	await createClaim(claimTx, stats, logIndex, userAddress, token, amount);

    const accClaimed = await getAccountTokenClaimed(account, token);
    accClaimed.amount += amount.toBigInt();
    await accClaimed.save();

    const dailyClaimed = await getDailyTokenClaimed(stats, token);
    dailyClaimed.amount += amount.toBigInt();
    await dailyClaimed.save();
};