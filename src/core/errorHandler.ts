// Update this file with new errors from contract ERRORS.md file
// Contract Errors
const ERRORS = {
  '0-001': 'EscrowId is zero.',
  '0-002': 'Seller is the zero address.',
  '0-003': 'Seller is also the buyer.',
  '0-004': 'Invalid EscrowId.',
  '0-005': 'You already claimed.',
  '0-006': "You can't claim.",
  '0-007': 'Only the crow can call this function',
  '1-001': 'Buyer is the zero address.',
  '1-002': 'Seller is the zero address.',
  '1-003': "Value can't be zero.",
  '1-004': 'Incorrect Fee.',
  '1-005': 'The escrow already has consensus.',
  '1-006': 'Invalid settlement.',
  '1-007': 'You exceeded the 100% split limit.',
  '1-008': 'You already have a consensus',
  '1-009': 'You need to be a seller or buyer.',
  '1-010': 'You already have consensus.',
  '1-011': 'Only seller can refund.',
  '1-012': 'Insufficient balance.',
  '1-013': 'Unable to send value, recipient may have reverted.',
  '1-014': 'Buyer was the last one to challenge.',
  '1-015': 'Seller was the last one to challenge.',
  '1-016': 'The challenge period expired.',
  '1-017': 'There is no settlement ocurring to this escrowId',
  '1-018': "You aren't validating the last split",
  '1-019': 'Challenge Period hasn’t started yet.',
  '1-020': "You can't approve your own proposal",
  '1-021': "Don't have rewards available at the moment",
  '1-022': "You can't claim this token at the moment",
  '1-023': 'Token not allowed to be convert now',
  '1-024': 'Account not inative yet',
  '2-001': 'is the zero address.',
  '2-002': 'You need a dispute to arbitrate',
  '2-003': "You can't approve twice",
  '2-004': 'Only escrow members are allowed to call this function.',
  '2-005': 'Only the arbitrator defined in the escrow can arbitrate it.',
  '2-006': 'Arbitrator is already set for this escrow.',
  '2-007': 'You aren not approving this arbitrator fee.',
  '2-008': 'You are not approving this arbitrator address'
}

type ErrorCode = keyof typeof ERRORS

// Metamask Provider Errors
const METAMASK_ERRORS = {
  ACTION_REJECTED: 'User rejected the request'
}

type ErrorCodeMetaMask = keyof typeof METAMASK_ERRORS

interface IMMError {
  action: string
  code: ErrorCodeMetaMask
  reason: string
  transaction: any
  message: string
  stack: string
}

const _handleMataMaskError = (error: IMMError) => {
  const errorMessage = METAMASK_ERRORS[error.code]
  return errorMessage || error.message || 'Oops! Something went wrong.'
}

/**
 * Returns errors from the contract, MetaMask or any error that might arise.
 *
 * @returns {string}
 */
export const errorHandler = (error: any) => {
  // generic message when no error code is found
  let errorMessage = _handleMataMaskError(error)
  const message: string | undefined =
    error.data?.message || error.error?.data?.message
  if (message) {
    // get only 0-003
    // we expect an error message like: 'VM Exception while processing transaction: revert 0-003'
    const errorCode = message.split('revert ')[1] as ErrorCode
    errorMessage = ERRORS[errorCode] || errorMessage
  }

  return errorMessage
}
