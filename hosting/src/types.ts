export type Score = {
  id: string
  name: string
  otherName?: string
  address: string
  year?: number
  publisher?: string
  singer?: string
  note?: string
}

export type IdNameRecord = {
  id: string
  name: string
}

export type ValidateResult = true | string
