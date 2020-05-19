// @flow
import React from 'react'
import styled from 'styled-components'

import Button from '~/components/layout/Button'
import { getEtherScanLink } from '~/logic/wallets/getWeb3'
import { connected } from '~/theme/variables'

const EtherScanLink = styled.a`
  color: ${connected};
`

const ButtonWithMargin = styled(Button)`
  margin-right: 16px;
`

export const GenericFooter = ({ safeCreationTxHash }: { safeCreationTxHash: string }) => (
  <span>
    <p>This process should take a couple of minutes.</p>
    <p>
      Follow the progress on{' '}
      <EtherScanLink
        aria-label="Show details on Etherscan"
        href={getEtherScanLink('tx', safeCreationTxHash)}
        rel="noopener noreferrer"
        target="_blank"
      >
        Etherscan.io
      </EtherScanLink>
      .
    </p>
  </span>
)

export const ContinueFooter = ({
  continueButtonDisabled,
  onContinue,
}: {
  continueButtonDisabled: boolean,
  onContinue: Function,
}) => (
  <Button color="primary" disabled={continueButtonDisabled} onClick={onContinue} variant="contained">
    Continue
  </Button>
)

export const ErrorFooter = ({ onCancel, onRetry }: { onCancel: Function, onRetry: Function }) => (
  <>
    <ButtonWithMargin onClick={onCancel} variant="contained">
      Cancel
    </ButtonWithMargin>
    <Button color="primary" onClick={onRetry} variant="contained">
      Retry
    </Button>
  </>
)
