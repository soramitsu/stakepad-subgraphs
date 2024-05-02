import { Address } from "@graphprotocol/graph-ts";
import { BigInt } from "@graphprotocol/graph-ts";
import { User } from "../../generated/schema";

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