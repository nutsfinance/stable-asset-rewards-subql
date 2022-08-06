import { getAccount, createClaim, ClaimEventArgs, getDistributor, getDistributorDailyStat, getClaimTx, getAccountTokenClaimed, getDailyTokenClaimed, getBlock } from "../utils/record";
import { AcalaEvmEvent } from '@subql/acala-evm-processor';
import { getStartOfDay } from "../utils";

// Ensures extrinsic data is populated
export const claim = async ({address, blockHash, blockNumber, blockTimestamp, transactionHash, logIndex, args: {user, userAddress, token, amount}}: AcalaEvmEvent<ClaimEventArgs>) => {
	const account = await getAccount(user, userAddress);
	const distributor = await getDistributor(address);
    const startOfDay = getStartOfDay(blockTimestamp)
	const stats = await getDistributorDailyStat(distributor, startOfDay);

    const block = await getBlock(blockNumber, blockHash, blockTimestamp);
	const claimTx = await getClaimTx(account, distributor, stats, transactionHash, block.id);
	await createClaim(claimTx, stats, logIndex, userAddress, token, amount);

    const accClaimed = await getAccountTokenClaimed(account, token);
    accClaimed.amount += amount.toBigInt();
    await accClaimed.save();

    const dailyClaimed = await getDailyTokenClaimed(stats, token);
    dailyClaimed.amount += amount.toBigInt();
    await dailyClaimed.save();
};