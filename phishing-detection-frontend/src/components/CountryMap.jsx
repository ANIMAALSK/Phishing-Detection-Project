import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";

// Custom marker icon (fix Leaflet default marker issue in React)
const markerIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const CountryMap = ({ country }) => {
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (country) {
      // Fetch coordinates based on country name
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${country}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0) {
            setCoords({
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon),
            });
          }
        })
        .catch((error) => console.error("Error fetching country coordinates:", error));
    }
  }, [country]);

  return coords ? (
    <MapContainer center={[coords.lat, coords.lon]} zoom={4} style={{ height: "300px", width: "100%", borderRadius: "10px", overflow: "hidden" }}>
      {/* Google Maps Tile Layer */}
      <TileLayer
        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
      />
      <Marker position={[coords.lat, coords.lon]} icon={markerIcon}>
        <Popup>{country}</Popup>
      </Marker>
    </MapContainer>
  ) : (
    <p>Loading map...</p>
  );
};

export default CountryMap;
