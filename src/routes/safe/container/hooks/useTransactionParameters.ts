import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { getUserNonce } from 'src/logic/wallets/ethTransactions'
import { userAccountSelector } from 'src/logic/wallets/store/selectors'
import { getLastTx, getNewTxNonce } from 'src/logic/safe/store/actions/utils'
import { getGnosisSafeInstanceAt } from 'src/logic/contracts/safeContracts'
import { safeSelector } from 'src/logic/safe/store/selectors'
import { web3ReadOnly as web3 } from 'src/logic/wallets/getWeb3'
import { ParametersStatus } from 'src/routes/safe/components/Transactions/helpers/utils'
import { sameString } from 'src/utils/strings'

export type TxParameters = {
  safeNonce: string | undefined
  setSafeNonce: (safeNonce: string | undefined) => void
  safeTxGas: string | undefined
  setSafeTxGas: (gas: string | undefined) => void
  ethNonce: string | undefined
  setEthNonce: (ethNonce: string | undefined) => void
  ethGasLimit: string | undefined
  setEthGasLimit: (ethGasLimit: string | undefined) => void
  ethGasPrice: string | undefined
  setEthGasPrice: (ethGasPrice: string | undefined) => void
  ethGasPriceInGWei: string | undefined
}

type Props = {
  calculateSafeNonce: boolean
  parameterStatus: ParametersStatus
}

/**
 * This hooks is used to store tx parameter
 * It needs to be initialized calling setGasEstimation.
 */
export const useTransactionParameters = (
  { calculateSafeNonce, parameterStatus }: Props = { calculateSafeNonce: true, parameterStatus: 'ENABLED' },
): TxParameters => {
  const isCancelTransaction = sameString(parameterStatus, 'CANCEL_TRANSACTION')
  const connectedWalletAddress = useSelector(userAccountSelector)
  const { address: safeAddress } = useSelector(safeSelector) || {}

  // Safe Params
  const [safeNonce, setSafeNonce] = useState<string | undefined>(undefined)
  // SafeTxGas: for a new Tx call requiredTxGas, for an existing tx get it from the backend.
  const [safeTxGas, setSafeTxGas] = useState<string | undefined>(isCancelTransaction ? '0' : undefined)

  /* ETH Params */
  const [ethNonce, setEthNonce] = useState<string | undefined>(undefined) // we delegate it to the wallet
  const [ethGasLimit, setEthGasLimit] = useState<string | undefined>(undefined) // call execTx until it returns a number > 0
  const [ethGasPrice, setEthGasPrice] = useState<string | undefined>(undefined) // get fast gas price
  const [ethGasPriceInGWei, setEthGasPriceInGWei] = useState<string | undefined>(undefined) // get fast gas price

  // Get nonce for connected wallet
  useEffect(() => {
    const getNonce = async () => {
      const res = await getUserNonce(connectedWalletAddress)
      setEthNonce(res.toString())
    }

    if (connectedWalletAddress) {
      getNonce()
    }
  }, [connectedWalletAddress])

  // Get ETH gas price
  useEffect(() => {
    if (!ethGasPrice) {
      setEthGasPriceInGWei(undefined)
      return
    }
    if (isCancelTransaction) {
      setEthGasPrice('0')
      return
    }
    setEthGasPriceInGWei(web3.utils.toWei(ethGasPrice, 'Gwei'))
  }, [ethGasPrice, isCancelTransaction])

  // Calc safe nonce
  useEffect(() => {
    const getSafeNonce = async () => {
      const safeInstance = await getGnosisSafeInstanceAt(safeAddress as string)
      const lastTx = await getLastTx(safeAddress as string)
      const nonce = await getNewTxNonce(lastTx, safeInstance)
      setSafeNonce(nonce)
    }

    if (safeAddress && calculateSafeNonce) {
      getSafeNonce()
    }
  }, [safeAddress, calculateSafeNonce])

  return {
    safeNonce,
    setSafeNonce,
    safeTxGas,
    setSafeTxGas,
    ethNonce,
    setEthNonce,
    ethGasLimit,
    setEthGasLimit,
    ethGasPrice,
    setEthGasPrice,
    ethGasPriceInGWei,
  }
}