import { BigInt, Address } from "@graphprotocol/graph-ts";
import { Token, NFToken } from "../../generated/schema";
import { ERC20 } from "../../generated/ERC20LockUpFactory/ERC20"
import { ERC721 } from "../../generated/ERC721LockUpFactory/ERC721"

export const ft_lu_factory = "0xd1F2c510c5D8edDd9728451049Ae8260c4A5Cf6a";
export const ft_pen_factory = "0x3a5A49977C4Ee74C8354c2464E3f3b8961bC27C0";
export const nft_lu_factory = "0xA1E06Df5bEb9D6A947bC2Cda39F714Ca4eF2A139";
export const nft_pen_factory = "0xD924A321cAFdc67848E5944cEE1Ac1971C1d1Dd4";

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

export function fetchNFToken(tokenAddress: Address, poolAddress: Address): NFToken {
  let token = NFToken.load(tokenAddress.toHexString());

  if (token == null) {
    token = new NFToken(tokenAddress.toHexString());
    let tokenContract = ERC721.bind(tokenAddress);

    let token_id = BigInt.fromString(token.id);
    let trytokenId = tokenContract.try_tokenURI(token_id);
    let tryOwner = tokenContract.try_ownerOf(token_id);

    token.tokenId = trytokenId.reverted ? "" : trytokenId.value;
    token.owner = tryOwner.reverted ? "" : tryOwner.value.toString();
    token.pool = poolAddress.toString();
    token.save();
  }

  return token as NFToken;
}