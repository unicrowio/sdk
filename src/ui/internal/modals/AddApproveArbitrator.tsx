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
import { IArbitrateModalProps, IGetEscrowData } from "../../../typing";
import { useModalStates } from "../hooks/useModalStates";
import { getEscrowData } from "../../../core/getEscrowData";
import { ScopedModal } from "../components";
import { BUYER, SELLER } from "../../../helpers";
import { Forbidden } from "../components/Forbidden";
import { useNetworkCheck } from "../hooks/useNetworkCheck";

/**
 * Approve the Arbitrator proposed
 * @returns
 */
export const AddApproveArbitrator = ({
  escrowId,
  deferredPromise,
  callbacks,
}: IArbitrateModalProps) => {
  const {
    setLoadingMessage,
    loadingMessage,
    setIsLoading,
    setSuccess,
    error,
    setError,
    success,
    onModalClose,
    isLoading,
  } = useModalStates({ deferredPromise });

  const { isCorrectNetwork } = useNetworkCheck();

  const [escrowData, setEscrowData] = React.useState<IGetEscrowData | null>(
    null,
  );

  const [arbitrator, setArbitrator] = React.useState<string>("");
  const [arbitratorFee, setArbitratorFee] = React.useState<string>("");

  const [action, setAction] = React.useState<
    "initial" | "new" | "edit" | "view" | "added" | "editing"
  >("initial");

  const [title, setTitle] = React.useState<string>("Arbitrator Proposal");

  const loadData = async () => {
    if (isCorrectNetwork) {
      try {
        setIsLoading(true);

        setLoadingMessage("Getting Arbitration information");
        const escrow: IGetEscrowData = await getEscrowData(escrowId);
        setEscrowData(escrow);

        // Buyer or Seller should propose an arbitrator
        if (!escrow.arbitration) {
          setAction("new");
          setTitle("Propose an Arbitrator");
          setArbitrator("");
          setArbitratorFee("");
          return;
        }

        // Seller who proposed the arbitrator
        if (
          escrow.connectedUser === SELLER &&
          escrow.arbitration.consensusSeller
        ) {
          setAction("view");
          setTitle("Arbitrator Proposal");
          setArbitrator(escrow.arbitration.arbitrator);
          setArbitratorFee(String(escrow.arbitration.arbitratorFee));
          return;
        }

        // Buyer who proposed the arbitrator
        if (
          escrow.connectedUser === BUYER &&
          escrow.arbitration.consensusBuyer
        ) {
          setAction("view");
          setTitle("Arbitrator Proposal");
          setArbitrator(escrow.arbitration.arbitrator);
          setArbitratorFee(String(escrow.arbitration.arbitratorFee));
          return;
        }

        // buyer or seller should accept the arbitrator proposal
        if (
          escrow.arbitration.consensusBuyer &&
          escrow.arbitration.consensusSeller
        ) {
          setTitle("Arbitrator Proposal");
          setArbitrator(escrow.arbitration.arbitrator);
          setArbitratorFee(String(escrow.arbitration.arbitratorFee));
          setAction("edit");
          return;
        }

        setArbitrator(escrow.arbitration.arbitrator);
        setArbitratorFee(escrow.arbitration.arbitratorFee.toString());
        setAction("edit");
      } catch (error: any) {
        console.error(error);
        toast(error.message, "error");
        onModalClose();
      } finally {
        setLoadingMessage("");
        setIsLoading(false);
      }
    }
  };

  React.useEffect(() => {
    loadData();
  }, [isCorrectNetwork]);

  const confirm = () => {
    setIsLoading(true);
    proposeArbitrator(escrowId, arbitrator, Number(arbitratorFee), callbacks)
      .then(() => {
        setError(null);
        setSuccess("Arbitrator Proposal Sent");
        toast("Arbitrator Proposal Sent", "success");

        setAction("added");
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

  const accept = () => {
    setIsLoading(true);
    approveArbitrator(escrowId, arbitrator, Number(arbitratorFee), callbacks)
      .then(() => {
        setSuccess("Arbitrator Approved");
        toast("Arbitrator Approved", "success");
        setError(null);
        setAction("view");
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (action === "view" || action === "edit") {
      accept();
    } else {
      confirm();
    }
  };

  const ModalFooter = () => {
    const isBuyer = escrowData?.connectedUser === BUYER;
    const isSeller = escrowData?.connectedUser === SELLER;

    if (!(escrowData && (isBuyer || isSeller))) {
      return null;
    }

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

  const ModalBody = () => {
    if (!escrowData) return null;

    if (
      escrowData?.connectedUser !== BUYER &&
      escrowData?.connectedUser !== SELLER
    ) {
      return <Forbidden onClose={onModalClose} />;
    }

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

  return (
    <form autoComplete="off" onSubmit={handleSubmit}>
      <ScopedModal
        title={title}
        body={<ModalBody />}
        footer={<ModalFooter />}
        onClose={onModalClose}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
      />
    </form>
  );
};
