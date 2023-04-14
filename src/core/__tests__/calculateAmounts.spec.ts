import { tShares, CalculateAmountsInput } from "../../typing";
import { calculateAmounts } from "../calculateAmounts";

// formula how to get the bip value of percentage
// rule of three
// (Max BIPS * percent) / 100
// (10000*99)/100 = 9900

describe("calculateAmounts", () => {
  it("basic", () => {
    const splitSeller = 100;
    const splitBuyer = 0;
    const splitProtocol = 1;
    const splitMarketplace = 10;
    const arbitratorFee = 0;

    const result: tShares = calculateAmounts(
      {
        amount: BigInt(1000),
        splitBuyer,
        splitSeller,
        splitProtocol,
        splitMarketplace,
        arbitratorFee,
      } as CalculateAmountsInput,
      false,
    );

    expect(result).toEqual({
      amountBuyer: BigInt(0),
      amountSeller: BigInt(890),
      amountProtocol: BigInt(10),
      amountMarketplace: BigInt(100),
      amountArbitrator: BigInt(0),
    } as tShares);
  });
  it("should return the same result from the Sheet1 - release, refunded, settled, no arbitrator", () => {
    const splitSeller = 80;
    const splitBuyer = 20;
    const splitProtocol = 1;
    const splitMarketplace = 10;
    const arbitratorFee = 5;

    const result: tShares = calculateAmounts({
      amount: BigInt(1000),
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    const r = {
      amountBuyer: BigInt(200),
      amountSeller: BigInt(672),
      amountProtocol: BigInt(8),
      amountMarketplace: BigInt(80),
      amountArbitrator: BigInt(40),
    } as tShares;

    expect(result).toEqual(r);
  });

  it("should return the same result from the Sheet1 - settled by arbitrator", () => {
    const splitSeller = 80;
    const splitBuyer = 20;
    const splitProtocol = 1;
    const splitMarketplace = 10;
    const arbitratorFee = 5;

    const result: tShares = calculateAmounts(
      {
        amount: BigInt(1000),
        splitBuyer,
        splitSeller,
        splitProtocol,
        splitMarketplace,
        arbitratorFee,
      } as CalculateAmountsInput,
      true,
    );

    expect(result).toEqual({
      amountSeller: BigInt(672),
      amountBuyer: BigInt(190),
      amountProtocol: BigInt(8),
      amountMarketplace: BigInt(80),
      amountArbitrator: BigInt(50),
    } as tShares);
  });
});

describe("Fees Calculation Google Docs - 1% Unicrow fee, no arbitrator, no marketplace fee", () => {
  it("should calculate considering the final state: Released no dispute", () => {
    const splitSeller = 100;
    const splitBuyer = 0;
    const splitProtocol = 1;
    const splitMarketplace = 0;
    const arbitratorFee = 0;

    const result: tShares = calculateAmounts({
      amount: BigInt(1000),
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: BigInt(0),
      amountSeller: BigInt(990),
      amountProtocol: BigInt(10),
      amountMarketplace: BigInt(0),
      amountArbitrator: BigInt(0),
    } as tShares);
  });

  it("should calculate considering the final state: split 50/50", () => {
    const splitSeller = 50;
    const splitBuyer = 50;
    const splitProtocol = 1;
    const splitMarketplace = 0;
    const arbitratorFee = 0;

    const result: tShares = calculateAmounts({
      amount: BigInt(1000),
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: BigInt(500),
      amountSeller: BigInt(495),
      amountProtocol: BigInt(5),
      amountMarketplace: BigInt(0),
      amountArbitrator: BigInt(0),
    } as tShares);
  });

  it("should calculate considering the final state: split 80 (splitSeller) / 20 (buyer)", () => {
    const splitSeller = 80;
    const splitBuyer = 20;
    const splitProtocol = 1;
    const splitMarketplace = 0;
    const arbitratorFee = 0;

    const result: tShares = calculateAmounts({
      amount: BigInt(1000),
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: BigInt(200),
      amountSeller: BigInt(792),
      amountProtocol: BigInt(8),
      amountMarketplace: BigInt(0),
      amountArbitrator: BigInt(0),
    } as tShares);
  });

  it("should calculate considering the final state: Refunded by splitSeller", () => {
    const splitSeller = 0;
    const splitBuyer = 100;
    const splitProtocol = 0;
    const splitMarketplace = 0;
    const arbitratorFee = 0;

    const result: tShares = calculateAmounts({
      amount: BigInt(1000),
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: BigInt(1000),
      amountSeller: BigInt(0),
      amountProtocol: BigInt(0),
      amountMarketplace: BigInt(0),
      amountArbitrator: BigInt(0),
    } as tShares);
  });

  it("should calculate considering the final state: Refunded by splitSeller", () => {
    const splitSeller = 0;
    const splitBuyer = 100;
    const splitProtocol = 0;
    const splitMarketplace = 0;
    const arbitratorFee = 0;

    const result: tShares = calculateAmounts({
      amount: BigInt(1000),
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: BigInt(1000),
      amountSeller: BigInt(0),
      amountProtocol: BigInt(0),
      amountMarketplace: BigInt(0),
      amountArbitrator: BigInt(0),
    } as tShares);
  });
});

describe("Fees Calculation Google Docs - 10% marketplace fee, 1% Unicrow fee, no arbitrator", () => {
  it("should calculate considering the final state: Released no dispute", () => {
    const splitSeller = 100;
    const splitBuyer = 0;
    const splitProtocol = 1;
    const splitMarketplace = 10;
    const arbitratorFee = 0;

    const result: tShares = calculateAmounts({
      amount: BigInt(1000),
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: BigInt(0),
      amountSeller: BigInt(890),
      amountProtocol: BigInt(10),
      amountMarketplace: BigInt(100),
      amountArbitrator: BigInt(0),
    } as tShares);
  });

  it("should calculate considering the final state: split 50/50", () => {
    const splitSeller = 50;
    const splitBuyer = 50;
    const splitProtocol = 1;
    const splitMarketplace = 10;
    const arbitratorFee = 0;

    const result: tShares = calculateAmounts({
      amount: BigInt(1000),
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: BigInt(500),
      amountSeller: BigInt(445),
      amountProtocol: BigInt(5),
      amountMarketplace: BigInt(50),
      amountArbitrator: BigInt(0),
    } as tShares);
  });

  it("should calculate considering the final state: split 80 (splitSeller) / 20 (buyer)", () => {
    const splitSeller = 80;
    const splitBuyer = 20;
    const splitProtocol = 1;
    const splitMarketplace = 10;
    const arbitratorFee = 0;

    const result: tShares = calculateAmounts({
      amount: BigInt(1000),
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: BigInt(200),
      amountSeller: BigInt(712),
      amountProtocol: BigInt(8),
      amountMarketplace: BigInt(80),
      amountArbitrator: BigInt(0),
    } as tShares);
  });

  it("should calculate considering the final state: Refunded by splitSeller", () => {
    const splitSeller = 0;
    const splitBuyer = 100;
    const splitProtocol = 0;
    const splitMarketplace = 0;
    const arbitratorFee = 0;

    const result: tShares = calculateAmounts({
      amount: BigInt(1000),
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: BigInt(1000),
      amountSeller: BigInt(0),
      amountProtocol: BigInt(0),
      amountMarketplace: BigInt(0),
      amountArbitrator: BigInt(0),
    } as tShares);
  });
});

describe("Fees Calculation Google Docs - 10% marketplace fee, 1% Unicrow fee, 5% arbitrator", () => {
  it("should calculate considering the final state: Released no dispute", () => {
    const splitSeller = 100;
    const splitBuyer = 0;
    const splitProtocol = 1;
    const splitMarketplace = 10;
    const arbitratorFee = 5;

    const result: tShares = calculateAmounts({
      amount: BigInt(1000),
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: BigInt(0),
      amountSeller: BigInt(840),
      amountProtocol: BigInt(10),
      amountMarketplace: BigInt(100),
      amountArbitrator: BigInt(50),
    } as tShares);
  });

  it("should calculate considering the final state: Arbitrator splits payment 50/50", () => {
    const splitSeller = 50;
    const splitBuyer = 50;
    const splitProtocol = 1;
    const splitMarketplace = 10;
    const arbitratorFee = 5;

    const result: tShares = calculateAmounts(
      {
        amount: BigInt(1000),
        splitBuyer,
        splitSeller,
        splitProtocol,
        splitMarketplace,
        arbitratorFee,
      } as CalculateAmountsInput,
      true,
    );

    expect(result).toEqual({
      amountBuyer: BigInt(475),
      amountSeller: BigInt(420),
      amountProtocol: BigInt(5),
      amountMarketplace: BigInt(50),
      amountArbitrator: BigInt(50),
    } as tShares);
  });

  it("should calculate considering the final state: Arbitrator splits 80(seller)/20(splitBuyer)", () => {
    const splitSeller = 80;
    const splitBuyer = 20;
    const splitProtocol = 1;
    const splitMarketplace = 10;
    const arbitratorFee = 5;

    const result: tShares = calculateAmounts(
      {
        amount: BigInt(1000),
        splitBuyer,
        splitSeller,
        splitProtocol,
        splitMarketplace,
        arbitratorFee,
      } as CalculateAmountsInput,
      true,
    );

    expect(result).toEqual({
      amountBuyer: BigInt(190),
      amountSeller: BigInt(672),
      amountProtocol: BigInt(8),
      amountMarketplace: BigInt(80),
      amountArbitrator: BigInt(50),
    } as tShares);
  });

  it("should calculate considering the final state: Refunded by arbitrator (0/100 split)", () => {
    const splitSeller = 0;
    const splitBuyer = 100;
    const splitProtocol = 0;
    const splitMarketplace = 0;
    const arbitratorFee = 5;

    const result: tShares = calculateAmounts(
      {
        amount: BigInt(1000),
        splitBuyer,
        splitSeller,
        splitProtocol,
        splitMarketplace,
        arbitratorFee,
      } as CalculateAmountsInput,
      true,
    );

    expect(result).toEqual({
      amountBuyer: BigInt(950),
      amountSeller: BigInt(0),
      amountProtocol: BigInt(0),
      amountMarketplace: BigInt(0),
      amountArbitrator: BigInt(50),
    } as tShares);
  });

  it("should calculate considering the final state: Refunded by seller", () => {
    const splitSeller = 0;
    const splitBuyer = 100;
    const splitProtocol = 0;
    const splitMarketplace = 0;
    const arbitratorFee = 0;

    const result: tShares = calculateAmounts({
      amount: BigInt(1000),
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: BigInt(1000),
      amountSeller: BigInt(0),
      amountProtocol: BigInt(0),
      amountMarketplace: BigInt(0),
      amountArbitrator: BigInt(0),
    } as tShares);
  });

  it("should calculate considering the final state: splitBuyer and seller agree on 50/50", () => {
    const splitSeller = 50;
    const splitBuyer = 50;
    const splitProtocol = 1;
    const splitMarketplace = 10;
    const arbitratorFee = 5;

    const result: tShares = calculateAmounts({
      amount: BigInt(1000),
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: BigInt(500),
      amountSeller: BigInt(420),
      amountProtocol: BigInt(5),
      amountMarketplace: BigInt(50),
      amountArbitrator: BigInt(25),
    } as tShares);
  });
});

describe("Fees Calculation - 0% marketplace fee, 1% platform, ", () => {
  it("50/50 parties, 1% platform and 0% marketplace, no arbitrator nor arbitrated", () => {
    const splitSeller = 50;
    const splitBuyer = 50;
    const splitProtocol = 1;
    const splitMarketplace = 0;

    const result: tShares = calculateAmounts({
      amount: BigInt(1000),
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountArbitrator: BigInt(0),
      amountBuyer: BigInt(500),
      amountSeller: BigInt(495),
      amountProtocol: BigInt(5),
      amountMarketplace: BigInt(0),
    } as tShares);
  });
});

describe("Fees Calculation - 0% marketplace fee, 0% platform, with 12 amount ", () => {
  it("buyer and seller should receive 6 each one", () => {
    const splitSeller = 50;
    const splitBuyer = 50;
    const splitProtocol = 0;
    const splitMarketplace = 0;

    const result: tShares = calculateAmounts({
      amount: BigInt(12),
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountArbitrator: BigInt(0),
      amountBuyer: BigInt(6),
      amountSeller: BigInt(6),
      amountProtocol: BigInt(0),
      amountMarketplace: BigInt(0),
    } as tShares);
  });
});

it("Amount 1000), seller should receive 100% and platform 1%", () => {
  const splitSeller = 100;
  const splitBuyer = 0;
  const splitProtocol = 1;
  const splitMarketplace = 0;

  const result: tShares = calculateAmounts({
    amount: BigInt(1000),
    splitBuyer,
    splitSeller,
    splitProtocol,
    splitMarketplace,
  } as CalculateAmountsInput);

  expect(result).toEqual({
    amountArbitrator: BigInt(0),
    amountBuyer: BigInt(0),
    amountSeller: BigInt(990),
    amountProtocol: BigInt(10),
    amountMarketplace: BigInt(0),
  } as tShares);
});

it("Amount 1.000.000.000.000.000.000.000), seller should receive 100% and platform 1%", () => {
  const splitSeller = 100;
  const splitBuyer = 0;
  const splitProtocol = 1;
  const splitMarketplace = 0;

  const result: tShares = calculateAmounts({
    amount: BigInt(1e21),
    splitBuyer,
    splitSeller,
    splitProtocol,
    splitMarketplace,
  } as CalculateAmountsInput);

  expect(result).toEqual({
    amountArbitrator: BigInt(0),
    amountBuyer: BigInt(0),
    amountSeller: BigInt(990000000000000000000),
    amountProtocol: BigInt(10000000000000000000),
    amountMarketplace: BigInt(0),
  } as tShares);
});
