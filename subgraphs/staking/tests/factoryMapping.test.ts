import { Bytes, Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { test, assert, newMockEvent, clearStore, createMockedFunction } from "matchstick-as/assembly/index";
import { StakingPoolDeployed, RequestSubmitted, RequestStatusChanged } from "../generated/ERC20LockUpFactory/ERC20LockUpStakingFactory";
import { RequestSubmitted as PenaltyPoolRequestSubmitted } from "../generated/ERC20PenaltyFeeFactory/ERC20PenaltyFeeStakingFactory";
import { handleLockUpPoolRequestSubmitted, handlePenaltyPoolRequestSubmitted, handlePoolDeployment, handlePoolStatusChanged } from "../src/factory";

function mockTokenContract(address: Address, name: string, symbol: string, decimals: i32): void {
  createMockedFunction(address, "name", "name():(string)").returns([ethereum.Value.fromString(name)]);
  createMockedFunction(address, "symbol", "symbol():(string)").returns([ethereum.Value.fromString(symbol)]);
  createMockedFunction(address, "decimals", "decimals():(uint8)").returns([ethereum.Value.fromI32(decimals)]);
}

function createRequestSubmittedEvent(
  id: BigInt,
  deployer: Address,
  ipfsHash: string,
  stakeToken: Address,
  rewardToken: Address,
  rewardPerSecond: BigInt,
  poolStartTime: BigInt,
  poolEndTime: BigInt,
  unstakeLockUpTime: BigInt,
  claimLockUpTime: BigInt,
  isPenalty: boolean,
  penaltyPeriod: BigInt = BigInt.fromI32(0)
): RequestSubmitted {
  let mockEvent = newMockEvent();
  let requestSubmittedEvent = new RequestSubmitted(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
  );
  requestSubmittedEvent.parameters = new Array();

  requestSubmittedEvent.parameters.push(new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id)));
  requestSubmittedEvent.parameters.push(new ethereum.EventParam("deployer", ethereum.Value.fromAddress(deployer)));
  requestSubmittedEvent.parameters.push(new ethereum.EventParam("ipfsHash", ethereum.Value.fromFixedBytes(Bytes.fromHexString(ipfsHash))));
  requestSubmittedEvent.parameters.push(new ethereum.EventParam("data", ethereum.Value.fromTuple(
    changetype<ethereum.Tuple>([
      ethereum.Value.fromAddress(stakeToken),
      ethereum.Value.fromAddress(rewardToken),
      ethereum.Value.fromUnsignedBigInt(rewardPerSecond),
      ethereum.Value.fromUnsignedBigInt(poolStartTime),
      ethereum.Value.fromUnsignedBigInt(poolEndTime),
      ethereum.Value.fromUnsignedBigInt(unstakeLockUpTime),
      ethereum.Value.fromUnsignedBigInt(claimLockUpTime),
      isPenalty ? ethereum.Value.fromUnsignedBigInt(penaltyPeriod) : ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))
    ])
  )));

  requestSubmittedEvent.block.number = mockEvent.block.number;
  requestSubmittedEvent.block.timestamp = mockEvent.block.timestamp;
  requestSubmittedEvent.transaction.from = mockEvent.transaction.from;
  requestSubmittedEvent.transaction.hash = mockEvent.transaction.hash;

  return requestSubmittedEvent;
}

function createPenaltyPoolRequestSubmittedEvent(
  id: BigInt,
  deployer: Address,
  stakeToken: Address,
  rewardToken: Address,
  rewardPerSecond: BigInt,
  poolStartTime: BigInt,
  poolEndTime: BigInt,
  penaltyPeriod: BigInt
): PenaltyPoolRequestSubmitted {
  let mockEvent = newMockEvent();
  let requestSubmittedEvent = new PenaltyPoolRequestSubmitted(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
  );

  requestSubmittedEvent.parameters = new Array();

  requestSubmittedEvent.parameters.push(new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id)));
  requestSubmittedEvent.parameters.push(new ethereum.EventParam("deployer", ethereum.Value.fromAddress(deployer)));
  requestSubmittedEvent.parameters.push(new ethereum.EventParam("data", ethereum.Value.fromTuple(
    changetype<ethereum.Tuple>([
      ethereum.Value.fromAddress(stakeToken),
      ethereum.Value.fromAddress(rewardToken),
      ethereum.Value.fromUnsignedBigInt(rewardPerSecond),
      ethereum.Value.fromUnsignedBigInt(poolStartTime),
      ethereum.Value.fromUnsignedBigInt(poolEndTime),
      ethereum.Value.fromUnsignedBigInt(penaltyPeriod)
    ])
  )));

  requestSubmittedEvent.block.number = mockEvent.block.number;
  requestSubmittedEvent.block.timestamp = mockEvent.block.timestamp;
  requestSubmittedEvent.transaction.from = mockEvent.transaction.from;
  requestSubmittedEvent.transaction.hash = mockEvent.transaction.hash;

  return requestSubmittedEvent;
}

function createStakingPoolDeployedEvent(id: BigInt, stakingAddress: Address): StakingPoolDeployed {
  let mockEvent = newMockEvent();
  let stakingPoolDeployedEvent = new StakingPoolDeployed(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
  );

  stakingPoolDeployedEvent.parameters = new Array();

  stakingPoolDeployedEvent.parameters.push(new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id)));
  stakingPoolDeployedEvent.parameters.push(new ethereum.EventParam("stakingAddress", ethereum.Value.fromAddress(stakingAddress)));

  stakingPoolDeployedEvent.block.number = mockEvent.block.number;
  stakingPoolDeployedEvent.block.timestamp = mockEvent.block.timestamp;
  stakingPoolDeployedEvent.transaction.from = mockEvent.transaction.from;
  stakingPoolDeployedEvent.transaction.hash = mockEvent.transaction.hash;

  return stakingPoolDeployedEvent;
}

function createRequestStatusChangedEvent(id: BigInt, status: BigInt): RequestStatusChanged {
  let mockEvent = newMockEvent();
  let requestStatusChangedEvent = new RequestStatusChanged(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
  );

  requestStatusChangedEvent.parameters = new Array();

  requestStatusChangedEvent.parameters.push(new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id)));
  requestStatusChangedEvent.parameters.push(new ethereum.EventParam("status", ethereum.Value.fromUnsignedBigInt(status)));

  requestStatusChangedEvent.block.number = mockEvent.block.number;
  requestStatusChangedEvent.block.timestamp = mockEvent.block.timestamp;
  requestStatusChangedEvent.transaction.from = mockEvent.transaction.from;
  requestStatusChangedEvent.transaction.hash = mockEvent.transaction.hash;

  return requestStatusChangedEvent;
}

test("handleLockUpPoolRequestSubmitted creates a new Request entity", () => {
    let requestId = BigInt.fromI32(1);
    let deployer = Address.fromString("0x0000000000000000000000000000000000000001");
    let stakeToken = Address.fromString("0x0000000000000000000000000000000000000002");
    let rewardToken = Address.fromString("0x0000000000000000000000000000000000000003");
  
    mockTokenContract(stakeToken, "Stake Token", "USDC", 18);
    mockTokenContract(rewardToken, "Reward Token", "USDR", 18);
  
    let event = createRequestSubmittedEvent(
      requestId,
      deployer,
      "0x12233445566778899aabbccddeeff00112233445566778899aabbccddeeff00",
      stakeToken,
      rewardToken,
      BigInt.fromI32(1000),
      BigInt.fromI32(1625247600),
      BigInt.fromI32(1627849600),
      BigInt.fromI32(3600),
      BigInt.fromI32(7200),
      false
    );
  
    handleLockUpPoolRequestSubmitted(event);
  
    let id = event.address.toHex() + "-" + requestId.toString();
    assert.fieldEquals("Request", id, "deployer", deployer.toHex());
    assert.fieldEquals("Request", id, "stakeToken", stakeToken.toHex());
    assert.fieldEquals("Request", id, "rewardToken", rewardToken.toHex());
    assert.fieldEquals("Request", id, "rewardPerSecond", "1000");
    assert.fieldEquals("Request", id, "poolStartTime", "1625247600");
    assert.fieldEquals("Request", id, "poolEndTime", "1627849600");
    assert.fieldEquals("Request", id, "unstakeLockUpTime", "3600");
    assert.fieldEquals("Request", id, "claimLockUpTime", "7200");
    assert.fieldEquals("Request", id, "requestStatus", "1");
  
    clearStore();
});
  

test("handlePenaltyPoolRequestSubmitted creates a new Request entity", () => {
    let requestId = BigInt.fromI32(2);
    let deployer = Address.fromString("0x0000000000000000000000000000000000000004");
    let stakeToken = Address.fromString("0x0000000000000000000000000000000000000005");
    let rewardToken = Address.fromString("0x0000000000000000000000000000000000000006");
  
    mockTokenContract(stakeToken, "Stake Token", "USDC", 18);
    mockTokenContract(rewardToken, "Reward Token", "USDR", 18);
  
    let event = createPenaltyPoolRequestSubmittedEvent(
      requestId,
      deployer,
      stakeToken,
      rewardToken,
      BigInt.fromI32(2000),
      BigInt.fromI32(1625247600),
      BigInt.fromI32(1627849600),
      BigInt.fromI32(3600)
    );
  
    handlePenaltyPoolRequestSubmitted(event);
  
    let id = event.address.toHex() + "-" + requestId.toString();
    assert.fieldEquals("Request", id, "deployer", deployer.toHex());
    assert.fieldEquals("Request", id, "stakeToken", stakeToken.toHex());
    assert.fieldEquals("Request", id, "rewardToken", rewardToken.toHex());
    assert.fieldEquals("Request", id, "rewardPerSecond", "2000");
    assert.fieldEquals("Request", id, "poolStartTime", "1625247600");
    assert.fieldEquals("Request", id, "poolEndTime", "1627849600");
    assert.fieldEquals("Request", id, "penaltyPeriod", "3600");
    assert.fieldEquals("Request", id, "requestStatus", "1");
  
    clearStore();
});

  
test("handlePoolDeployment updates Request status and creates a Pool entity", () => {
    let requestId = BigInt.fromI32(1);
    let deployer = Address.fromString("0x0000000000000000000000000000000000000001");
    let stakingAddress = Address.fromString("0x0000000000000000000000000000000000000007");
    let stakeToken = Address.fromString("0x0000000000000000000000000000000000000002");
    let rewardToken = Address.fromString("0x0000000000000000000000000000000000000003");
  
    mockTokenContract(stakeToken, "Stake Token", "USDC", 18);
    mockTokenContract(rewardToken, "Reward Token", "USDR", 18);
  
    let requestEvent = createRequestSubmittedEvent(
      requestId,
      deployer,
      "0x12233445566778899aabbccddeeff00112233445566778899aabbccddeeff00",
      stakeToken,
      rewardToken,
      BigInt.fromI32(1000),
      BigInt.fromI32(1625247600),
      BigInt.fromI32(1627849600),
      BigInt.fromI32(3600),
      BigInt.fromI32(7200),
      false
    );
  
    handleLockUpPoolRequestSubmitted(requestEvent);
  
    let deploymentEvent = createStakingPoolDeployedEvent(requestId, stakingAddress);
    handlePoolDeployment(deploymentEvent);
  
    let requestIdString = requestEvent.address.toHex() + "-" + requestId.toString();
    let poolId = stakingAddress.toHex();
  
    assert.fieldEquals("Request", requestIdString, "requestStatus", "4");
  
    assert.fieldEquals("Pool", poolId, "stakeToken", stakeToken.toHex());
    assert.fieldEquals("Pool", poolId, "rewardToken", rewardToken.toHex());
    assert.fieldEquals("Pool", poolId, "rewardTokenPerSecond", "1000");
    assert.fieldEquals("Pool", poolId, "startTime", "1625247600");
    assert.fieldEquals("Pool", poolId, "endTime", "1627849600");
    assert.fieldEquals("Pool", poolId, "unstakeLockUpTime", "3600");
    assert.fieldEquals("Pool", poolId, "claimLockUpTime", "7200");
    assert.fieldEquals("Pool", poolId, "penaltyPeriod", "0");
    assert.fieldEquals("Pool", poolId, "totalStaked", "0");
    assert.fieldEquals("Pool", poolId, "totalClaimed", "0");
    assert.fieldEquals("Pool", poolId, "accRewardPerShare", "0");
    assert.fieldEquals("Pool", poolId, "lastRewardTimestamp", "1625247600");
    assert.fieldEquals("Pool", poolId, "owner", deployer.toHex());
  
    clearStore();
});

  
test("handlePoolStatusChanged updates the Request status", () => {
    let requestId = BigInt.fromI32(3);
    let deployer = Address.fromString("0x0000000000000000000000000000000000000008");
    let stakeToken = Address.fromString("0x0000000000000000000000000000000000000009");
    let rewardToken = Address.fromString("0x0000000000000000000000000000000000000010");

    mockTokenContract(stakeToken, "Stake Token", "USDC", 18);
    mockTokenContract(rewardToken, "Reward Token", "USDR", 18);

    let requestEvent = createRequestSubmittedEvent(
        requestId,
        deployer,
        "0x12233445566778899aabbccddeeff00112233445566778899aabbccddeeff00",
        stakeToken,
        rewardToken,
        BigInt.fromI32(3000),
        BigInt.fromI32(1625247600),
        BigInt.fromI32(1627849600),
        BigInt.fromI32(0),
        BigInt.fromI32(0),
        false
    );

    handleLockUpPoolRequestSubmitted(requestEvent);

    let statusChangedEvent = createRequestStatusChangedEvent(requestId, BigInt.fromI32(3));
    handlePoolStatusChanged(statusChangedEvent);

    let requestIdString = requestEvent.address.toHex() + "-" + requestId.toString();
    assert.fieldEquals("Request", requestIdString, "requestStatus", "3");

    clearStore();
});