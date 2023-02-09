import React, { FormEvent } from "react";
import {
  AdornmentContent,
  InputText,
} from "../../../ui/internal/components/InputText";
import { Button } from "../../../ui/internal/components/Button";
import { Stack } from "../../../ui/internal/components/Stack";
import { approveArbitrator } from "../../../core/approveArbitrator";
import { proposeArbitrator } from "../../../core/proposeArbitrator";
import { toast } from "../notification/toast";
import { FormattedPercentageAmountAdornment } from "../../../ui/internal/components/FormattedPercentageAmountAdornment";
import { IArbitrateModalProps } from "../../../typing";
import { useModalStates } from "../hooks/useModalStates";
import { getEscrowData } from "../../../core/getEscrowData";
import { ScopedModal } from "../components";
import { BUYER, SELLER } from "../../../helpers";
import { useAsync } from "../hooks/useAsync";
import { ModalAction } from "../components/Modal";
import { useModalCloseHandler } from "../hooks/useModalCloseHandler";

/**
 * Approve the Arbitrator proposed
 * @returns
 */
export const AddApproveArbitrator = ({
  escrowId,
  deferredPromise,
  callbacks,
}: IArbitrateModalProps) => {
  const { setIsLoading, setSuccess, setError, success, onModalClose } =
    useModalStates({ deferredPromise });
  const closeHandlerRef = useModalCloseHandler(onModalClose);

  const [arbitrator, setArbitrator] = React.useState<string>("");
  const [arbitratorFee, setArbitratorFee] = React.useState<string>("");

  const [action, setAction] = React.useState<
    "initial" | "new" | "edit" | "view" | "added" | "editing"
  >("initial");

  const [title, setTitle] = React.useState<string>("Arbitrator Proposal");

  const [modalAction, setModalAction] = React.useState<ModalAction>();

  const [escrowData, isLoading, error] = useAsync(
    escrowId,
    getEscrowData,
    onModalClose,
  );

  React.useEffect(() => {
    if (escrowData) {
      const escrowClosedStates = ["Settled", "Cancelled", "Expired"];

      if (![BUYER, SELLER].includes(escrowData.connectedUser)) {
        setModalAction({
          isForbidden: true,
        });
      }

      if (escrowClosedStates.includes(escrowData?.status.state)) {
        setModalAction({
          isForbidden: true,
          reason: "The escrow has already been closed",
        });
      }

      // Buyer or Seller should propose an arbitrator
      if (!escrowData.arbitration) {
        setAction("new");
        setTitle("Propose an Arbitrator");
        setArbitrator("");
        setArbitratorFee("");
        return;
      }

      // Seller who proposed the arbitrator
      if (
        escrowData.connectedUser === SELLER &&
        escrowData.arbitration.consensusSeller
      ) {
        setAction("view");
        setTitle("Arbitrator Proposal");
        setArbitrator(escrowData.arbitration.arbitrator);
        setArbitratorFee(String(escrowData.arbitration.arbitratorFee));
        return;
      }

      // Buyer who proposed the arbitrator
      if (
        escrowData.connectedUser === BUYER &&
        escrowData.arbitration.consensusBuyer
      ) {
        setAction("view");
        setTitle("Arbitrator Proposal");
        setArbitrator(escrowData.arbitration.arbitrator);
        setArbitratorFee(String(escrowData.arbitration.arbitratorFee));
        return;
      }

      // buyer or seller should accept the arbitrator proposal
      if (
        escrowData.arbitration.consensusBuyer &&
        escrowData.arbitration.consensusSeller
      ) {
        setTitle("Arbitrator Proposal");
        setArbitrator(escrowData.arbitration.arbitrator);
        setArbitratorFee(String(escrowData.arbitration.arbitratorFee));
        setAction("edit");
        return;
      }

      setArbitrator(escrowData.arbitration.arbitrator);
      setArbitratorFee(escrowData.arbitration.arbitratorFee.toString());
      setAction("edit");
    }
  }, [escrowData]);

  const confirm = () => {
    setIsLoading(true);
    proposeArbitrator(escrowId, arbitrator, Number(arbitratorFee), callbacks)
      .then(() => {
        setError(null);
        setSuccess("Arbitrator Proposal Sent");
        toast.success("Arbitrator Proposal Sent");

        setAction("added");
      })
      .catch((e) => {
        console.error(e);
        setSuccess(null);
        setError(e.message);
        toast.error(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const accept = () => {
    setIsLoading(true);
    approveArbitrator(escrowId, arbitrator, Number(arbitratorFee), callbacks)
      .then(() => {
        setSuccess("Arbitrator Approved");
        toast.success("Arbitrator Approved");
        setError(null);
        setAction("view");
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (action === "view" || action === "edit") {
      accept();
    } else {
      confirm();
    }
  };

  const ModalBody = () => {
    if (!escrowData) return null;

    return (
      <Stack>
        <InputText
          autoFocus
          required
          disabled={action === "view" || action === "edit" || !!success}
          name="arbitrator"
          id="arbitrator"
          label="Address"
          onChange={(event) => setArbitrator(event.target.value)}
          value={arbitrator}
        />
        <InputText
          disabled={action === "view" || action === "edit" || !!success}
          required
          name="arbitratorFee"
          id="arbitratorFee"
          label="Fee"
          onChange={(event) => setArbitratorFee(event.target.value)}
          value={arbitratorFee}
          min="0"
          max="100"
          type="number"
          adornmentStart={{
            content: <AdornmentContent>%</AdornmentContent>,
          }}
          adornmentEnd={{
            content: escrowData.arbitration && (
              <FormattedPercentageAmountAdornment
                amount={escrowData?.amount}
                tokenInfo={escrowData?.token}
                percentage={arbitratorFee}
              />
            ),
            options: { hideBorder: true },
          }}
        />
      </Stack>
    );
  };

  const ModalFooter = () => {
    if (action === "view" || action === "added") {
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

    if (action === "edit") {
      return (
        <Stack direction="row" style={{ width: "100%" }}>
          <Button
            disabled={isLoading}
            fullWidth
            variant="secondary"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setError(null);
              setAction("editing");
            }}
          >
            Change
          </Button>

          <Button
            disabled={isLoading}
            fullWidth
            variant="primary"
            type="submit"
          >
            {error ? "Retry" : "Accept"}
          </Button>
        </Stack>
      );
    }

    if (action === "editing") {
      return (
        <Stack direction="row" style={{ width: "100%" }}>
          <Button
            disabled={isLoading}
            fullWidth
            variant="tertiary"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setError(null);
              if (escrowData.arbitration) {
                setArbitrator(escrowData.arbitration.arbitrator);
                setArbitratorFee(String(escrowData?.arbitration.arbitratorFee));
              }
              setAction("edit");
            }}
          >
            Back
          </Button>

          <Button
            disabled={isLoading}
            fullWidth
            variant="primary"
            type="submit"
          >
            {error ? "Retry" : "Confirm"}
          </Button>
        </Stack>
      );
    }

    if (action === "new") {
      return (
        <Stack direction="row" style={{ width: "100%" }}>
          <Button
            disabled={isLoading}
            fullWidth
            variant="tertiary"
            type="button"
            onClick={onModalClose}
          >
            Cancel
          </Button>

          <Button
            disabled={isLoading}
            fullWidth
            variant="primary"
            type="submit"
          >
            {error ? "Retry" : "Confirm"}
          </Button>
        </Stack>
      );
    }

    return null;
  };

  return (
    <form ref={closeHandlerRef} autoComplete="off" onSubmit={handleSubmit}>
      <ScopedModal
        title={title}
        body={<ModalBody />}
        footer={<ModalFooter />}
        onClose={onModalClose}
        isLoading={isLoading}
        loadingMessage={isLoading ? "Getting Arbitration information" : ""}
        modalAction={modalAction}
      />
    </form>
  );
};
