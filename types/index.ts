export * from "./eip712Types";

export type ExampleDocument = {
  "@context": string[];
  type: string[];
  credentialSubject: {
    name: string;
    category: string;
  };
};
