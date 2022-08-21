import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";

import exampleDocument from "../mocks/exampleDocument.json";
import { getSerializedSignedVC } from "../utils/sign";

task("issue", "Issue a signed and serialized VC", async (_taskArgs, hre) => {
  const signers: SignerWithAddress[] = await hre.ethers.getSigners();
  const signer = signers[0];
  const chainId = hre.network.config.chainId;

  if (!chainId) {
    throw new Error("Missing chain id");
  }

  const serializedVC = await getSerializedSignedVC({
    signer,
    chainId,
    domainName: "dao-vc-verifier-test",
    verifyingContractAddress: hre.ethers.constants.AddressZero,
    document: exampleDocument,
  });

  console.log("serializedVC: ", JSON.stringify(serializedVC, null, 2));
});
