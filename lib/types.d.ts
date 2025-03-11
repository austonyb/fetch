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

interface LocationSearchParams {
    city?: string
    states?: string[]
    geoBoundingBox?: {
        top?: number
        left?: number
        bottom?: number
        right?: number
        bottom_left?: Coordinates
        top_right?: Coordinates
        bottom_right?: Coordinates
        top_left?: Coordinates
    }
    size?: number
    from?: number
}

interface LocationSearchResult {
    results: Location[]
    total: number
}

interface SearchParams {
    breeds?: string[]
    zipCodes?: string[]
    ageMin?: number
    ageMax?: number
    size?: number
    from?: number
    page?: number
    sort?: `${'breeds' | 'zipCodes' | 'ageMin' | 'ageMax' | 'size' | 'age' | 'name' | 'breed'}:${'asc' | 'desc'}`
    geoBoundingBox?: {
        top_left: Coordinates,
        bottom_right: Coordinates
    } | null
}

interface SearchResult {
    resultIds: string[]
    total: number
    next: string
    prev: string
}
