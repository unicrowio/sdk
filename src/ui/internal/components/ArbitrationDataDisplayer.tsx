import React from "react";
import { reduceAddress, ADDRESS_ZERO, SELLER } from "../../../helpers";
import { DataDisplayer } from "./DataDisplayer";
import { MARKER } from "../../../config/marker";
import { IGetEscrowData } from "typing";

interface Props {
  data: IGetEscrowData;
}

export const ArbitrationDataDisplayer = ({ data }: Props) => {
  const { ensAddresses, arbitration, connectedUser } = data;

  if (arbitration?.arbitrator && connectedUser === "arbitrator") {
    return (
      <DataDisplayer
        label="Arbitrator Fee"
        value={`${arbitration.arbitratorFee || "..."}%`}
        marker={MARKER.arbitratorFee}
      />
    );
  }

  if (arbitration?.arbitrator && arbitration.arbitrator !== ADDRESS_ZERO) {
    return (
      <>
        <DataDisplayer
          label="Arbitrator"
          value={reduceAddress(
            arbitration.arbitrator,
            ensAddresses?.arbitrator,
          )}
          copy={arbitration.arbitrator}
          marker={MARKER.arbitrator}
        />
        {connectedUser === SELLER && (
          <DataDisplayer
            label="Arbitrator Fee"
            value={`${arbitration.arbitratorFee || "..."}%`}
            marker={MARKER.arbitratorFee}
          />
        )}
      </>
    );
  }

  return null;
};
