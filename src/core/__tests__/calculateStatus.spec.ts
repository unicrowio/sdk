import { BUYER, SELLER } from "../../helpers/constants";
import { EscrowStatus, ICalculateStatusParams } from "../../typing";
import { calculateStatus } from "../calculateStatus";

let params = {} as ICalculateStatusParams;

describe("Initial state", () => {
  beforeEach(() => {
    params = {
      seller: "0x952e927887ab169761f727e36c5f8e10837e1a6d",
      consensusBuyer: 0,
      consensusSeller: 1,
      splitSeller: 0, // any
      splitBuyer: 100, // any
      expires: new Date(Date.now() + 24 * 60 * 60), // in 24h,
      claimed: false,
      latestSettlementOfferAddress: undefined,
    };
  });

  it("Should return Paid when time is not expired", () => {
    const result = calculateStatus(params);

    expect(result.state).toBe(EscrowStatus.PAID);
    expect(result.latestChallengeBy).toBe(null);
    expect(result.latestSettlementOfferBy).toBe(null);
    expect(result.claimed).toBe(false);
  });

  it("Should return Released when time is expired", () => {
    // change params
    params.expires = new Date(Date.now() - 24 * 60 * 60); // expired 24h ago

    const result = calculateStatus(params);

    expect(result.state).toBe(EscrowStatus.PERIOD_EXPIRED);
    expect(result.latestChallengeBy).toBe(null);
    expect(result.latestSettlementOfferBy).toBe(null);
    expect(result.claimed).toBe(false);
  });

  it("Should return Period Expired after time expires", () => {
    params.expires = new Date(Date.now() - 24 * 60 * 60); // expired 24h ago
    params.consensusBuyer = 0;
    params.consensusSeller = 1;

    const result = calculateStatus(params);

    expect(result.state).toBe(EscrowStatus.PERIOD_EXPIRED);
    expect(result.latestChallengeBy).toBe(null);
  });

  it("Should return Refund regardless the expiration time", () => {
    params.expires = new Date(Date.now() - 24 * 60 * 60); // expired 24h ago
    params.consensusBuyer = 1;
    params.consensusSeller = 1;
    params.splitBuyer = 100;
    params.splitSeller = 0;

    const result = calculateStatus(params);
    expect(result.state).toBe(EscrowStatus.REFUNDED);
    expect(result.latestChallengeBy).toBe(null);
  });
});

describe("After challenged", () => {
  beforeEach(() => {
    params = {
      seller: "0x952e927887ab169761f727e36c5f8e10837e1a6d",
      consensusBuyer: 1,
      consensusSeller: -1,
      splitSeller: 100, // any
      splitBuyer: 0, // any
      expires: new Date(),
      claimed: false,
      latestSettlementOfferAddress: undefined,
    };
  });

  it("Should return Challenged when time is not expired", () => {
    let result;
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    params.expires = futureDate;
    result = calculateStatus(params);
    expect(result.state).toBe(EscrowStatus.CHALLENGED);
    expect(result.latestChallengeBy).toBe(BUYER);

    params.consensusBuyer = -1;
    params.consensusSeller = 1;
    result = calculateStatus(params);
    expect(result.state).toBe(EscrowStatus.CHALLENGED);
    expect(result.latestChallengeBy).toBe(SELLER);

    params.consensusBuyer = 1;
    params.consensusSeller = 1;
    result = calculateStatus(params);
    expect(result.state).not.toBe(EscrowStatus.CHALLENGED);
    expect(result.latestChallengeBy).toBe(null);
  });

  it("Should return Expired when time is expired", () => {
    let result;
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    params.expires = pastDate;
    result = calculateStatus(params);
    expect(result.state).toBe(EscrowStatus.PERIOD_EXPIRED);
    expect(result.latestChallengeBy).toBe(BUYER);

    params.consensusBuyer = -1;
    params.consensusSeller = 1;
    result = calculateStatus(params);
    expect(result.state).toBe(EscrowStatus.PERIOD_EXPIRED);
    expect(result.latestChallengeBy).toBe(SELLER);

    params.consensusBuyer = 1;
    params.consensusSeller = 1;
    result = calculateStatus(params);
    expect(result.state).not.toBe(EscrowStatus.PERIOD_EXPIRED);
    expect(result.latestChallengeBy).toBe(null);
  });

  it("Should return RELEASED", () => {
    params.expires = new Date(Date.now() + 24 * 60 * 60); // expires in 24h
    params.consensusBuyer = 2;
    params.consensusSeller = 2;

    let result = calculateStatus(params);
    expect(result.state).toBe(EscrowStatus.RELEASED);
    expect(result.latestChallengeBy).toBe(BUYER);

    params.consensusBuyer = 2;
    params.consensusSeller = 3;
    result = calculateStatus(params);
    expect(result.state).toBe(EscrowStatus.RELEASED);
    expect(result.latestChallengeBy).toBe(SELLER);
  });

  it("Should return Refund regardless the expiration time", () => {
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    params.expires = pastDate;
    params.consensusBuyer = 2;
    params.consensusSeller = 2;
    params.splitBuyer = 100;
    params.splitSeller = 0;

    const result = calculateStatus(params);
    expect(result.state).toBe(EscrowStatus.REFUNDED);
    expect(result.latestChallengeBy).toBe(null);
  });
});
