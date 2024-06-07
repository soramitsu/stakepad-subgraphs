import { BigInt, Address } from "@graphprotocol/graph-ts";
import { Token, NFToken } from "../../generated/schema";
import { ERC20 } from "../../generated/ERC20LockUpFactory/ERC20"
import { ERC721 } from "../../generated/ERC721LockUpFactory/ERC721"

export function fetchToken(tokenAddress: Address): Token {
    let token = Token.load(tokenAddress.toHexString());

    if (token == null) {
      token = new Token(tokenAddress.toHexString());
      let tokenContract = ERC20.bind(tokenAddress);
      let tryName = tokenContract.try_name();
      let trySymbol = tokenContract.try_symbol();
      let tryDecimals = tokenContract.try_decimals();

      token.name = tryName.reverted ? "" : tryName.value;
      token.symbol = trySymbol.reverted ? "" : trySymbol.value;
      token.decimals = tryDecimals.reverted ? BigInt.fromI32(0) : BigInt.fromI32(tryDecimals.value);
      token.save();
    }

    return token as Token;
}

export function fetchNFToken(tokenAddress: Address): NFToken {
  let token = NFToken.load(tokenAddress.toHexString());

  if (token == null) {
    token = new NFToken(tokenAddress.toHexString());
    let tokenContract = ERC721.bind(tokenAddress);
    token.tokenId = "";
    token.owner = "";
    token.pool = "";
    token.save();
  }

  return token as NFToken;
}