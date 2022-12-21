/**
 * **isSameAddress** function compares two addresses, if equal returns true otherwise false.
 *
 * *Always use this function to compare addresses, and avoid to call toLowerCase() directly*
 *
 * @returns {boolean}
 */
export const isSameAddress = (
	address1: string | null,
	address2: string | null,
) => {
	if (address1?.toLowerCase() === address2?.toLowerCase()) {
		return true;
	}
	return false;
};
