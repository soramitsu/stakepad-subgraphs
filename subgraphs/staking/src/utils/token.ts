import { BigInt, Address } from "@graphprotocol/graph-ts";
import { Token } from "../../generated/schema";
import { ERC20 } from "../../generated/ERC20LockUpFactory/ERC20"

export function fetchToken(tokenAddress: Address): Token {
    let token = Token.load(tokenAddress.toHexString());

    if (token == null) {
      token = new Token(tokenAddress.toHexString());
      let tokenContract = ERC20.bind(tokenAddress);
      token.name = tokenContract.name();
      token.symbol = tokenContract.symbol();
      token.decimals = BigInt.fromI32(tokenContract.decimals());
      token.save();
    }

    return token as Token;
  }