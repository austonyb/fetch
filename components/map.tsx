"use client"

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L, { LatLngTuple } from 'leaflet'
import 'leaflet/dist/leaflet.css'


const fixLeafletIcon = () => {
  // @ts-expect-error - Leaflet's icon system doesn't play well with webpack
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  })
}


const purpleIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


const mapStyles = {
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  pastel: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
};


async function getCoordinatesFromZipCode(zipCode: string): Promise<LatLngTuple | null> {
  try {
    const response = await fetch(`/api/locations/geocode?address=${zipCode}`)
    if (!response.ok) throw new Error('Failed to fetch location data')
    
    const data = await response.json()
    
    
    if (data && data.length > 0) {
      
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      
      if (isNaN(lat) || isNaN(lon)) {
        console.error("Invalid coordinates received:", data[0]);
        return null;
      }
      
      return [lat, lon] as LatLngTuple;
    }
    
    return null
  } catch (error) {
    console.error('Error fetching coordinates:', error)
    return null
  }
}

interface MapProps {
  zipCode: string;
  dogName?: string;
  height?: string;
  width?: string;
  className?: string;
  mapStyle?: 'light' | 'dark' | 'pastel';
}


function InitializeLeaflet() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fixLeafletIcon();
    }
  }, []);
  
  return null;
}

export default function Map({ 
  zipCode, 
  dogName = "Dog Location",
  height = "100%",
  width = "100%",
  className = "",
  mapStyle = "light"
}: MapProps) {
  const [coordinates, setCoordinates] = useState<LatLngTuple>([39.8283, -98.5795])
  const [locationName, setLocationName] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
    
    
    const fetchCoordinates = async () => {
      try {
        if (!zipCode) return
        
        const coords = await getCoordinatesFromZipCode(zipCode)
        if (coords) {
          setCoordinates(coords)
          setLocationName(zipCode) 
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error)
      }
    }
    
    fetchCoordinates()
  }, [zipCode])
  
  if (!isMounted) {
    return <div style={{ height, width }} className={`${className} bg-gray-100`}></div>;
  }
  
  return (
    <div style={{ height, width }} className={className}>
      <MapContainer 
        center={coordinates} 
        zoom={11} 
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        <InitializeLeaflet />
        <TileLayer
          attribution={mapStyles[mapStyle].attribution}
          url={mapStyles[mapStyle].url}
        />
        <Marker position={coordinates} icon={purpleIcon}>
          <Popup>
            <div className="text-center p-1">
              <div className="font-semibold mb-1">{dogName}</div>
              {locationName && <div className="text-sm text-gray-600">{locationName}</div>}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}