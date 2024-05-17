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

export function handleLockUpPoolRequestSubmitted(event: LockUpPoolRequestSubmitted): void {
  const requestId = event.address.toHex() + "-" + event.params.id.toString();

  let request = new Request(requestId);
  request.deployer = event.params.deployer;
  request.requestStatus = "CREATED";
  request.stakeToken = event.params.data.stakeToken.toHex();
  request.rewardToken = event.params.data.rewardToken.toHex();
  request.rewardPerSecond = event.params.data.rewardPerSecond;
  request.poolStartTime = event.params.data.poolStartTime;
  request.poolEndTime = event.params.data.poolEndTime;
  request.unstakeLockUpTime = event.params.data.unstakeLockUpTime;
  request.claimLockUpTime = event.params.data.claimLockUpTime;
  request.penaltyPeriod = BigInt.fromI32(0);
  request.save();
}

export function handlePenaltyPoolRequestSubmitted(event: PenaltyPoolRequestSubmitted): void {
  const requestId = event.address.toHex() + "-" + event.params.id.toString();

  let request = new Request(requestId);
  request.deployer = event.params.deployer;
  request.requestStatus = "CREATED";
  request.stakeToken = event.params.data.stakeToken.toHex();
  request.rewardToken = event.params.data.rewardToken.toHex();
  request.rewardPerSecond = event.params.data.rewardPerSecond;
  request.poolStartTime = event.params.data.poolStartTime;
  request.poolEndTime = event.params.data.poolEndTime;
  request.unstakeLockUpTime = BigInt.fromI32(0);
  request.claimLockUpTime = BigInt.fromI32(0);
  request.penaltyPeriod = event.params.data.penaltyPeriod;
  request.save();
}

export function handlePoolDeployment(
  event: StakingPoolDeployed): void {
  const poolAddress = event.params.stakingAddress.toHex();
  const requestId = event.address.toHex() + "-" + event.params.id.toString();

  let factory = getOrCreateFactory(event.address);
  factory.totalPools = factory.totalPools.plus(BigInt.fromI32(1));
  factory.poolAddress.push(poolAddress);
  factory.save();

  let request = Request.load(requestId)!;
  request.requestStatus = "DEPLOYED";
  request.save();

  let stakeToken = fetchToken(Address.fromString(request.stakeToken));
  let rewardToken = fetchToken(Address.fromString(request.rewardToken));

  let pool = new Pool(poolAddress);
  pool.stakeToken = stakeToken.id;
  pool.rewardToken = rewardToken.id;
  pool.startTime = request.poolStartTime;
  pool.endTime = request.poolEndTime;
  pool.rewardTokenPerSecond = request.rewardPerSecond; // TODO COPY ALL REQUEST PARAMS, CREATE HELPER FUNCTION
  pool.totalStaked = BigInt.fromI32(0);
  pool.totalClaimed = BigInt.fromI32(0);
  pool.accRewardPerShare = BigInt.fromI32(0);
  pool.lastRewardTimestamp = request.poolStartTime;
  pool.owner = event.transaction.from.toHex();
  pool.save();

  StakingPoolTemplate.create(event.params.stakingAddress);
}

export function handleLockUpPoolStatusChanged(
  event: RequestStatusChanged): void {
  const requestId = event.address.toHex() + "-" + event.params.id.toString();
  let request = Request.load(requestId)!;
  request.requestStatus = event.params.status.toString();
  request.save();
}