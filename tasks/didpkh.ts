import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";

import { DIDpkhAdapter, DIDpkhAdapter__factory } from "../src/types";

task("didpkh:resolve", "", async (_taskArgs, hre) => {
  const signers: SignerWithAddress[] = await hre.ethers.getSigners();
  const factory = <DIDpkhAdapter__factory>await hre.ethers.getContractFactory("DIDpkhAdapter");
  const adapter = <DIDpkhAdapter>await factory.connect(signers[0]).deploy();
  const result = await adapter.pseudoResolve("did:pkh:eip155:1:0xAED7EA8035eEc47E657B34eF5D020c7005487443");
  console.log("Expected: 0xAED7EA8035eEc47E657B34eF5D020c7005487443");
  console.log(`Received: ${result}`);
});
