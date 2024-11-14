


export interface ICity {
  name: string,
  countryCode: string,
  stateCode: string,
  latitude: string,
  longitude: string
}

export interface IState {
  name: string,
  isoCode: string,
  countryCode: string,
  latitude: string,
  longitude: string
}

export interface ICollege {
  College_Name: string,
  State: string,
  StateCode: string,
  Stream: string,
}

export interface IOptionset {
  option: string,
  type: string,
  tag: string,
  value: string
}