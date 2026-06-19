export function generatePixPayload({
  pixKey,
  merchantName,
  merchantCity,
  amount,
  txId = '***',
}: {
  pixKey: string
  merchantName: string
  merchantCity: string
  amount: number
  txId?: string
}) {
  const format = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, '0')
    return `${id}${len}${value}`
  }

  const gui = format('00', 'BR.GOV.BCB.PIX')
  const key = format('01', pixKey)
  const merchantAccount = format('26', gui + key)

  const mcc = format('52', '0000')
  const currency = format('53', '986')

  const amountStr = amount.toFixed(2)
  const transactionAmount = format('54', amountStr)

  const country = format('58', 'BR')
  const name = format('59', merchantName.substring(0, 25))
  const city = format('60', merchantCity.substring(0, 15))

  const txIdField = format('05', txId)
  const additionalData = format('62', txIdField)

  const payload = [
    format('00', '01'),
    merchantAccount,
    mcc,
    currency,
    transactionAmount,
    country,
    name,
    city,
    additionalData,
    '6304',
  ].join('')

  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff
      } else {
        crc = (crc << 1) & 0xffff
      }
    }
  }

  const crcStr = crc.toString(16).toUpperCase().padStart(4, '0')
  return payload + crcStr
}
