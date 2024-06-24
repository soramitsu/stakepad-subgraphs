import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { assert, describe, test, newMockEvent, beforeEach } from "matchstick-as/assembly/index";
import {
    Stake as StakeEvent,
    Unstake as UnstakeEvent,
    Claim as ClaimEvent,
    UpdatePool as PoolUpdateEvent
  } from "../generated/ERC721LockUpFactory/ERC721LockUpStakingPool";
import { handleStake, handleUnstake, handleClaim, handleUpdatePool } from "../src/nft_pool";
import { getOrCreateUser } from "../src/utils/user";
import { Pool } from "../generated/schema";
  
function createStakeEvent(userAddress: Address, tokenIds: Bytes): StakeEvent {
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
    let tokenIdsParam = new ethereum.EventParam("tokenIds", ethereum.Value.fromBytes(tokenIds));

    newEvent.parameters.push(userParam);
    newEvent.parameters.push(tokenIdsParam);

    return newEvent;
}

function createUnstakeEvent(userAddress: Address, tokenIds: Bytes): UnstakeEvent {
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
    let tokenIdsParam = new ethereum.EventParam("tokenIds", ethereum.Value.fromBytes(tokenIds));

    newEvent.parameters.push(userParam);
    newEvent.parameters.push(tokenIdsParam);

    return newEvent;
}

function createClaimEvent(userAddress: Address, pending: BigInt): ClaimEvent {
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
    let pendingParam = new ethereum.EventParam("pending", ethereum.Value.fromUnsignedBigInt(pending));

    newEvent.parameters.push(userParam);
    newEvent.parameters.push(pendingParam);

    return newEvent;
}

function createPoolUpdateEvent(
    accumulatedRewardTokenPerShare: BigInt,
    totalStaked: BigInt,
    lastBlockNumber: BigInt
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
  
    let accRewardPerShareParam = new ethereum.EventParam("accumulatedRewardTokenPerShare", 
        ethereum.Value.fromUnsignedBigInt(accumulatedRewardTokenPerShare));

    let totalStakedParam = new ethereum.EventParam("totalStaked", 
        ethereum.Value.fromUnsignedBigInt(totalStaked));
    
        let lastBlockNumberParam = new ethereum.EventParam("lastBlockNumber", 
        ethereum.Value.fromUnsignedBigInt(lastBlockNumber));
  
    newEvent.parameters.push(accRewardPerShareParam);
    newEvent.parameters.push(totalStakedParam);
    newEvent.parameters.push(lastBlockNumberParam);
  
    return newEvent;
  }

  describe("ERC721LockUpStakingPool", () => {
    beforeEach(() => {
        let pool = new Pool("0x0000000000000000000000000000000000000001");
        pool.accRewardPerShare = BigInt.fromI32(0);
        pool.totalStaked = BigInt.fromI32(0);
        pool.totalClaimed = BigInt.fromI32(0);
        pool.save();
      });

    test("stake NFT and update History and Pool entities", () => {
      let poolAddress = Address.fromString("0x0000000000000000000000000000000000000001");
      let userAddress = Address.fromString("0x0000000000000000000000000000000000000002");
      let tokenIds = Bytes.fromHexString("0x8E7a8FfFe80c3E82689c36a97d2a7e5A2EED4E34");
      let amount = BigInt.fromI32(tokenIds.length);
  
      let stakeEvent = createStakeEvent(userAddress, tokenIds);
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

    test("Stake Multiple NFTs", () => {
      let poolAddress = Address.fromString("0x0000000000000000000000000000000000000001");
      let userAddress1 = Address.fromString("0x1234567890abcdef1234567890abcdef12345678");
      let userAddress2 = Address.fromString("0x1098764542abcdef1234567890abcdef87654321");
      let tokenIds1 = Bytes.fromHexString("0x01");
      let tokenIds2 = Bytes.fromHexString("0x02");
      let tokenIds3 = Bytes.fromHexString("0x03");
      let tokenIds4 = Bytes.fromHexString("0x04");
      let amount1 = tokenIds1.length;
      let amount2 = tokenIds2.length;
      let amount3 = tokenIds3.length;
      let amount4 = tokenIds4.length;
      let stakeEvent1 = createStakeEvent(userAddress1, tokenIds1);
      let stakeEvent2 = createStakeEvent(userAddress1, tokenIds2);
      let stakeEvent3 = createStakeEvent(userAddress2, tokenIds3);
      let stakeEvent4 = createStakeEvent(userAddress2, tokenIds4);
      
      handleStake(stakeEvent1);
      handleStake(stakeEvent2);
      handleStake(stakeEvent3);
      handleStake(stakeEvent4);

      assert.fieldEquals("History", stakeEvent1.transaction.hash.toHex(), "user", userAddress1.toHexString());
      assert.fieldEquals("History", stakeEvent1.transaction.hash.toHex(), "pool", poolAddress.toHexString());
      assert.fieldEquals("History", stakeEvent1.transaction.hash.toHex(), "amount", amount1.toString());
      assert.fieldEquals("History", stakeEvent1.transaction.hash.toHex(), "event_type", "Stake");
  
      assert.fieldEquals("User", userAddress1.toHex(), "amount", "2");
      assert.fieldEquals("User", userAddress2.toHex(), "amount", "2");

      let pool = Pool.load(poolAddress.toHex())!;
      let totalAmount = amount1 + amount2 + amount3 + amount4;
      assert.fieldEquals("Pool", pool.id, "totalStaked", totalAmount.toString());
    });

    test("Unstake Event", () => {
      let poolAddress = Address.fromString("0x0000000000000000000000000000000000000001");
      let userAddress = Address.fromString("0x1234567890abcdef1234567890abcdef12345678");
      let tokenIds = Bytes.fromHexString("0x8E7a8FfFe80c3E82689c36a97d2a7e5A2EED4E34");
      let amount = BigInt.fromI32(tokenIds.length);

      let stakeEvent = createStakeEvent(userAddress, tokenIds);
      let unstakeEvent = createUnstakeEvent(userAddress, tokenIds);
  
      handleStake(stakeEvent);
      handleUnstake(unstakeEvent);

      assert.fieldEquals("History", stakeEvent.transaction.hash.toHex(), "user", userAddress.toHexString());
      assert.fieldEquals("History", stakeEvent.transaction.hash.toHex(), "pool", poolAddress.toHexString());
      assert.fieldEquals("History", stakeEvent.transaction.hash.toHex(), "amount", amount.toString());
      assert.fieldEquals("History", stakeEvent.transaction.hash.toHex(), "event_type", "Stake");
  
      let user = getOrCreateUser(poolAddress, userAddress);
      assert.fieldEquals("User", user.id, "amount", amount.toString());
  
      let pool = Pool.load(poolAddress.toHex())!;
      assert.fieldEquals("Pool", pool.id, "totalStaked", amount.toString());
    });

    test("Claim Event", () => {
      let userAddress = Address.fromString("0x1234567890abcdef1234567890abcdef12345678");
      let tokenIds = Bytes.fromHexString("0x01");
      let stakeEvent = createStakeEvent(userAddress, tokenIds);
      let claimEvent = createClaimEvent(userAddress, BigInt.fromI32(10));
  
      handleStake(stakeEvent);
      handleClaim(claimEvent);
  
      assert.fieldEquals("User", userAddress.toHex(), "pending", "0");
      assert.fieldEquals("User", userAddress.toHex(), "claimed", "10");
      assert.fieldEquals("Pool", stakeEvent.address.toHex(), "totalClaimed", "10");
    });

    test("Update Pool Event", () => {
      let accumulatedRewardTokenPerShare = BigInt.fromI32(100);
      let totalStaked = BigInt.fromI32(10);
      let lastBlockNumber = BigInt.fromI32(6500);
      let poolUpdateEvent = createPoolUpdateEvent(accumulatedRewardTokenPerShare, totalStaked, lastBlockNumber);
  
      handleUpdatePool(poolUpdateEvent);
  
      assert.fieldEquals("Pool", poolUpdateEvent.address.toHex(), "accRewardPerShare", accumulatedRewardTokenPerShare.toString());
      assert.fieldEquals("Pool", poolUpdateEvent.address.toHex(), "totalStaked", totalStaked.toString());
      assert.fieldEquals("Pool", poolUpdateEvent.address.toHex(), "lastRewardTimestamp", lastBlockNumber.toString());
    });
});