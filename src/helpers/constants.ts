export const ZERO_FEE_VALUE = 0;

export enum consensus {
  BUYER = 0,
  SELLER = 1,
}

// TODO: It was copied from contract but should be accessed directly to prevent errors
export const WHO_PROTOCOL = 0;
export const WHO_BUYER = 1;
export const WHO_SELLER = 2;
export const WHO_MARKETPLACE = 3;

export enum split {
  BUYER = 0,
  SELLER = 1,
  MARKETPLACE = 2,
  CROW = 3,
  DEV = 4,
}

export const BUYER = "buyer";
export const SELLER = "seller";
