"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Rectangle, useMap, useMapEvents } from 'react-leaflet'
import L, { LatLngBounds } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet icon issues in Next.js
const fixLeafletIcon = () => {
  // @ts-expect-error - Leaflet's icon system doesn't play well with webpack
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  })
}

interface BoundingBox {
  top_left: { lat: number; lon: number };
  bottom_right: { lat: number; lon: number };
}

interface MapSelectionProps {
  onBoundsChange: (bounds: BoundingBox | null) => void;
  height?: string;
  width?: string;
  className?: string;
  mapStyle?: 'light' | 'dark' | 'pastel';
  initialCenter?: [number, number];
  initialZoom?: number;
}

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

// This component updates the search bounds when the map viewport changes
function ViewportBoundsHandler({ onBoundsChange }: { onBoundsChange: (bounds: BoundingBox | null) => void }) {
  const map = useMap();
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const initialBoundsSetRef = useRef(false);
  const lastBoundsRef = useRef<BoundingBox | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to handle viewport changes and notify parent
  const handleViewportChange = useCallback(() => {
    const currentBounds = map.getBounds();
    setBounds(currentBounds);
    
    // Convert Leaflet bounds to our bounding box format
    const boundingBox: BoundingBox = {
      top_left: {
        lat: currentBounds.getNorth(),
        lon: currentBounds.getWest()
      },
      bottom_right: {
        lat: currentBounds.getSouth(),
        lon: currentBounds.getEast()
      }
    };
    
    // Check if the change is significant enough to trigger a new search
    const lastBounds = lastBoundsRef.current;
    const isSignificantChange = !lastBounds || 
      Math.abs(boundingBox.top_left.lat - lastBounds.top_left.lat) > 0.1 ||
      Math.abs(boundingBox.top_left.lon - lastBounds.top_left.lon) > 0.1 ||
      Math.abs(boundingBox.bottom_right.lat - lastBounds.bottom_right.lat) > 0.1 ||
      Math.abs(boundingBox.bottom_right.lon - lastBounds.bottom_right.lon) > 0.1;
    
    // Only trigger a new search if the change is significant
    if (isSignificantChange) {
      lastBoundsRef.current = boundingBox;
      onBoundsChange(boundingBox);
    }
  }, [map, onBoundsChange]);
  
  // Debounced handler for events
  const debouncedHandleViewportChange = useCallback(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set a new timer
    debounceTimerRef.current = setTimeout(() => {
      handleViewportChange();
    }, 300); // 300ms debounce
  }, [handleViewportChange]);
  
  // Update bounds when the map view changes (zoom, pan, etc.)
  useMapEvents({
    moveend: debouncedHandleViewportChange,
    zoomend: debouncedHandleViewportChange
  });
  
  useEffect(() => {
    if (map && !initialBoundsSetRef.current) {
      initialBoundsSetRef.current = true;
      handleViewportChange();
    }
    
    return () => {
      // Clean up any pending debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [map, handleViewportChange]);
  
  return bounds ? (
    <Rectangle 
      bounds={bounds} 
      pathOptions={{ color: '#9333ea', weight: 2, fillOpacity: 0.1, fillColor: '#9333ea', dashArray: '5, 5' }}
    />
  ) : null;
}

// This component will help initialize Leaflet when the map is ready
function InitializeLeaflet() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fixLeafletIcon();
    }
  }, []);
  
  return null;
}

export default function MapSelection({
  onBoundsChange,
  height = "300px",
  width = "100%",
  className = "",
  mapStyle = "light",
  initialCenter = [39.8283, -98.5795],
  initialZoom = 4
}: MapSelectionProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  // Mount check for client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Instructions for the user
  const instructions = (
    <div className="absolute bottom-2 left-2 right-2 z-[1000] bg-white bg-opacity-80 p-2 rounded-md text-xs font-publicSans text-gray-800">
      <strong>Tip:</strong> The current map view determines which dogs are shown. Pan and zoom to find dogs in different areas.
    </div>
  );

  // Show nothing during SSR to prevent hydration errors
  if (!isMounted) {
    return <div style={{ height, width }} className={`${className} bg-gray-100`}></div>;
  }
  
  return (
    <div style={{ height, width }} className={`${className} relative`}>
      {instructions}
      
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
        zoomControl={true}
        className="z-0" // Ensure map has a low z-index
      >
        <InitializeLeaflet />
        <TileLayer
          attribution={mapStyles[mapStyle].attribution}
          url={mapStyles[mapStyle].url}
        />
        <ViewportBoundsHandler onBoundsChange={onBoundsChange} />
      </MapContainer>
    </div>
  );
}
