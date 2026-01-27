import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import { MapPin, Plus, Clock, Trash2, Shield, Navigation, AlertCircle } from 'lucide-react';
import { locationService } from '../services/apiService';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../styles/Cards.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks for setting new zone location
function LocationPicker({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
        },
    });
    return null;
}

const LocationMap = ({ child }) => {
    const [loading, setLoading] = useState(false);
    const [geofences, setGeofences] = useState([]);
    const [newZone, setNewZone] = useState({
        name: '',
        latitude: 12.9716, // Default to Bangalore center or similar
        longitude: 77.5946,
        radius: 200,
        startTime: '08:00',
        endTime: '15:00'
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Initial fetch of safe zones
    const fetchGeofences = useCallback(async () => {
        if (!child?._id && !child?.id) return;

        try {
            setLoading(true);
            const childId = child._id || child.id;
            // Use dynamic import to avoid circular dependency if any, or just direct import
            const res = await import('../services/apiService').then(m => m.childrenService.getOne(childId));
            const childData = res.data || res;

            // Handle different API response structures
            const geofenceData = childData.geofences || child.geofences || [];

            // Ensure data is array
            setGeofences(Array.isArray(geofenceData) ? geofenceData : []);

            // If we have geofences, center map on the first one
            if (Array.isArray(geofenceData) && geofenceData.length > 0 && geofenceData[0].latitude) {
                setNewZone(prev => ({
                    ...prev,
                    latitude: geofenceData[0].latitude,
                    longitude: geofenceData[0].longitude
                }));
            }
        } catch (err) {
            console.error('Failed to fetch geofences', err);
            setError('Failed to load safe zones');
        } finally {
            setLoading(false);
        }
    }, [child]);

    useEffect(() => {
        fetchGeofences();
    }, [fetchGeofences]);

    // Handle map click
    const handleLocationSelect = (latlng) => {
        setNewZone(prev => ({
            ...prev,
            latitude: latlng.lat,
            longitude: latlng.lng
        }));
    };

    const handleAddZone = async () => {
        if (!newZone.name) {
            alert("Please give the zone a name (e.g., Home, School)");
            return;
        }

        try {
            setSaving(true);
            const childId = child._id || child.id;
            const updatedZones = [...geofences, { ...newZone, enabled: true }];

            await locationService.updateGeofence({
                childId,
                geofence: updatedZones
            });

            setGeofences(updatedZones);
            // Reset form but keep location roughly same for convenience
            setNewZone(prev => ({ ...prev, name: '', radius: 200 }));
            alert('Safe zone added successfully!');
        } catch (err) {
            console.error('Failed to save zone', err);
            setError('Failed to add safe zone');
        } finally {
            setSaving(false);
        }
    };

    const removeZone = async (index) => {
        if (!window.confirm("Delete this safe zone?")) return;

        try {
            const updatedZones = geofences.filter((_, i) => i !== index);
            const childId = child._id || child.id;
            await locationService.updateGeofence({ childId, geofence: updatedZones });
            setGeofences(updatedZones);
        } catch (err) {
            setError('Failed to remove zone');
        }
    };

    return (
        <div className="card location-map-privacy">
            <div className="card-header">
                <div className="card-title-group">
                    <Shield size={20} className="card-icon" />
                    <h3>Privacy-First Safe Zones</h3>
                </div>
                <div className="privacy-mode-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Openstreetmap_logo.svg" width="16" alt="OSM" />
                    <span>OpenStreetMap</span>
                </div>
            </div>

            <div className="privacy-disclaimer">
                <AlertCircle size={16} />
                <p>
                    Live tracking is hidden for privacy. You receive alerts when <strong>{child?.name}</strong> enters/leaves these zones.
                    <br />
                    <span style={{ fontSize: '11px', opacity: 0.8 }}>Using OpenStreetMap Data</span>
                </p>
            </div>

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}

            {loading && <p className="loading-text" style={{ textAlign: 'center', padding: '10px' }}>⏳ Loading safe zones...</p>}

            <div className="geofence-setup-grid">
                {/* Visual Map Section */}
                <div className="map-panel" style={{
                    height: '400px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    marginBottom: '16px',
                    position: 'relative',
                    zIndex: 0
                }}>
                    <MapContainer
                        center={[newZone.latitude, newZone.longitude]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        {/* OpenStreetMap Tile Layer */}
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Handler for clicks */}
                        <LocationPicker onLocationSelect={handleLocationSelect} />

                        {/* Existing Safe Zones */}
                        {geofences.map((zone, idx) => (
                            <React.Fragment key={idx}>
                                <Circle
                                    center={[zone.latitude, zone.longitude]}
                                    radius={zone.radius}
                                    pathOptions={{ color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.2 }}
                                />
                                <Marker position={[zone.latitude, zone.longitude]} />
                            </React.Fragment>
                        ))}

                        {/* New Zone Preview (Blue) */}
                        <Circle
                            center={[newZone.latitude, newZone.longitude]}
                            radius={newZone.radius}
                            pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.2, dashArray: '5,5' }}
                        />
                        <Marker position={[newZone.latitude, newZone.longitude]} opacity={0.6} />
                    </MapContainer>

                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        background: 'rgba(255,255,255,0.9)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        zIndex: 400,
                        pointerEvents: 'none',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        Click map to set location
                    </div>
                </div>

                {/* Controls Section */}
                <div className="zone-controls" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                    {/* Add New Zone Form */}
                    <div className="add-zone-panel" style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px' }}>
                        <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={16} /> Define New Zone
                        </h4>

                        <div className="zone-form" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input
                                type="text"
                                placeholder="Zone Name (e.g. Home, School)"
                                value={newZone.name}
                                onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                                className="zone-input"
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                            />

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '11px', color: '#6b7280' }}>Radius (m)</label>
                                    <input
                                        type="number"
                                        value={newZone.radius}
                                        onChange={(e) => setNewZone({ ...newZone, radius: parseInt(e.target.value) })}
                                        className="zone-input"
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '11px', color: '#6b7280' }}>Coords</label>
                                    <input
                                        type="text"
                                        value={`${newZone.latitude.toFixed(4)}, ${newZone.longitude.toFixed(4)}`}
                                        readOnly
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#e5e7eb' }}
                                    />
                                </div>
                            </div>

                            <div className="time-range" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={14} />
                                <input
                                    type="time"
                                    value={newZone.startTime}
                                    onChange={(e) => setNewZone({ ...newZone, startTime: e.target.value })}
                                    style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '4px' }}
                                />
                                <span style={{ fontSize: '12px' }}>to</span>
                                <input
                                    type="time"
                                    value={newZone.endTime}
                                    onChange={(e) => setNewZone({ ...newZone, endTime: e.target.value })}
                                    style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '4px' }}
                                />
                            </div>

                            <button
                                className="btn-primary add-zone-btn"
                                onClick={handleAddZone}
                                disabled={saving}
                                style={{
                                    marginTop: '8px',
                                    padding: '10px',
                                    background: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                {saving ? 'Saving...' : 'Save Safe Zone'}
                            </button>
                        </div>
                    </div>

                    {/* Existing Zones List */}
                    <div className="zones-list-panel">
                        <h4 style={{ marginBottom: '12px' }}>Active Zones</h4>
                        <div className="zones-scroll" style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {geofences.length > 0 ? (
                                geofences.map((zone, idx) => (
                                    <div key={idx} className="zone-item-card" style={{
                                        background: 'white',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                                <MapPin size={14} color="#16a34a" />
                                                {zone.name}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                                                {zone.startTime} - {zone.endTime} • {zone.radius}m
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeZone(idx)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}
                                            title="Delete Zone"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="zones-empty" style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                                    <Navigation size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                                    <p style={{ fontSize: '13px' }}>No safe zones yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default LocationMap;
