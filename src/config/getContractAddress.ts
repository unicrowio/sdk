type Role = "unicrow" | "dispute" | "arbitrator" | "claim";

export const getContractAddress = (role: Role): string => {
  return globalThis?.unicrow?.network?.contracts[role];
};
