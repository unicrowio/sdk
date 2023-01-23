import React, { ChangeEvent } from "react";
import {
  InputText,
  Button,
  Stack,
  FormattedPercentageAmountAdornment,
  ScopedModal,
} from "../../../ui/internal/components";
import { arbitrate, getEscrowData } from "../../../core";
import { toast } from "../notification/toast";
import { IArbitrateModalProps, IGetEscrowData } from "../../../typing";
import { useModalStates } from "../hooks/useModalStates";
import { AdornmentContent } from "../components/InputText";
import { Forbidden } from "../components/Forbidden";
import { useAsync } from "../hooks/useAsync";

/**
 * Arbitrator should arbitrate the escrow payment
 * @returns
 */
export const Arbitrate = ({
  escrowId,
  deferredPromise,
  callbacks,
}: IArbitrateModalProps) => {
  const { setIsLoading, setSuccess, setError, success, onModalClose } =
    useModalStates({ deferredPromise });

  const [sellerValue, setSellerValue] = React.useState<string>("");
  const [buyerValue, setBuyerValue] = React.useState<string>("");

  const [escrow, isLoading, error] = useAsync(
    escrowId,
    getEscrowData,
    onModalClose,
    null,
  );

  React.useEffect(() => {
    if (escrow.arbitration?.arbitrated) {
      setBuyerValue(escrow.splitBuyer.toString());
      setSellerValue(escrow.splitSeller.toString());
    }
  }, [escrow]);

  const confirm = (event: any) => {
    event.preventDefault();

    if (!escrow) return null;

    setIsLoading(true);
    arbitrate(
      escrow.escrowId,
      Number(buyerValue),
      Number(sellerValue),
      callbacks,
    )
      .then(() => {
        setSuccess("Arbitration Successful");
        setError(null);
        toast("Arbitration Successful", "success");
      })
      .catch((e) => {
        console.error(e);
        setSuccess(null);
        setError(e.message);
        toast(e.message, "error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === "seller") {
      setSellerValue(event.target.value);
      setBuyerValue(String(100 - Number(event.target.value)));
    } else {
      setSellerValue(String(100 - Number(event.target.value)));
      setBuyerValue(event.target.value);
    }
  };

  const ModalBody = () => {
    if (!escrow) return null;

    if (escrow.connectedUser !== "arbitrator") {
      return (
        <Forbidden
          onClose={onModalClose}
          description="Only the arbitrator defined in the escrow can arbitrate it"
        />
      );
    }

    return (
      <Stack>
        <InputText
          required
          disabled={!!success || escrow.arbitration?.arbitrated}
          name="seller"
          id="seller"
          label="Seller should receive"
          onChange={handleInputChange}
          value={sellerValue}
          min="0"
          max="100"
          type="number"
          adornmentStart={{
            content: <AdornmentContent>%</AdornmentContent>,
          }}
          adornmentEnd={{
            content: escrow && (
              <FormattedPercentageAmountAdornment
                amount={escrow?.amount}
                tokenInfo={escrow?.token}
                percentage={sellerValue}
              />
            ),
            options: { hideBorder: true },
          }}
        />
        <InputText
          required
          disabled={!!success || escrow.arbitration?.arbitrated}
          name="buyer"
          id="buyer"
          label="Buyer should receive"
          onChange={handleInputChange}
          value={buyerValue}
          min="0"
          max="100"
          type="number"
          adornmentStart={{
            content: <AdornmentContent>%</AdornmentContent>,
          }}
          adornmentEnd={{
            content: escrow && (
              <FormattedPercentageAmountAdornment
                amount={escrow?.amount}
                tokenInfo={escrow?.token}
                percentage={buyerValue}
              />
            ),
            options: { hideBorder: true },
          }}
        />
      </Stack>
    );
  };

  const ModalFooter = () => {
    if (!escrow?.arbitration) {
      return null;
    }

    if (
      success ||
      (escrow.connectedUser === "arbitrator" && escrow.arbitration.arbitrated)
    ) {
      return (
        <Button
          disabled={isLoading}
          fullWidth
          variant="tertiary"
          onClick={onModalClose}
        >
          Close
        </Button>
      );
    }
    if (
      escrow.connectedUser === "arbitrator" &&
      !escrow.arbitration.arbitrated
    ) {
      return (
        <Button disabled={isLoading} fullWidth variant="primary" type="submit">
          {error ? "Retry" : "Confirm"}
        </Button>
      );
    }

    return null;
  };

  return (
    <form autoComplete="off" onSubmit={confirm}>
      <ScopedModal
        title={"Arbitrate the payment"}
        body={<ModalBody />}
        footer={<ModalFooter />}
        onClose={onModalClose}
        isLoading={isLoading}
        loadingMessage={isLoading ? "Getting Arbitration information" : ""}
      />
    </form>
  );
};
