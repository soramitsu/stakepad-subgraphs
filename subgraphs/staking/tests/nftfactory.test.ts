import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { test, assert, newMockEvent, clearStore, createMockedFunction, describe } from "matchstick-as/assembly/index";
import { 
    StakingPoolDeployed, 
    RequestSubmitted as LockUpPoolRequestSubmitted, 
    RequestStatusChanged 
} from "../generated/ERC721LockUpFactory/ERC721LockUpStakingFactory";

import { 
    RequestSubmitted as PenaltyPoolRequestSubmitted 
} from "../generated/ERC721PenaltyFeeFactory/ERC721PenaltyFeeStakingFactory";

import { 
    handleLockUpPoolRequestSubmitted, 
    handlePenaltyPoolRequestSubmitted, 
    handlePoolDeployment, 
    handlePoolStatusChanged 
} from "../src/nft_factory";

export function createLockUpPoolRequestSubmittedEvent(
    id: BigInt,
    deployer: Address,
    stakeToken: Address,
    rewardToken: Address,
    poolStartTime: BigInt,
    poolEndTime: BigInt,
    rewardPerSecond: BigInt,
    unstakeLockUpTime: BigInt,
    claimLockUpTime: BigInt
  ): LockUpPoolRequestSubmitted {
    
    let mockEvent = newMockEvent()
    let event = new LockUpPoolRequestSubmitted(
      mockEvent.address,
      mockEvent.logIndex,
      mockEvent.transactionLogIndex,
      mockEvent.logType,
      mockEvent.block,
      mockEvent.transaction,
      mockEvent.parameters,
      mockEvent.receipt
    )
  
    event.parameters = new Array()
  
    let idParam = new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
    let deployerParam = new ethereum.EventParam("deployer", ethereum.Value.fromAddress(deployer))
    let stakeTokenParam = new ethereum.EventParam("stakeToken", ethereum.Value.fromAddress(stakeToken))
    let rewardTokenParam = new ethereum.EventParam("rewardToken", ethereum.Value.fromAddress(rewardToken))
    let poolStartTimeParam = new ethereum.EventParam("poolStartTime", ethereum.Value.fromUnsignedBigInt(poolStartTime))
    let poolEndTimeParam = new ethereum.EventParam("poolEndTime", ethereum.Value.fromUnsignedBigInt(poolEndTime))
    let rewardPerSecondParam = new ethereum.EventParam("rewardPerSecond", ethereum.Value.fromUnsignedBigInt(rewardPerSecond))
    let unstakeLockUpTimeParam = new ethereum.EventParam("unstakeLockUpTime", ethereum.Value.fromUnsignedBigInt(unstakeLockUpTime))
    let claimLockUpTimeParam = new ethereum.EventParam("claimLockUpTime", ethereum.Value.fromUnsignedBigInt(claimLockUpTime))
  
    event.parameters.push(idParam)
    event.parameters.push(deployerParam)
    event.parameters.push(stakeTokenParam)
    event.parameters.push(rewardTokenParam)
    event.parameters.push(poolStartTimeParam)
    event.parameters.push(poolEndTimeParam)
    event.parameters.push(rewardPerSecondParam)
    event.parameters.push(unstakeLockUpTimeParam)
    event.parameters.push(claimLockUpTimeParam)
  
    return event
  }
  
  export function createPenaltyPoolRequestSubmittedEvent(
    id: BigInt,
    deployer: Address,
    stakeToken: Address,
    rewardToken: Address,
    poolStartTime: BigInt,
    poolEndTime: BigInt,
    rewardPerSecond: BigInt,
    penaltyPeriod: BigInt
  ): PenaltyPoolRequestSubmitted {

    let mockEvent = newMockEvent()
    let event = new PenaltyPoolRequestSubmitted(
      mockEvent.address,
      mockEvent.logIndex,
      mockEvent.transactionLogIndex,
      mockEvent.logType,
      mockEvent.block,
      mockEvent.transaction,
      mockEvent.parameters,
      mockEvent.receipt
    )
  
    event.parameters = new Array()
  
    let idParam = new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
    let deployerParam = new ethereum.EventParam("deployer", ethereum.Value.fromAddress(deployer))
    let stakeTokenParam = new ethereum.EventParam("stakeToken", ethereum.Value.fromAddress(stakeToken))
    let rewardTokenParam = new ethereum.EventParam("rewardToken", ethereum.Value.fromAddress(rewardToken))
    let poolStartTimeParam = new ethereum.EventParam("poolStartTime", ethereum.Value.fromUnsignedBigInt(poolStartTime))
    let poolEndTimeParam = new ethereum.EventParam("poolEndTime", ethereum.Value.fromUnsignedBigInt(poolEndTime))
    let rewardPerSecondParam = new ethereum.EventParam("rewardPerSecond", ethereum.Value.fromUnsignedBigInt(rewardPerSecond))
    let penaltyPeriodParam = new ethereum.EventParam("penaltyPeriod", ethereum.Value.fromUnsignedBigInt(penaltyPeriod))
  
    event.parameters.push(idParam)
    event.parameters.push(deployerParam)
    event.parameters.push(stakeTokenParam)
    event.parameters.push(rewardTokenParam)
    event.parameters.push(poolStartTimeParam)
    event.parameters.push(poolEndTimeParam)
    event.parameters.push(rewardPerSecondParam)
    event.parameters.push(penaltyPeriodParam)
  
    return event
  }
  
  export function createStakingPoolDeployedEvent(
    id: BigInt,
    stakingAddress: Address
  ): StakingPoolDeployed {

    let mockEvent = newMockEvent()
    let event = new StakingPoolDeployed(
      mockEvent.address,
      mockEvent.logIndex,
      mockEvent.transactionLogIndex,
      mockEvent.logType,
      mockEvent.block,
      mockEvent.transaction,
      mockEvent.parameters,
      mockEvent.receipt
    )
  
    event.parameters = new Array()
  
    let idParam = new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
    let stakingAddressParam = new ethereum.EventParam("stakingAddress", ethereum.Value.fromAddress(stakingAddress))
  
    event.parameters.push(idParam)
    event.parameters.push(stakingAddressParam)
  
    return event
  }
  
  export function createRequestStatusChangedEvent(
    id: BigInt,
    status: i32
  ): RequestStatusChanged {

    let mockEvent = newMockEvent()
    let event = new RequestStatusChanged(
      mockEvent.address,
      mockEvent.logIndex,
      mockEvent.transactionLogIndex,
      mockEvent.logType,
      mockEvent.block,
      mockEvent.transaction,
      mockEvent.parameters,
      mockEvent.receipt
    )
  
    event.parameters = new Array()
  
    let idParam = new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
    let statusParam = new ethereum.EventParam("status", ethereum.Value.fromI32(status))
  
    event.parameters.push(idParam)
    event.parameters.push(statusParam)
  
    return event
  }
  
test("handleLockUpPoolRequestSubmitted", () => {
    let id = BigInt.fromI32(1)
    let deployer = Address.fromString("0x7eD3C6")
    let stakeToken = Address.fromString("0x4F3e8F6D76A1d2d2E84015b4F947450E606D5E9B")
    let rewardToken = Address.fromString("0xD1B3A918A0E10F5b42D29AD4F1BfB0cD82D383A3")
    let poolStartTime = BigInt.fromI32(162254000)
    let poolEndTime = BigInt.fromI32(162516600)
    let rewardPerSecond = BigInt.fromI32(10)
    let unstakeLockUpTime = BigInt.fromI32(600)
    let claimLockUpTime = BigInt.fromI32(600)

    let event = createLockUpPoolRequestSubmittedEvent(
        id,
        deployer,
        stakeToken,
        rewardToken,
        poolStartTime,
        poolEndTime,
        rewardPerSecond,
        unstakeLockUpTime,
        claimLockUpTime
    )

    handleLockUpPoolRequestSubmitted(event)

    assert.fieldEquals("Request", "0x7eD3C6", "deployer", deployer.toHex())
    assert.fieldEquals("Request", "0x7eD3C6", "stakeToken", stakeToken.toHex())
    assert.fieldEquals("Request", "0x7eD3C6", "rewardToken", rewardToken.toHex())
    assert.fieldEquals("Request", "0x7eD3C6", "poolStartTime", poolStartTime.toString())
    assert.fieldEquals("Request", "0x7eD3C6", "poolEndTime", poolEndTime.toString())
    assert.fieldEquals("Request", "0x7eD3C6", "rewardPerSecond", rewardPerSecond.toString())
    assert.fieldEquals("Request", "0x7eD3C6", "unstakeLockUpTime", unstakeLockUpTime.toString())
    assert.fieldEquals("Request", "0x7eD3C6", "claimLockUpTime", claimLockUpTime.toString())
    assert.fieldEquals("Request", "0x7eD3C6", "penaltyPeriod", "0")
})

test("handleLockUpPoolRequestSubmitted Should Fail", () => {
    let id = BigInt.fromI32(1)
    let deployer = Address.fromString("0x7eD3C6")
    let stakeToken = Address.fromString("0x4F3e8F6D76A1d2d2E84015b4F947450E606D5E9B")
    let rewardToken = Address.fromString("0xD1B3A918A0E10F5b42D29AD4F1BfB0cD82D383A3")
    let poolStartTime = BigInt.fromI32(10)
    let poolEndTime = BigInt.fromI32(100)
    let rewardPerSecond = BigInt.fromI32(10)
    let unstakeLockUpTime = BigInt.fromI32(600)
    let claimLockUpTime = BigInt.fromI32(600)

    let event = createLockUpPoolRequestSubmittedEvent(
        id,
        deployer,
        stakeToken,
        rewardToken,
        poolStartTime,
        poolEndTime,
        rewardPerSecond,
        unstakeLockUpTime,
        claimLockUpTime
    )

    handleLockUpPoolRequestSubmitted(event)

    assert.notInStore("Request", "0x7eD3C6")
}, true)

test("handlePenaltyPoolRequestSubmitted", () => {
    let id = BigInt.fromI32(1)
    let deployer = Address.fromString("0x12345")
    let stakeToken = Address.fromString("0x4564567890123456789012345678901234567890")
    let rewardToken = Address.fromString("0x7897890123456789012345678901234567890123")
    let poolStartTime = BigInt.fromI32(1622548800)
    let poolEndTime = BigInt.fromI32(1625140800)
    let rewardPerSecond = BigInt.fromI32(10)
    let penaltyPeriod = BigInt.fromI32(300)
    
    let event = createPenaltyPoolRequestSubmittedEvent(
      id,
      deployer,
      stakeToken,
      rewardToken,
      poolStartTime,
      poolEndTime,
      rewardPerSecond,
      penaltyPeriod
    )
  
    handlePenaltyPoolRequestSubmitted(event)
  
    assert.fieldEquals("Request", "0x12345", "deployer", deployer.toHex())
    assert.fieldEquals("Request", "0x12345", "stakeToken", stakeToken.toHex())
    assert.fieldEquals("Request", "0x12345", "rewardToken", rewardToken.toHex())
    assert.fieldEquals("Request", "0x12345", "poolStartTime", poolStartTime.toString())
    assert.fieldEquals("Request", "0x12345", "poolEndTime", poolEndTime.toString())
    assert.fieldEquals("Request", "0x12345", "rewardPerSecond", rewardPerSecond.toString())
    assert.fieldEquals("Request", "0x12345", "penaltyPeriod", penaltyPeriod.toString())
})

test("handlePenaltyPoolRequestSubmitted", () => {
    let id = BigInt.fromI32(1)
    let deployer = Address.fromString("0x12345")
    let stakeToken = Address.fromString("0x4564567890123456789012345678901234567890")
    let rewardToken = Address.fromString("0x7897890123456789012345678901234567890123")
    let poolStartTime = BigInt.fromI32(25)
    let poolEndTime = BigInt.fromI32(75)
    let rewardPerSecond = BigInt.fromI32(15)
    let penaltyPeriod = BigInt.fromI32(300)
    
    let event = createPenaltyPoolRequestSubmittedEvent(
      id,
      deployer,
      stakeToken,
      rewardToken,
      poolStartTime,
      poolEndTime,
      rewardPerSecond,
      penaltyPeriod
    )
  
    handlePenaltyPoolRequestSubmitted(event)
  
    assert.notInStore("Request", "0x3569")
}, true)

test("handlePoolDeployment", () => {
    let id = BigInt.fromI32(1)
    let stakingAddress = Address.fromString("0x1234567890123456789012345678901234567890")
    let event = createStakingPoolDeployedEvent(id, stakingAddress)
    
    handlePoolDeployment(event)
  
    assert.fieldEquals("Pool", stakingAddress.toHex(), "stakeToken", "0x4564567890123456789012345678901234567890")
    assert.fieldEquals("Pool", stakingAddress.toHex(), "rewardToken", "0x7897890123456789012345678901234567890123")
    assert.fieldEquals("Pool", stakingAddress.toHex(), "startTime", "1622548800")
    assert.fieldEquals("Pool", stakingAddress.toHex(), "endTime", "1625140800")
    assert.fieldEquals("Pool", stakingAddress.toHex(), "rewardTokenPerSecond", "10")
    assert.fieldEquals("Pool", stakingAddress.toHex(), "totalStaked", "0")
    assert.fieldEquals("Pool", stakingAddress.toHex(), "totalClaimed", "0")
    assert.fieldEquals("Pool", stakingAddress.toHex(), "accRewardPerShare", "0")
    assert.fieldEquals("Pool", stakingAddress.toHex(), "lastRewardTimestamp", "1622548800")
    assert.fieldEquals("Pool", stakingAddress.toHex(), "owner", "0x1234567890123456789012345678901234567890")
})
  
test("handlePoolStatusChanged", () => {
    let id = BigInt.fromI32(1)
    let status = 3
    let event = createRequestStatusChangedEvent(id, status)
    
    handlePoolStatusChanged(event)
  
    let requestId = event.address.toHex() + "-" + id.toString()
    assert.fieldEquals("Request", requestId, "requestStatus", status.toString())
})