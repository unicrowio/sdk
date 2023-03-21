import React, { ChangeEvent } from "react";
import {
  InputText,
  Button,
  Stack,
  FormattedPercentageAmountAdornment,
  ScopedModal,
} from "../../../ui/internal/components";
import { arbitrate } from "../../../core";
import { toast } from "../notification/toast";
import { IArbitrateModalProps } from "../../../typing";
import { useModalStates } from "../hooks/useModalStates";
import { AdornmentContent } from "../components/InputText";
import { useModalCloseHandler } from "../hooks/useModalCloseHandler";
import { ModalAction } from "../components/Modal";
import { useEscrowData } from "ui/internal/hooks/useEscrowData";

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
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    setSuccess,
    setError,
    success,
    onModalClose,
  } = useModalStates({ deferredPromise });

  const {
    data: escrowData,
    isLoading: isLoadingEscrow,
    error,
  } = useEscrowData(escrowId);

  const closeHandlerRef = useModalCloseHandler(onModalClose);
  const [sellerValue, setSellerValue] = React.useState<string>("");
  const [buyerValue, setBuyerValue] = React.useState<string>("");
  const [focus, setFocus] = React.useState<"seller" | "buyer">("seller");
  const [modalAction, setModalAction] = React.useState<ModalAction>();
  const isLoadingAnything = isLoading || isLoadingEscrow;

  const arbitrateCallbacks = {
    ...callbacks,
    connected: (address: string) => {
      setLoadingMessage("Connected");
      callbacks && callbacks.connected && callbacks.connected(address);
    },
  };

  React.useEffect(() => {
    if (escrowData) {
      if (escrowData.arbitration?.arbitrated) {
        setBuyerValue(escrowData.splitBuyer.toString());
        setSellerValue(escrowData.splitSeller.toString());
      }

      if (escrowData.connectedUser !== "arbitrator") {
        setModalAction({
          isForbidden: true,
          reason: "Only the arbitrator defined in the escrow can arbitrate it",
        });
      }
    }
  }, [escrowData]);

  const confirm = (event: any) => {
    event.preventDefault();

    if (!escrowData) return null;

    setIsLoading(true);
    arbitrate(
      escrowData.escrowId,
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
    if (!escrowData) {
      return null;
    }

    return (
      <Stack>
        <InputText
          autoFocus={focus === "seller"}
          required
          disabled={!!success || escrowData.arbitration?.arbitrated}
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
            content: escrowData && (
              <FormattedPercentageAmountAdornment
                amount={escrowData?.amount}
                tokenInfo={escrowData?.token}
                percentage={sellerValue}
              />
            ),
            options: { hideBorder: true },
          }}
        />
        <InputText
          autoFocus={focus === "buyer"}
          required
          disabled={!!success || escrowData.arbitration?.arbitrated}
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
            content: escrowData && (
              <FormattedPercentageAmountAdornment
                amount={escrowData?.amount}
                tokenInfo={escrowData?.token}
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
    if (!(escrowData && escrowData?.arbitration)) {
      return null;
    }

    if (
      success ||
      (escrowData.connectedUser === "arbitrator" &&
        escrowData.arbitration.arbitrated)
    ) {
      return (
        <Button
          disabled={isLoadingAnything}
          fullWidth
          variant="tertiary"
          onClick={() => onModalClose()}
        >
          Close
        </Button>
      );
    }
    if (
      escrowData.connectedUser === "arbitrator" &&
      !escrowData.arbitration.arbitrated
    ) {
      return (
        <Button
          disabled={isLoadingAnything}
          fullWidth
          variant="primary"
          type="submit"
        >
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
        body={<ModalBody />}
        footer={<ModalFooter />}
        onClose={onModalClose}
        isLoading={isLoadingAnything}
        loadingMessage={loadingMessage}
        modalAction={modalAction}
      />
    </form>
  );
};
