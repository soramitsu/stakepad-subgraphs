import { Pool, Request } from "../generated/schema";
import { BigInt, Address } from "@graphprotocol/graph-ts";
import { getOrCreateFactory } from "./utils/factory";

import {
  StakingPoolDeployed,
  RequestSubmitted as LockUpPoolRequestSubmitted,
  RequestStatusChanged
} from "../generated/ERC20LockUpFactory/ERC20LockUpStakingFactory"

import {
  RequestSubmitted as PenaltyPoolRequestSubmitted
} from "../generated/ERC20PenaltyFeeFactory/ERC20PenaltyFeeStakingFactory"

import {
  ERC20StakingPool as ERC20StakingPoolTemplate,
  ERC721LockUpStakingPool as ERC721StakingPoolTemplate
} from "../generated/templates";

import {
  fetchToken,
  fetchNFToken,
  ft_lu_factory,
  ft_pen_factory,
  nft_lu_factory,
  nft_pen_factory
} from "./utils/token";

function initPoolFromRequest(pool: Pool, request: Request): void {
  pool.startTime = request.poolStartTime;
  pool.endTime = request.poolEndTime;
  pool.unstakeLockUpTime = request.unstakeLockUpTime;
  pool.claimLockUpTime = request.claimLockUpTime;
  pool.penaltyPeriod = request.penaltyPeriod;
  pool.rewardTokenPerSecond = request.rewardPerSecond;
  pool.totalStaked = BigInt.fromI32(0);
  pool.totalClaimed = BigInt.fromI32(0);
  pool.accRewardPerShare = BigInt.fromI32(0);
  pool.lastRewardTimestamp = request.poolStartTime;
  pool.owner = request.deployer;
}

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

  let isNFTPool = false;
  let pool = new Pool(poolAddress);

  if (poolAddress == ft_lu_factory || poolAddress == ft_pen_factory) {
    let stakeToken = fetchToken(Address.fromString(request.stakeToken));
    let rewardToken = fetchToken(Address.fromString(request.rewardToken));

    pool.stakeToken = stakeToken.id;
    pool.rewardToken = rewardToken.id;
  }
  else if (poolAddress == nft_lu_factory || poolAddress == nft_pen_factory) {
    let stakeNFToken = fetchNFToken(Address.fromString(request.stakeToken), event.params.stakingAddress);
    let rewardNFToken = fetchNFToken(Address.fromString(request.rewardToken), event.params.stakingAddress);

    pool.stakeNFToken = stakeNFToken.id;
    pool.rewardToken = rewardNFToken.id;

    isNFTPool = true;
  }

  initPoolFromRequest(pool, request);
  pool.save();

  if (isNFTPool) {
    ERC721StakingPoolTemplate.create(event.params.stakingAddress);
  }
  else {
    ERC20StakingPoolTemplate.create(event.params.stakingAddress);
  }
}

export function handlePoolStatusChanged(event: RequestStatusChanged): void {
  const requestId = event.address.toHex() + "-" + event.params.id.toString();
  let request = Request.load(requestId)!;
  request.requestStatus = BigInt.fromI32(event.params.status);
  request.save();
}