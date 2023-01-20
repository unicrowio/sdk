import { ADDRESS_ZERO } from "./constants";

export const nullOrValue = (value: any) =>
  (!value || value === ADDRESS_ZERO) ? null : value?.toString();
