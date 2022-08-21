// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import { VcVerifier } from "./VCVerifier.sol";
import { DIDpkhAdapter } from "./DIDpkhAdapter.sol";

struct DAO {
    string name;
    string category;
}

struct DaoVc {
    string[] _context;
    string[] _type;
    string issuer;
    string issuanceDate;
    DAO credentialSubject;
}

contract DaoVcVerifier is VcVerifier, DIDpkhAdapter {
    bytes32 private constant CREDENTIAL_SUBJECT_TYPEHASH = keccak256("DAO(string name,string category)");

    bytes32 private constant DAO_VC_TYPEHASH =
        keccak256(
            "DaoVc(string[] _context,string[] _type,string issuer,string issuanceDate,DAO credentialSubject)DAO(string name,string category)"
        );

    constructor(string memory domainName) VcVerifier(domainName) {}

    function hashCredentialSubject(DAO calldata dao) public pure returns (bytes32) {
        return
            keccak256(
                abi.encode(CREDENTIAL_SUBJECT_TYPEHASH, keccak256(bytes(dao.name)), keccak256(bytes(dao.category)))
            );
    }

    function hashDaoVC(DaoVc calldata daoVc) public pure returns (bytes32) {
        bytes32 credentialSubjectHash = hashCredentialSubject(daoVc.credentialSubject);

        return
            keccak256(
                abi.encode(
                    DAO_VC_TYPEHASH,
                    _hashArray(daoVc._context),
                    _hashArray(daoVc._type),
                    keccak256(bytes(daoVc.issuer)),
                    keccak256(bytes(daoVc.issuanceDate)),
                    credentialSubjectHash
                )
            );
    }

    function verifyDaoVc(
        DaoVc calldata exampleVC,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view returns (bool) {
        bytes32 vcHash = hashDaoVC(exampleVC);
        bytes32 digest = ECDSA.toTypedDataHash(DOMAIN_SEPARATOR, vcHash);

        address issuerAddress = DIDpkhAdapter.pseudoResolve(exampleVC.issuer);

        // Here we could check the issuer's address against an on-chain registry.

        address recoveredAddress = ECDSA.recover(digest, v, r, s);

        require(recoveredAddress == issuerAddress, "VC verification failed");

        return true;
    }
}
