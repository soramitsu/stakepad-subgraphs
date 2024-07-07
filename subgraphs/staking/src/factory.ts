import { Pool, Request } from "../generated/schema";

import {
  StakingPoolDeployed,
  RequestSubmitted as LockUpPoolRequestSubmitted,
  RequestStatusChanged
} from "../generated/ERC20LockUpFactory/ERC20LockUpStakingFactory"

import {
  RequestSubmitted as PenaltyPoolRequestSubmitted
} from "../generated/ERC20PenaltyFeeFactory/ERC20PenaltyFeeStakingFactory"

import { ERC20LockUpStakingPool as StakingPoolTemplate } from "../generated/templates";
import { BigInt, Address } from "@graphprotocol/graph-ts";
import { fetchToken } from "../src/utils/token";
import { getOrCreateFactory } from "../src/utils/factory";

/**
 * Handles the `RequestSubmitted` event for LockUp Pools emitted 
 * by the ERC20 StakingFactory contract.
 * 
 * Indexing the request submission event for lock-up pools
 * Replicating the provided data in the new Request entity
 *
 * @param event - The LockUpPoolRequestSubmitted event contains the request details.
 */
export function handleLockUpPoolRequestSubmitted(event: LockUpPoolRequestSubmitted): void {
  const requestId = event.address.toHex() + "-" + event.params.id.toString();

  let request = new Request(requestId);
  request.ipfsHash = event.params.ipfsHash.toHex();
  request.deployer = event.params.deployer.toHex();
  request.requestStatus = BigInt.fromI32(1);
  request.stakeToken = event.params.data.stakeToken.toHex();
  request.rewardToken = event.params.data.rewardToken.toHex();
  request.poolStartTime = event.params.data.poolStartTime;
  request.poolEndTime = event.params.data.poolEndTime;
  request.rewardPerSecond = event.params.data.rewardPerSecond;
  request.unstakeLockUpTime = event.params.data.unstakeLockUpTime;
  request.claimLockUpTime = event.params.data.claimLockUpTime;
  request.penaltyPeriod = BigInt.fromI32(0);
  request.save();
}

/**
 * Handles the `RequestSubmitted` event for Penalty Pools emitted 
 * by the ERC20 PenaltyFeeStakingFactory contract.
 * 
 * Indexing the request submission event for penalty pools
 * Replicating the provided data in the new Request entity
 *
 * @param event - The PenaltyPoolRequestSubmitted event contains the request details.
 */
export function handlePenaltyPoolRequestSubmitted(event: PenaltyPoolRequestSubmitted): void {
  const requestId = event.address.toHex() + "-" + event.params.id.toString();

  let request = new Request(requestId);
  request.deployer = event.params.deployer.toHex();
  request.requestStatus = BigInt.fromI32(1);
  request.stakeToken = event.params.data.stakeToken.toHex();
  request.rewardToken = event.params.data.rewardToken.toHex();
  request.poolStartTime = event.params.data.poolStartTime;
  request.poolEndTime = event.params.data.poolEndTime;
  request.rewardPerSecond = event.params.data.rewardPerSecond;
  request.unstakeLockUpTime = BigInt.fromI32(0);
  request.claimLockUpTime = BigInt.fromI32(0);
  request.penaltyPeriod = event.params.data.penaltyPeriod;
  request.save();
}

/**
 * Handles the `StakingPoolDeployed` event emitted 
 * by the ERC20 StakingFactory (LockUp | Penalty) contract.
 * 
 * Indexing the staking pool deployment event
 * Updating the factory's total pool count,
 * Initializing the Pool entity from the incoming request
 *
 * @param event - The StakingPoolDeployed event contains the deployment details.
 */
export function handlePoolDeployment(event: StakingPoolDeployed): void {
  const poolAddress = event.params.stakingAddress.toHex();
  const requestId = event.address.toHex() + "-" + event.params.id.toString();

  let factory = getOrCreateFactory(event.address);
  factory.totalPools = factory.totalPools.plus(BigInt.fromI32(1));
  factory.poolAddress.push(poolAddress);
  factory.save();

  let request = Request.load(requestId)!;
  request.requestStatus = BigInt.fromI32(4);
  request.save();

  let stakeToken = fetchToken(Address.fromString(request.stakeToken));
  let rewardToken = fetchToken(Address.fromString(request.rewardToken));

  let pool = new Pool(poolAddress);
  pool.stakeToken = stakeToken.id;
  pool.rewardToken = rewardToken.id;
  pool.startTime = request.poolStartTime;
  pool.endTime = request.poolEndTime;
  pool.unstakeLockUpTime = request.unstakeLockUpTime;
  pool.claimLockUpTime = request.claimLockUpTime;
  pool.penaltyPeriod = request.penaltyPeriod;
  pool.rewardTokenPerSecond = request.rewardPerSecond; // TODO COPY ALL REQUEST PARAMS, CREATE HELPER FUNCTION
  pool.totalStaked = BigInt.fromI32(0);
  pool.totalClaimed = BigInt.fromI32(0);
  pool.accRewardPerShare = BigInt.fromI32(0);
  pool.lastRewardTimestamp = request.poolStartTime;
  pool.owner = request.deployer;
  pool.save();

  StakingPoolTemplate.create(event.params.stakingAddress);
}

/**
 * Handles the `RequestStatusChanged` event emitted 
 * by the ERC20 StakingFactory (LockUp | Penalty) contract.
 * 
 * Indexing the request status change event
 * Updating the status of the corresponding request entity.
 *
 * @param event - The RequestStatusChanged event contains the updated status and request ID.
 */
export function handlePoolStatusChanged(event: RequestStatusChanged): void {
  const requestId = event.address.toHex() + "-" + event.params.id.toString();
  let request = Request.load(requestId)!;
  request.requestStatus = BigInt.fromI32(event.params.status);
  request.save();
}