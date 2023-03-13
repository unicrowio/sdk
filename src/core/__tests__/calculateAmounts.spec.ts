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
        amount: 1000,
        splitBuyer,
        splitSeller,
        splitProtocol,
        splitMarketplace,
        arbitratorFee,
      } as CalculateAmountsInput,
      false,
    );

    expect(result).toEqual({
      amountBuyer: 0,
      amountSeller: 890,
      amountProtocol: 10,
      amountMarketplace: 100,
      amountArbitrator: 0,
    } as tShares);
  });
  it("should return the same result from the Sheet1 - release, refunded, settled, no artibitrator", () => {
    const splitSeller = 80;
    const splitBuyer = 20;
    const splitProtocol = 1;
    const splitMarketplace = 10;
    const arbitratorFee = 5;

    const result: tShares = calculateAmounts({
      amount: 1000,
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    const r = {
      amountBuyer: 200,
      amountSeller: 672,
      amountProtocol: 8,
      amountMarketplace: 80,
      amountArbitrator: 40,
    } as tShares;

    expect(result).toEqual(r);
  });

  it("should return the same result from the Sheet1 - settled by artibitrator", () => {
    const splitSeller = 80;
    const splitBuyer = 20;
    const splitProtocol = 1;
    const splitMarketplace = 10;
    const arbitratorFee = 5;

    const result: tShares = calculateAmounts(
      {
        amount: 1000,
        splitBuyer,
        splitSeller,
        splitProtocol,
        splitMarketplace,
        arbitratorFee,
      } as CalculateAmountsInput,
      true,
    );

    expect(result).toEqual({
      amountSeller: 672,
      amountBuyer: 190,
      amountProtocol: 8,
      amountMarketplace: 80,
      amountArbitrator: 50,
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
      amount: 1000,
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: 0,
      amountSeller: 990,
      amountProtocol: 10,
      amountMarketplace: 0,
      amountArbitrator: 0,
    } as tShares);
  });

  it("should calculate considering the final state: split 50/50", () => {
    const splitSeller = 50;
    const splitBuyer = 50;
    const splitProtocol = 1;
    const splitMarketplace = 0;
    const arbitratorFee = 0;

    const result: tShares = calculateAmounts({
      amount: 1000,
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: 500,
      amountSeller: 495,
      amountProtocol: 5,
      amountMarketplace: 0,
      amountArbitrator: 0,
    } as tShares);
  });

  it("should calculate considering the final state: split 80 (splitSeller) / 20 (buyer)", () => {
    const splitSeller = 80;
    const splitBuyer = 20;
    const splitProtocol = 1;
    const splitMarketplace = 0;
    const arbitratorFee = 0;

    const result: tShares = calculateAmounts({
      amount: 1000,
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: 200,
      amountSeller: 792,
      amountProtocol: 8,
      amountMarketplace: 0,
      amountArbitrator: 0,
    } as tShares);
  });

  it("should calculate considering the final state: Refunded by splitSeller", () => {
    const splitSeller = 0;
    const splitBuyer = 100;
    const splitProtocol = 0;
    const splitMarketplace = 0;
    const arbitratorFee = 0;

    const result: tShares = calculateAmounts({
      amount: 1000,
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: 1000,
      amountSeller: 0,
      amountProtocol: 0,
      amountMarketplace: 0,
      amountArbitrator: 0,
    } as tShares);
  });

  it("should calculate considering the final state: Refunded by splitSeller", () => {
    const splitSeller = 0;
    const splitBuyer = 100;
    const splitProtocol = 0;
    const splitMarketplace = 0;
    const arbitratorFee = 0;

    const result: tShares = calculateAmounts({
      amount: 1000,
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: 1000,
      amountSeller: 0,
      amountProtocol: 0,
      amountMarketplace: 0,
      amountArbitrator: 0,
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
      amount: 1000,
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: 0,
      amountSeller: 890,
      amountProtocol: 10,
      amountMarketplace: 100,
      amountArbitrator: 0,
    } as tShares);
  });

  it("should calculate considering the final state: split 50/50", () => {
    const splitSeller = 50;
    const splitBuyer = 50;
    const splitProtocol = 1;
    const splitMarketplace = 10;
    const arbitratorFee = 0;

    const result: tShares = calculateAmounts({
      amount: 1000,
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: 500,
      amountSeller: 445,
      amountProtocol: 5,
      amountMarketplace: 50,
      amountArbitrator: 0,
    } as tShares);
  });

  it("should calculate considering the final state: split 80 (splitSeller) / 20 (buyer)", () => {
    const splitSeller = 80;
    const splitBuyer = 20;
    const splitProtocol = 1;
    const splitMarketplace = 10;
    const arbitratorFee = 0;

    const result: tShares = calculateAmounts({
      amount: 1000,
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: 200,
      amountSeller: 712,
      amountProtocol: 8,
      amountMarketplace: 80,
      amountArbitrator: 0,
    } as tShares);
  });

  it("should calculate considering the final state: Refunded by splitSeller", () => {
    const splitSeller = 0;
    const splitBuyer = 100;
    const splitProtocol = 0;
    const splitMarketplace = 0;
    const arbitratorFee = 0;

    const result: tShares = calculateAmounts({
      amount: 1000,
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: 1000,
      amountSeller: 0,
      amountProtocol: 0,
      amountMarketplace: 0,
      amountArbitrator: 0,
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
      amount: 1000,
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: 0,
      amountSeller: 840,
      amountProtocol: 10,
      amountMarketplace: 100,
      amountArbitrator: 50,
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
        amount: 1000,
        splitBuyer,
        splitSeller,
        splitProtocol,
        splitMarketplace,
        arbitratorFee,
      } as CalculateAmountsInput,
      true,
    );

    expect(result).toEqual({
      amountBuyer: 475,
      amountSeller: 420,
      amountProtocol: 5,
      amountMarketplace: 50,
      amountArbitrator: 50,
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
        amount: 1000,
        splitBuyer,
        splitSeller,
        splitProtocol,
        splitMarketplace,
        arbitratorFee,
      } as CalculateAmountsInput,
      true,
    );

    expect(result).toEqual({
      amountBuyer: 190,
      amountSeller: 672,
      amountProtocol: 8,
      amountMarketplace: 80,
      amountArbitrator: 50,
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
        amount: 1000,
        splitBuyer,
        splitSeller,
        splitProtocol,
        splitMarketplace,
        arbitratorFee,
      } as CalculateAmountsInput,
      true,
    );

    expect(result).toEqual({
      amountBuyer: 950,
      amountSeller: 0,
      amountProtocol: 0,
      amountMarketplace: 0,
      amountArbitrator: 50,
    } as tShares);
  });

  it("should calculate considering the final state: Refunded by seller", () => {
    const splitSeller = 0;
    const splitBuyer = 100;
    const splitProtocol = 0;
    const splitMarketplace = 0;
    const arbitratorFee = 0;

    const result: tShares = calculateAmounts({
      amount: 1000,
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: 1000,
      amountSeller: 0,
      amountProtocol: 0,
      amountMarketplace: 0,
      amountArbitrator: 0,
    } as tShares);
  });

  it("should calculate considering the final state: splitBuyer and seller agree on 50/50", () => {
    const splitSeller = 50;
    const splitBuyer = 50;
    const splitProtocol = 1;
    const splitMarketplace = 10;
    const arbitratorFee = 5;

    const result: tShares = calculateAmounts({
      amount: 1000,
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountBuyer: 500,
      amountSeller: 420,
      amountProtocol: 5,
      amountMarketplace: 50,
      amountArbitrator: 25,
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
      amount: 1000,
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountArbitrator: 0,
      amountBuyer: 500,
      amountSeller: 495,
      amountProtocol: 5,
      amountMarketplace: 0,
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
      amount: 12,
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
    } as CalculateAmountsInput);

    expect(result).toEqual({
      amountArbitrator: 0,
      amountBuyer: 6,
      amountSeller: 6,
      amountProtocol: 0,
      amountMarketplace: 0,
    } as tShares);
  });
});

it("Amount 1000, seller should receive 100% and platform 1%", () => {
  const splitSeller = 100;
  const splitBuyer = 0;
  const splitProtocol = 1;
  const splitMarketplace = 0;

  const result: tShares = calculateAmounts({
    amount: 1000,
    splitBuyer,
    splitSeller,
    splitProtocol,
    splitMarketplace,
  } as CalculateAmountsInput);

  expect(result).toEqual({
    amountArbitrator: 0,
    amountBuyer: 0,
    amountSeller: 990,
    amountProtocol: 10,
    amountMarketplace: 0,
  } as tShares);
});

it("Amount 1.000.000.000.000.000.000.000, seller should receive 100% and platform 1%", () => {
  const splitSeller = 100;
  const splitBuyer = 0;
  const splitProtocol = 1;
  const splitMarketplace = 0;

  const result: tShares = calculateAmounts({
    amount: 1e21,
    splitBuyer,
    splitSeller,
    splitProtocol,
    splitMarketplace,
  } as CalculateAmountsInput);

  expect(result).toEqual({
    amountArbitrator: 0,
    amountBuyer: 0,
    amountSeller: 990000000000000000000,
    amountProtocol: 10000000000000000000,
    amountMarketplace: 0,
  } as tShares);
});
