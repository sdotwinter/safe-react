import React, { Suspense, useEffect, useState } from 'react'
import cn from 'classnames'
import CircularProgress from '@material-ui/core/CircularProgress'
import { makeStyles } from '@material-ui/core/styles'
import { ProposedTX } from './SendModal.d'

import Modal from 'src/components/Modal'

const ChooseTxType = React.lazy(() => import('./screens/ChooseTxType'))

const SendFunds = React.lazy(() => import('./screens/SendFunds'))

const SendCollectible = React.lazy(() => import('./screens/SendCollectible'))

const ReviewCollectible = React.lazy(() => import('./screens/ReviewCollectible'))

const ReviewTx = React.lazy(() => import('./screens/ReviewTx'))

const ContractInteraction = React.lazy(() => import('./screens/ContractInteraction'))

const ContractInteractionReview = React.lazy(() => import('./screens/ContractInteraction/Review'))

const SendCustomTx = React.lazy(() => import('./screens/ContractInteraction/SendCustomTx'))

const ReviewCustomTx = React.lazy(() => import('./screens/ContractInteraction/ReviewCustomTx'))

const useStyles = makeStyles({
  scalableModalWindow: {
    height: 'auto',
  },
  scalableStaticModalWindow: {
    height: 'auto',
  },
  loaderStyle: {
    height: '500px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

type SendModalProps = {
  activeScreenType: string
  isOpen: boolean
  onClose: () => void
  recipientAddress?: string
  selectedToken?: string
  ethBalance?: string
}

const getInitialTxValue = (recipientAddress = '') => ({
  recipientAddress,
  contractAddress: '',
  amount: '',
  token: '',
})

const SendModal = ({
  activeScreenType,
  isOpen,
  onClose,
  recipientAddress = '',
  selectedToken,
}: SendModalProps): React.ReactElement => {
  const classes = useStyles()
  const [activeScreen, setActiveScreen] = useState(activeScreenType || 'chooseTxType')
  const [tx, setTx] = useState<ProposedTX>(getInitialTxValue(recipientAddress))
  const [isABI, setIsABI] = useState(true)

  useEffect(() => {
    setActiveScreen(activeScreenType || 'chooseTxType')
    setIsABI(true)
    setTx(getInitialTxValue())
  }, [activeScreenType, isOpen])

  const scalableModalSize = activeScreen === 'chooseTxType'

  const handleTxCreation = (txInfo) => {
    setActiveScreen('reviewTx')
    setTx(txInfo)
  }

  const handleContractInteractionCreation = (contractInteractionInfo: ProposedTX, submit: boolean): void => {
    setTx(contractInteractionInfo)
    if (submit) setActiveScreen('contractInteractionReview')
  }

  const handleCustomTxCreation = (customTxInfo: ProposedTX, submit: boolean): void => {
    setTx(customTxInfo)
    if (submit) setActiveScreen('reviewCustomTx')
  }

  const handleSendCollectible = (txInfo: ProposedTX) => {
    setActiveScreen('reviewCollectible')
    setTx(txInfo)
  }

  const handleSwitchMethod = (): void => {
    setIsABI(!isABI)
  }

  return (
    <Modal
      description="Send Tokens Form"
      handleClose={onClose}
      open={isOpen}
      paperClassName={cn(scalableModalSize ? classes.scalableStaticModalWindow : classes.scalableModalWindow)}
      title="Send Tokens"
    >
      <Suspense
        fallback={
          <div className={classes.loaderStyle}>
            <CircularProgress size={40} />
          </div>
        }
      >
        {activeScreen === 'chooseTxType' && (
          <ChooseTxType onClose={onClose} recipientAddress={recipientAddress} setActiveScreen={setActiveScreen} />
        )}
        {activeScreen === 'sendFunds' && (
          <SendFunds
            initialValues={tx}
            onClose={onClose}
            onNext={handleTxCreation}
            recipientAddress={recipientAddress}
            selectedToken={selectedToken}
          />
        )}
        {activeScreen === 'reviewTx' && (
          <ReviewTx onClose={onClose} onPrev={() => setActiveScreen('sendFunds')} tx={tx} />
        )}
        {activeScreen === 'contractInteraction' && isABI && (
          <ContractInteraction
            isABI={isABI}
            switchMethod={handleSwitchMethod}
            contractAddress={recipientAddress}
            initialValues={tx}
            onClose={onClose}
            onNext={handleContractInteractionCreation}
          />
        )}
        {activeScreen === 'contractInteractionReview' && isABI && tx && (
          <ContractInteractionReview onClose={onClose} onPrev={() => setActiveScreen('contractInteraction')} tx={tx} />
        )}
        {activeScreen === 'contractInteraction' && !isABI && (
          <SendCustomTx
            initialValues={tx}
            isABI={isABI}
            switchMethod={handleSwitchMethod}
            onClose={onClose}
            onNext={handleCustomTxCreation}
            contractAddress={recipientAddress}
          />
        )}
        {activeScreen === 'reviewCustomTx' && (
          <ReviewCustomTx onClose={onClose} onPrev={() => setActiveScreen('contractInteraction')} tx={tx} />
        )}
        {activeScreen === 'sendCollectible' && (
          <SendCollectible
            initialValues={tx}
            onClose={onClose}
            onNext={handleSendCollectible}
            recipientAddress={recipientAddress}
            selectedToken={selectedToken}
          />
        )}
        {activeScreen === 'reviewCollectible' && (
          <ReviewCollectible onClose={onClose} onPrev={() => setActiveScreen('sendCollectible')} tx={tx} />
        )}
      </Suspense>
    </Modal>
  )
}

export default SendModal
