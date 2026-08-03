export class PartnerStoreError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "PartnerStoreError";
    this.code = code;
  }
}
