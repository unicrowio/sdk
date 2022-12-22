import Deferred from "../../helpers/deferred";
import { Dispatch, useState } from "react";
import { umountModal } from "../../ui";

export type TUseModalStates = {
	isLoading: boolean;
	setIsLoading: Dispatch<boolean>;
	loadingMessage: string;
	setLoadingMessage: Dispatch<string>;
	error: string | null;
	setError: Dispatch<any>;
	success: string | null;
	setSuccess: Dispatch<any>;
	onModalClose: () => any;
};

export const useModalStates = ({
	deferredPromise,
}: {
	deferredPromise: Deferred<any>;
}): TUseModalStates => {
	const [isLoading, setIsLoading] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState<string>("");

	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const onModalClose = () => {
		if (!(error || success)) {
			const noActionCloseError = {
				message: "User closed modal without taking any actions",
			};
			deferredPromise.reject(noActionCloseError);
		} else if (!success) {
			deferredPromise.reject(error);
		} else {
			deferredPromise.resolve(success);
		}

		umountModal();
	};

	return {
		isLoading,
		setIsLoading,
		loadingMessage,
		setLoadingMessage,
		error,
		setError,
		success,
		setSuccess,
		onModalClose,
	};
};
