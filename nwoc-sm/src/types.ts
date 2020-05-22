export interface IScore {
  id: string
  name: string
  otherName?: string
  address: string
  year?: number
  publisher?: string
  singer?: string
  note?: string
}

interface StringMap {
  [key: string]: string
}
export interface IAdresses extends StringMap {}
export interface IPublishers extends StringMap {}