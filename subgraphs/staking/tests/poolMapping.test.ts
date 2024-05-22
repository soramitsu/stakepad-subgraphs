import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { assert, describe, test, newMockEvent, beforeEach } from "matchstick-as/assembly/index";
import {
  Stake as StakeEvent,
  Unstake as UnstakeEvent,
  Claim as ClaimEvent,
  UpdatePool as PoolUpdateEvent
} from "../generated/ERC20LockUpFactory/ERC20LockUpStakingPool";
import { handleStake, handleUnstake, handleClaim, handleUpdatePool } from "../src/pool";
import { getOrCreateUser } from "../src/utils/user";
import { Pool, User } from "../generated/schema";

function createStakeEvent(userAddress: Address, amount: BigInt): StakeEvent {
  let mockEvent = newMockEvent();
  let newEvent = new StakeEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
  );
  newEvent.parameters = new Array();

  let userParam = new ethereum.EventParam("user", ethereum.Value.fromAddress(userAddress));
  let amountParam = new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount));

  newEvent.parameters.push(userParam);
  newEvent.parameters.push(amountParam);

  return newEvent;
}

function createUnstakeEvent(userAddress: Address, amount: BigInt): UnstakeEvent {
  let mockEvent = newMockEvent();
  let newEvent = new UnstakeEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
  );
  newEvent.parameters = new Array();

  let userParam = new ethereum.EventParam("user", ethereum.Value.fromAddress(userAddress));
  let amountParam = new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount));

  newEvent.parameters.push(userParam);
  newEvent.parameters.push(amountParam);

  return newEvent;
}

function createClaimEvent(userAddress: Address, amount: BigInt): ClaimEvent {
  let mockEvent = newMockEvent();
  let newEvent = new ClaimEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
  );
  newEvent.parameters = new Array();

  let userParam = new ethereum.EventParam("user", ethereum.Value.fromAddress(userAddress));
  let amountParam = new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount));

  newEvent.parameters.push(userParam);
  newEvent.parameters.push(amountParam);

  return newEvent;
}

function createPoolUpdateEvent(
  accumulatedRewardTokenPerShare: BigInt,
  totalStaked: BigInt,
  lastBlockTimestamp: BigInt
): PoolUpdateEvent {
  let mockEvent = newMockEvent();
  let newEvent = new PoolUpdateEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
  );
  newEvent.parameters = new Array();

  let accRewardPerShareParam = new ethereum.EventParam("accumulatedRewardTokenPerShare", ethereum.Value.fromUnsignedBigInt(accumulatedRewardTokenPerShare));
  let totalStakedParam = new ethereum.EventParam("totalStaked", ethereum.Value.fromUnsignedBigInt(totalStaked));
  let lastBlockTimestampParam = new ethereum.EventParam("lastBlockTimestamp", ethereum.Value.fromUnsignedBigInt(lastBlockTimestamp));

  newEvent.parameters.push(accRewardPerShareParam);
  newEvent.parameters.push(totalStakedParam);
  newEvent.parameters.push(lastBlockTimestampParam);

  return newEvent;
}

describe("ERC20LockUpStakingPool", () => {

  beforeEach(() => {
    let pool = new Pool("0x0000000000000000000000000000000000000001");
    pool.accRewardPerShare = BigInt.fromI32(0);
    pool.totalStaked = BigInt.fromI32(0);
    pool.totalClaimed = BigInt.fromI32(0);
    pool.save();
  });

  test("handleStake creates a new History entity and updates User and Pool entities", () => {
    let poolAddress = Address.fromString("0x0000000000000000000000000000000000000001");
    let userAddress = Address.fromString("0x0000000000000000000000000000000000000002");
    let amount = BigInt.fromI32(100);

    let stakeEvent = createStakeEvent(userAddress, amount);
    handleStake(stakeEvent);

    assert.fieldEquals("History", stakeEvent.transaction.hash.toHex(), "user", userAddress.toHexString());
    assert.fieldEquals("History", stakeEvent.transaction.hash.toHex(), "pool", poolAddress.toHexString());
    assert.fieldEquals("History", stakeEvent.transaction.hash.toHex(), "amount", amount.toString());
    assert.fieldEquals("History", stakeEvent.transaction.hash.toHex(), "event_type", "Stake");

    let user = getOrCreateUser(poolAddress, userAddress);
    assert.fieldEquals("User", user.id, "amount", amount.toString());

    let pool = Pool.load(poolAddress.toHex())!;
    assert.fieldEquals("Pool", pool.id, "totalStaked", amount.toString());
  });

  test("handleUnstake creates a new History entity and updates User and Pool entities", () => {
    let poolAddress = Address.fromString("0x0000000000000000000000000000000000000001");
    let userAddress = Address.fromString("0x0000000000000000000000000000000000000002");
    let amount = BigInt.fromI32(50);

    let user = new User(userAddress.toHex() + "-" + poolAddress.toHex());
    user.amount = BigInt.fromI32(100);
    user.pending = BigInt.fromI32(0);
    user.rewardDebt = BigInt.fromI32(0);
    user.save();

    let unstakeEvent = createUnstakeEvent(userAddress, amount);
    handleUnstake(unstakeEvent);

    assert.fieldEquals("History", unstakeEvent.transaction.hash.toHex(), "user", userAddress.toHexString());
    assert.fieldEquals("History", unstakeEvent.transaction.hash.toHex(), "pool", poolAddress.toHexString());
    assert.fieldEquals("History", unstakeEvent.transaction.hash.toHex(), "amount", amount.toString());
    assert.fieldEquals("History", unstakeEvent.transaction.hash.toHex(), "event_type", "Unstake");

    let updatedUser = getOrCreateUser(poolAddress, userAddress);
    assert.fieldEquals("User", updatedUser.id, "amount", (BigInt.fromI32(50)).toString());

    let pool = Pool.load(poolAddress.toHex())!;
    assert.fieldEquals("Pool", pool.id, "totalStaked", (BigInt.fromI32(50)).toString());
  });

  test("handleClaim creates a new History entity and updates User and Pool entities", () => {
    let poolAddress = Address.fromString("0x0000000000000000000000000000000000000001");
    let userAddress = Address.fromString("0x0000000000000000000000000000000000000002");
    let amount = BigInt.fromI32(50);

    let user = new User(userAddress.toHex() + "-" + poolAddress.toHex());
    user.amount = BigInt.fromI32(100);
    user.pending = BigInt.fromI32(50);
    user.rewardDebt = BigInt.fromI32(0);
    user.save();

    let claimEvent = createClaimEvent(userAddress, amount);
    handleClaim(claimEvent);

    assert.fieldEquals("History", claimEvent.transaction.hash.toHex(), "user", userAddress.toHexString());
    assert.fieldEquals("History", claimEvent.transaction.hash.toHex(), "pool", poolAddress.toHexString());
    assert.fieldEquals("History", claimEvent.transaction.hash.toHex(), "amount", amount.toString());
    assert.fieldEquals("History", claimEvent.transaction.hash.toHex(), "event_type", "Claim");

    let updatedUser = getOrCreateUser(poolAddress, userAddress);
    assert.fieldEquals("User", updatedUser.id, "pending", BigInt.fromI32(0).toString());
    assert.fieldEquals("User", updatedUser.id, "claimed", amount.toString());

    let pool = Pool.load(poolAddress.toHex())!;
    assert.fieldEquals("Pool", pool.id, "totalClaimed", amount.toString());
  });

  test("handleUpdatePool updates the Pool entity", () => {
    let poolAddress = Address.fromString("0x0000000000000000000000000000000000000001");
    let accRewardPerShare = BigInt.fromI32(10);
    let totalStaked = BigInt.fromI32(1000);
    let lastBlockTimestamp = BigInt.fromI32(1625130800);

    let poolUpdateEvent = createPoolUpdateEvent(poolAddress, accRewardPerShare, totalStaked, lastBlockTimestamp);
    handleUpdatePool(poolUpdateEvent);

    let pool = Pool.load(poolAddress.toHex())!;
    assert.fieldEquals("Pool", pool.id, "accRewardPerShare", accRewardPerShare.toString());
    assert.fieldEquals("Pool", pool.id, "totalStaked", totalStaked.toString());
    assert.fieldEquals("Pool", pool.id, "lastRewardTimestamp", lastBlockTimestamp.toString());
  });
});
