"use client"

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet icon issues in Next.js
const fixLeafletIcon = () => {
  // @ts-ignore - Leaflet's icon system doesn't play well with webpack
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  })
}

// Custom purple marker to match the app's theme
const purpleIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map style options
const mapStyles = {
  light: {
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://stamen.com">Stamen Design</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  dark: {
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://stamen.com">Stamen Design</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  pastel: {
    url: "https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://stamen.com">Stamen Design</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }
};

interface MapProps {
  zipCode: string
  dogName?: string
  height?: string
  width?: string
  className?: string
  mapStyle?: 'light' | 'dark' | 'pastel'
}

// Response type from the geocoding API
interface GeocodingResult {
  place_id: number;
  licence: string;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
}

// This function calls our geocoding API to convert a zip code to coordinates
async function getCoordinatesFromZipCode(zipCode: string): Promise<[number, number] | null> {
  try {
    const response = await fetch(`/api/locations/geocode?address=${zipCode}`);
    
    if (!response.ok) {
      console.error(`Error fetching coordinates: ${response.status}`);
      return null;
    }
    
    const data = await response.json() as GeocodingResult[];
    
    // Check if we got valid results back
    if (data && data.length > 0) {
      // The geocoding API returns latitude and longitude as strings, so we need to parse them
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      
      if (isNaN(lat) || isNaN(lon)) {
        console.error("Invalid coordinates received:", data[0]);
        return null;
      }
      
      return [lat, lon];
    }
    
    // No results found
    console.error("No geocoding results for zip code:", zipCode);
    return null;
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
}

export default function Map({ 
  zipCode, 
  dogName = "Dog Location",
  height = "100%", 
  width = "100%",
  className = "",
  mapStyle = "pastel" // default to pastel style
}: MapProps) {
  // State to track if we're on the client side
  const [isMounted, setIsMounted] = useState(false)
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
    fixLeafletIcon()
    
    // Fetch coordinates from zip code
    const fetchCoordinates = async () => {
      try {
        setLoading(true)
        setError(false)
        const coords = await getCoordinatesFromZipCode(zipCode)
        setCoordinates(coords)
        if (!coords) {
          setError(true)
        }
      } catch (error) {
        console.error("Error in coordinate fetching:", error)
        setError(true)
        setCoordinates(null)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCoordinates()
  }, [zipCode])
  
  if (!isMounted || loading) {
    // Return a placeholder or loading state
    return (
      <div 
        style={{ height, width }} 
        className={`bg-gray-100 flex items-center justify-center font-publicSans ${className}`}
      >
        Loading map...
      </div>
    )
  }
  
  // Don't render the map if geocoding failed
  if (error || !coordinates) {
    return (
      <div 
        style={{ height, width }} 
        className={`bg-gray-100 flex items-center justify-center font-publicSans text-gray-500 ${className}`}
      >
        <div className="text-center p-4">
          <p>Location map unavailable</p>
          <p className="text-sm mt-1">Zip code: {zipCode}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div style={{ height, width }} className={className}>
      {/* @ts-ignore - Type definitions issue with react-leaflet 5.0.0-rc.2 */}
      <MapContainer 
        center={coordinates} 
        zoom={11} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        <TileLayer
          attribution={mapStyles[mapStyle].attribution}
          url={mapStyles[mapStyle].url}
        />
        <Marker position={coordinates} icon={purpleIcon}>
          <Popup>
            <div className="font-publicSans text-sm">
              <span className="font-bold">{dogName}</span>
              <br />
              Zip Code: {zipCode}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}