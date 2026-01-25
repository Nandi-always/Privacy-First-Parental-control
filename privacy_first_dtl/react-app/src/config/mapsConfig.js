// Shared configuration for Google Maps to ensure stability across components
const libraries = ['places'];

const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
const isMapKeyPlaceholder = googleMapsApiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE" || !googleMapsApiKey;

export const MAP_CONFIG = {
    googleMapsApiKey: isMapKeyPlaceholder ? "" : googleMapsApiKey,
    libraries,
    id: 'google-map-script',
    isPlaceholder: isMapKeyPlaceholder
};

export default MAP_CONFIG;
