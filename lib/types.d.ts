export interface Breed {
    value: string;
    label: string;
}

interface Coordinates {
    lat: number;
    lon: number;
}

interface Dog {
    id: string
    img: string
    name: string
    age: number
    zip_code: string
    breed: string
}

interface Location {
    zip_code: string
    latitude: number
    longitude: number
    city: string
    state: string
    county: string
}

interface SearchParams {
    breeds?: string[]
    zipCodes?: string[]
    ageMin?: number
    ageMax?: number
    size?: number
    from?: number
    sort?: `${'breeds' | 'zipCodes' | 'ageMin' | 'ageMax' | 'size'}:${'asc' | 'desc'}`
}

interface SearchResult {
    resultIds: string[]
    total: number
    next: string
    prev: string
}
