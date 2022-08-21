import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Signature, ethers } from "ethers";

import { ExampleDocument } from "../types";
import { daoVCTypes, primaryType } from "../types/eip712Types";

const getDomain = (name: string, chainId: number, verifyingContract: string) => ({
  name,
  version: "1",
  chainId,
  verifyingContract,
});

export type GetSerializedVCInputs = {
  signer: SignerWithAddress;
  domainName: string;
  verifyingContractAddress: string;
  chainId: number;
  document: ExampleDocument;
};

export const getSerializedSignedVC = async ({
  signer,
  domainName,
  verifyingContractAddress,
  chainId,
  document,
}: GetSerializedVCInputs) => {
  const fullDocument = generateFullDocument(signer.address, document);

  const normalizedDocument = normalizeDocument(fullDocument);
  const signature = await signDocument({
    signer,
    domainName,
    verifyingContractAddress,
    chainId,
    normalizedDocument,
  });

  return {
    ...normalizedDocument,
    proof: {
      created: fullDocument.issuanceDate,
      eip712: {
        domain: {
          name: domainName,
        },
        primaryType,
        types: daoVCTypes,
      },
      proofPurpose: "assertionMethod",
      proofValue: {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      },
      type: "EthereumEip712Signature2021",
      verificationMethod: `${fullDocument.issuer}#blockchainAccountId`,
    },
  };
};

export type FullDocument = ExampleDocument & { issuer: string; issuanceDate: string };

const generateFullDocument = (signerAddress: string, document: ExampleDocument): FullDocument => ({
  ...document,
  issuer: `did:pkh:eip155:1:${signerAddress}`,
  issuanceDate: new Date().toISOString(),
});

export type NormalizedDocument = {
  _context: string[];
  _type: string[];
  credentialSubject: {
    name: string;
    category: string;
  };
  issuer: string;
  issuanceDate: string;
};

const normalizeDocument = (fullDocument: FullDocument): NormalizedDocument => {
  const _context = fullDocument["@context"];
  const _type = fullDocument.type;

  const normalizedDocument = { ...fullDocument, _context, _type };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete normalizedDocument["@context"];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete normalizedDocument["type"];
  return normalizedDocument;
};

export type SignDocumentInputs = {
  signer: SignerWithAddress;
  domainName: string;
  verifyingContractAddress: string;
  chainId: number;
  normalizedDocument: NormalizedDocument & { issuer: string; issuanceDate: string };
};

export const signDocument = async ({
  signer,
  domainName,
  verifyingContractAddress,
  chainId,
  normalizedDocument,
}: SignDocumentInputs): Promise<Signature & { fullSignature: string }> => {
  const domain = getDomain(domainName, chainId, verifyingContractAddress);

  let sig: string;
  try {
    sig = await signer._signTypedData(domain, daoVCTypes, normalizedDocument);
  } catch (err) {
    console.error(err);
    throw err;
  }

  return { fullSignature: sig, ...ethers.utils.splitSignature(sig) };
};
