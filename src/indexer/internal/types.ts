import { BigNumber as BigNumberJs } from "bignumber.js";
import { EscrowStatus } from "../../typing";

export interface EscrowStatusView {
  amount: BigNumberJs; // ERC20 | Ether
  escrow_id: number;
  status: keyof typeof EscrowStatus;

  // Addresses
  marketplace: string | null;
  buyer: string;
  seller: string;
  currency: string;

  challenge_period: number;
  challenge_period_start: number;
  challenge_period_end: number;

  // Split
  split_seller: number;
  split_buyer: number;
  split_protocol: number;
  split_marketplace: number;

  // Consensus
  consensus_seller: number;
  consensus_buyer: number;

  claimed: boolean;

  // Arbitration
  arbitrator?: string;
  arbitrator_fee?: number;
  arbitrated: boolean;
  arbitrator_proposer?: string;
  status_arbitration?: string;

  // Settlement
  latest_settlement_offer_address?: string;
  latest_settlement_offer_seller?: number;
  latest_settlement_offer_buyer?: number;

  paid_at: number;
}
