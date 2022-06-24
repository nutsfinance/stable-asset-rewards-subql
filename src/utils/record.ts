import {
	Account, ClaimTx, Claim, Distributor, DistributorDailyStat
} from "../types";
import { BigNumber } from "ethers";
import { isAddressEqual } from "./address";
import { AccountTokenClaimed } from "../types/models/AccountTokenClaimed";

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


export const getOrCreateAccount = async (address: string) => {
	logger.info("getOrCreateAccount")
	const _account = await Account.get(address);
	if (!_account) {
		const newAccount = new Account(address);
		newAccount.claimTxCount = 0;
		newAccount.claimCount = 0;
		await newAccount.save();
		return newAccount;
	} else {
		return _account;
	}
};
export const getOrCreateDistributor = async (address: string) => {
	logger.info("getOrCreateDistributor")

	const _distributor = await Distributor.get(address);
	if (!_distributor) {
		const newDistributor = new Distributor(address);
		await newDistributor.save();
		return newDistributor;
	} else {
		return _distributor;
	}
};

export const getClaimTx = async (account: Account, distributor: Distributor, dailyStats: DistributorDailyStat, txHash: string) => {
	logger.info("getClaimTx")

	return await ClaimTx.get(txHash);
} 

export const createClaimTx = async (account: Account, distributor: Distributor, dailyStats: DistributorDailyStat, txHash: string) => {
	logger.info("createClaimTx")

	const newClaimTx = new ClaimTx(txHash);
	newClaimTx.accountId = account.id;
	newClaimTx.distributorId = distributor.id;
	newClaimTx.dailyStatsId = dailyStats.id;
	await newClaimTx.save();
	return newClaimTx;
};

export const getOrCreateClaim = async (claimTx: ClaimTx, dailyStats: DistributorDailyStat, logIndex: number, userAddress: string, token: string, amount: BigNumber) => {
	logger.info("getOrCreateClaim")

	const id = `${claimTx.id}-${logIndex}`;
	logger.info("Claim: {}", [id])


	const _claim = await Claim.get(id);
	if (!isAddressEqual(claimTx.accountId, userAddress)) throw new Error("user address conflict")
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

export const getOrCreateDistributorDailyStat = async (distributor: Distributor, timestamp: number) => {
	logger.info("getOrCreateDistributorDailyStat")

	const id = `${distributor.id}-${timestamp}`;
	const _dailyStat = await DistributorDailyStat.get(id);
	if (!_dailyStat) {
		const newDailyStat = new DistributorDailyStat(id);
		newDailyStat.distributorId = distributor.id;
		newDailyStat.startOfDay = BigInt(timestamp);
		newDailyStat.txCount = 0;
		newDailyStat.claimCount = 0;
		await newDailyStat.save();
		return newDailyStat;
	} else {
		return _dailyStat;
	}
};

export const getAccountTokenClaimed = async (account: Account, token: string) => {
	logger.info("getAccountTokenClaimed")
	return await AccountTokenClaimed.get(`${account.id}-${token}`);
}
export const createAccountTokenClaimed = async (account: Account, token: string, amount: BigNumber) => {
	logger.info("createAccountTokenClaimed")
	const newTokenClaimed = new AccountTokenClaimed(`${account.id}-${token}`);
	newTokenClaimed.accountId = account.id;
	newTokenClaimed.token = token;
	newTokenClaimed.amount = amount.toBigInt();
	await newTokenClaimed.save();
	return newTokenClaimed;
};

