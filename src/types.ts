export interface PropertyPhoto {
  id: string
  dataUrl: string
  caption: string
}

export type TemplateStyle = 'elegancki' | 'nowoczesny' | 'rustykalny'

export interface PropertyData {
  title: string
  price: string
  priceNegotiable: boolean
  city: string
  address: string
  area: string
  plotArea: string
  rooms: string
  bathrooms: string
  floor: string
  yearBuilt: string
  heating: string
  description: string
  features: string[]
  contactName: string
  contactPhone: string
  contactEmail: string
  photos: PropertyPhoto[]
  template: TemplateStyle
}

export const FEATURE_OPTIONS = [
  'Garaż',
  'Ogród',
  'Taras',
  'Balkon',
  'Piwnica',
  'Basen',
  'Klimatyzacja',
  'Ogrzewanie podłogowe',
  'Panele fotowoltaiczne',
  'Alarm / monitoring',
  'Zamknięte osiedle',
  'Blisko szkoły',
  'Blisko komunikacji',
  'Umeblowane',
]

export const emptyProperty: PropertyData = {
  title: '',
  price: '',
  priceNegotiable: false,
  city: '',
  address: '',
  area: '',
  plotArea: '',
  rooms: '',
  bathrooms: '',
  floor: '',
  yearBuilt: '',
  heating: '',
  description: '',
  features: [],
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  photos: [],
  template: 'elegancki',
}
