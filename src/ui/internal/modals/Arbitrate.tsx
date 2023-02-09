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
import { IArbitrateModalProps } from "../../../typing";
import { useModalStates } from "../hooks/useModalStates";
import { AdornmentContent } from "../components/InputText";
import { useAsync } from "../hooks/useAsync";
import { useModalCloseHandler } from "../hooks/useModalCloseHandler";
import { ModalAction } from "../components/Modal";

/**
 * Arbitrator should arbitrate the escrow payment
 * @returns
 */
export const Arbitrate = ({
  escrowId,
  deferredPromise,
  callbacks,
}: IArbitrateModalProps) => {
  const {
    setIsLoading,
    setLoadingMessage,
    setSuccess,
    setError,
    success,
    onModalClose,
  } = useModalStates({ deferredPromise });
  const closeHandlerRef = useModalCloseHandler(onModalClose);

  const [sellerValue, setSellerValue] = React.useState<string>("");
  const [buyerValue, setBuyerValue] = React.useState<string>("");
  const [focus, setFocus] = React.useState<"seller" | "buyer">("seller");

  const [modalAction, setModalAction] = React.useState<ModalAction>();
  const [escrow, isLoading, error] = useAsync(
    escrowId,
    getEscrowData,
    onModalClose,
  );

  const arbitrateCallbacks = {
    ...callbacks,
    connected: (address: string) => {
      setLoadingMessage("Connected");
      callbacks && callbacks.connected && callbacks.connected(address);
    },
  };

  React.useEffect(() => {
    if (escrow?.arbitration?.arbitrated) {
      setBuyerValue(escrow.splitBuyer.toString());
      setSellerValue(escrow.splitSeller.toString());
    }

    if (escrow?.connectedUser !== "arbitrator") {
      setModalAction({
        isForbidden: true,
        reason: "Only the arbitrator defined in the escrow can arbitrate it",
      });
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
      arbitrateCallbacks,
    )
      .then(() => {
        setSuccess("Arbitration Successful");
        setError(null);
        toast.success("Arbitration Successful");
      })
      .catch((e) => {
        setSuccess(null);
        setError(e.message);
        toast.error(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === "seller") {
      setSellerValue(event.target.value);
      setBuyerValue(String(100 - Number(event.target.value)));
      setFocus("seller");
    } else {
      setSellerValue(String(100 - Number(event.target.value)));
      setBuyerValue(event.target.value);
      setFocus("buyer");
    }
  };

  const ModalBody = () => {
    if (!escrow) {
      return null;
    }

    return (
      <Stack>
        <InputText
          autoFocus={focus === "seller"}
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
          autoFocus={focus === "buyer"}
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
    <form ref={closeHandlerRef} autoComplete="off" onSubmit={confirm}>
      <ScopedModal
        title={"Arbitrate the payment"}
        body={ModalBody()}
        footer={ModalFooter()}
        onClose={onModalClose}
        isLoading={isLoading}
        loadingMessage={isLoading ? "Getting Arbitration information" : ""}
        modalAction={modalAction}
      />
    </form>
  );
};
