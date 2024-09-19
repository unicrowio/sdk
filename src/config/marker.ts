/**
 * *MARKER*
 * Key/Value pair of the question marker.
 * Change only the value to change the question marker.
 */
export const MARKER = {
  seller: "Who is supposed to receive the funds from the escrow",
  buyer: "Who has sent the payment to the escrow",
  arbitrator:
    "Arbitrator can decide if the payment should be sent to the seller, refunded to the buyer, or split between them",
  arbitratorFee:
    "Arbitrators receive their fee from the sellers amount unless they step in to decide a dispute in which case they receive the fee even from the refunded amount",
  marketplace: "Address of a marketplace that facilitates this payment",
  challengePeriod: "How long will it be possible to challenge the payment",
  challengePeriodExtension:
    "How long will a new challenge period last after a challenge",
  paymentReference: "Text reference (e.g. order ID)",
};
