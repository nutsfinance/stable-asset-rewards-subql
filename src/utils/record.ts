import {
	Account, ClaimTx, Claim, Distributor, DistributorDailyStat, AccountTokenClaimed, DailyTokenClaimed
} from "../types";
import { BigNumber } from "ethers";

export type TransferEventArgs = [
    string,
    string,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    string
] & {
    user: string;
    userAddress: string;
    token: string;
    amount: BigNumber;
    cycle: BigNumber;
    timestamp: BigNumber;
    blockNumber: BigNumber;
    claimer: string;
};


export const getAccount = async (user: string, userAddress: string) => {
	const _account = await Account.get(user);
	if (!_account) {
		const newAccount = new Account(user);
		newAccount.userAddress = userAddress;
		await newAccount.save();
		return newAccount;
	} else {
		return _account;
	}
};
export const getDistributor = async (address: string) => {
	const _distributor = await Distributor.get(address);
	if (!_distributor) {
		const newDistributor = new Distributor(address);
		await newDistributor.save();
		return newDistributor;
	} else {
		return _distributor;
	}
};

export const getClaimTx = async (account: Account, distributor: Distributor, dailyStats: DistributorDailyStat, txHash: string, blockTimestamp: Date) => {
	const _claimTx = await ClaimTx.get(txHash);
	if (!_claimTx) {
		const newClaimTx = new ClaimTx(txHash);
		newClaimTx.accountId = account.id;
		newClaimTx.distributorId = distributor.id;
		newClaimTx.dailyStatsId = dailyStats.id;
		newClaimTx.blockTimestamp = blockTimestamp;
		await newClaimTx.save();
		return newClaimTx;
	} else {
		return _claimTx;
	}
} 

export const createClaim = async (claimTx: ClaimTx, dailyStats: DistributorDailyStat, logIndex: number, userAddress: string, token: string, amount: BigNumber) => {
	const id = `${claimTx.id}-${logIndex}`;
	logger.info(`Claim: ${id}`)

	const _claim = await Claim.get(id);
	if (!_claim) {
		const newClaim = new Claim(id);
		newClaim.claimTxId = claimTx.id;
		newClaim.dailyStatsId = dailyStats.id;
		newClaim.logIndex = logIndex;
		newClaim.accountId = claimTx.accountId;
		newClaim.token = token;
		newClaim.amount = amount.toBigInt();
		await newClaim.save();
		return newClaim;
	} else {
		return _claim;
	}
};

export const getDistributorDailyStat = async (distributor: Distributor, startOfDay: Date) => {
	logger.info("getOrCreateDistributorDailyStat")

	const id = `${distributor.id}-${startOfDay.getTime()}`;
	const dailyStat = await DistributorDailyStat.get(id);
	if (!dailyStat) {
		const newDailyStat = new DistributorDailyStat(id);
		newDailyStat.distributorId = distributor.id;
		newDailyStat.startOfDay = startOfDay;
		await newDailyStat.save();
		return newDailyStat;
	} else {
		return dailyStat;
	}
};

export const getAccountTokenClaimed = async (account: Account, token: string) => {
	const id = `${account.id}-${token}`;

	const tokenClaimed = await AccountTokenClaimed.get(id);
	if (!tokenClaimed) {
		const newTokenClaimed = new AccountTokenClaimed(id);
		newTokenClaimed.accountId = account.id;
		newTokenClaimed.token = token;
		newTokenClaimed.amount = BigInt(0);
		await newTokenClaimed.save();
		return newTokenClaimed;
	} else {
		return tokenClaimed;
	}
}

export const getDailyTokenClaimed = async (stats: DistributorDailyStat, token: string) => {
	const id = `${stats.id}-${token}`;

	const tokenClaimed = await DailyTokenClaimed.get(id);
	if (!tokenClaimed) {
		const newTokenClaimed = new DailyTokenClaimed(id);
		newTokenClaimed.dailyStatsId = stats.id
		newTokenClaimed.token = token;
		newTokenClaimed.amount = BigInt(0);
		await newTokenClaimed.save();
		return newTokenClaimed;
	} else {
		return tokenClaimed;
	}
}
