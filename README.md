# EIP-712 Verifiable Credentials

This is a simple example of how Verifiable Credentials can be verified on-chain.

It is based on the [EIP-712 standard for typed structured data hashing and signing ](https://eips.ethereum.org/EIPS/eip-712) and [Ethereum EIP712 Signature 2021](https://w3c-ccg.github.io/ethereum-eip712-signature-2021-spec/).

The VC used is very basic and minimal, more properties such as id could be added. The basis for this example VC ("DaoVc") is defined in `mocks > exampleDocument.json`. The credential subject is simply:

```json
"credentialSubject": {
    "name": "MakerDAO",
    "category": "DeFi"
  }
```

It provides some information about a DAO, i.e which category the DAO belongs to.

### Pre Requisites

Before running any command, you need to create a `.env` file and set a BIP-39 compatible mnemonic or a private key as an environment
variable. Follow the example in `.env.example`. If you don't already have a mnemonic, use this [website](https://iancoleman.io/bip39/) to generate one.

Then, proceed with installing dependencies:

```sh
$ yarn install
```

Then run

```
npx hardhat present
```

First, this will deploy the smart contracts locally and generate a serialized Verifiable Credential, which is signed by the private key provided as environment variable and looks like this:

```
{
  "_context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://schema.org",
    "https://w3id.org/security/v2"
  ],
  "_type": [
    "VerifiableCredential"
  ],
  "credentialSubject": {
    "name": "MakerDAO",
    "category": "DeFi"
  },
  "issuer": "did:pkh:eip155:1:0x0797B98884dE920620DCD9d84C4F106374c6121C",
  "issuanceDate": "2022-08-21T18:11:31.863Z",
  "proof": {
    "created": "2022-08-21T18:11:31.863Z",
    "eip712": {
      "domain": {
        "name": "dao-vc-verifier-test"
      },
      "primaryType": "DaoVc",
      "types": {
        "DaoVc": [
          {
            "name": "_context",
            "type": "string[]"
          },
          {
            "name": "_type",
            "type": "string[]"
          },
          {
            "name": "issuer",
            "type": "string"
          },
          {
            "name": "issuanceDate",
            "type": "string"
          },
          {
            "name": "credentialSubject",
            "type": "DAO"
          }
        ],
        "DAO": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "category",
            "type": "string"
          }
        ]
      }
    },
    "proofPurpose": "assertionMethod",
    "proofValue": {
      "v": 28,
      "r": "0xae61c93c59bc36fec9d86904ab55585163578aa52f64bb07b03db3ca683e39fa",
      "s": "0x7d4d0b222d81cd783ed6da886db04afa5fce5bc557e5a2e6cd5bf5bd0bffb51d"
    },
    "type": "EthereumEip712Signature2021",
    "verificationMethod": "did:pkh:eip155:1:0x0797B98884dE920620DCD9d84C4F106374c6121C#blockchainAccountId"
  }
}
```

### Some remarks

- The proof object is based on [Ethereum EIP712 Signature 2021](https://w3c-ccg.github.io/ethereum-eip712-signature-2021-spec/).
- "@" is not a valid character in a variable name in Solidity, hence why the `@context` and `@type` properties are renamed `_context` and `_type` respectively.
- The `did:pkh` method is used which allows us to turn the Ethereum address of the VC issuer / signer into a valid DID. The inverse of this "process" is done on-chain by the pseudo-resolver in `DIDpkhAdapter.sol`.

<br/>

Then, the content of the whole VC (minus the proof object) and the signature attached to it is verified on-chain against the Ethereum address in `issuer`. This is done by calling `verifyDaoVc()`. If the verification is successful you should see:

```
Verification passed on-chain?  true
Gas cost:  83550
```

As shown above, the verification consumes 83,550 gas which, with a gas price of 17 gwei for example, costs $2.39.

<br/>

## Next steps

- [ ] Create an example of a VC as voucher that can be redeemed against something such as ERC20 tokens or 721 tokens
- [ ] Generalize the implementation so that an on-chain VC verifier is not tightly coupled to a specific VC schema

<br/>
<br/>

## Generic Repo Usage

### Compile

Compile the smart contracts with Hardhat:

```sh
$ yarn compile
```

### TypeChain

Compile the smart contracts and generate TypeChain artifacts:

```sh
$ yarn typechain
```

### Lint Solidity

Lint the Solidity code:

```sh
$ yarn lint:sol
```

### Lint TypeScript

Lint the TypeScript code:

```sh
$ yarn lint:ts
```

### Test

Run the Mocha tests:

```sh
$ yarn test
```

### Coverage

Generate the code coverage report:

```sh
$ yarn coverage
```

### Report Gas

See the gas usage per unit test and average gas per method call:

```sh
$ REPORT_GAS=true yarn test
```

### Clean

Delete the smart contract artifacts, the coverage reports and the Hardhat cache:

```sh
$ yarn clean
```

## Syntax Highlighting

If you use VSCode, you can get Solidity syntax highlighting via the [vscode-solidity](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity) extension.
