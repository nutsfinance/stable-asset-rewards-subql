import {utils} from "ethers";

export const isAddressEqual = (a: string, b: string) => {
    return utils.getAddress(a) === utils.getAddress(b)
}