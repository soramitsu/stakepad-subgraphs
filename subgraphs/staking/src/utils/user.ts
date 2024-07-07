import { BigInt, Address } from "@graphprotocol/graph-ts";
import { User } from "../../generated/schema";

/**
 * Retrieves or creates a User entity for a given pool and user address.
 * 
 * @param poolAddress - The address of the staking pool.
 * @param address - The address of the user.
 * @returns The User entity corresponding to the given pool and user address.
 */
export function getOrCreateUser(poolAddress: Address, address: Address): User {
  const id = poolAddress.toHex() + "-" + address.toHex();

  let user = User.load(id);
  if (user === null) {
    user = new User(id);
    user.amount = BigInt.fromI32(0);
    user.claimed = BigInt.fromI32(0);
    user.rewardDebt = BigInt.fromI32(0);
    user.pending = BigInt.fromI32(0);
    user.address = address;
    user.save();
  }

  return user as User;
}