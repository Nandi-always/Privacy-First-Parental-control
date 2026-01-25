import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, RefreshCw, AlertCircle, Save, Navigation, Flag, Shield, Plus, Clock, Trash2, Search } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, Circle, Autocomplete } from '@react-google-maps/api';
import { locationService } from '../services/apiService';
import MAP_CONFIG from '../config/mapsConfig';
import '../styles/Cards.css';

const LocationMap = ({ child }) => {
    const { isLoaded } = useJsApiLoader(MAP_CONFIG);
    const isMapKeyPlaceholder = MAP_CONFIG.isPlaceholder;

    const [autocomplete, setAutocomplete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [geofences, setGeofences] = useState([]);
    const [newZone, setNewZone] = useState({
        name: '',
        latitude: 12.9716,
        longitude: 77.5946,
        radius: 200,
        startTime: '08:00',
        endTime: '15:00'
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const fetchGeofences = useCallback(async () => {
        if (!child?._id && !child?.id) return;

        try {
            setLoading(true);
            const childId = child._id || child.id;
            const res = await locationService.getAll ? await locationService.getAll() : { data: child };
            const geofenceData = res.data?.geofences || child.geofences || [];
            setGeofences(geofenceData);
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

    const handleMapClick = (e) => {
        setNewZone(prev => ({
            ...prev,
            latitude: e.latLng.lat(),
            longitude: e.latLng.lng()
        }));
    };

    const handleAddZone = async () => {
        if (!newZone.name) {
            alert("Please give the zone a name (e.g., School)");
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
            setNewZone({ ...newZone, name: '', latitude: 12.9716, longitude: 77.5946, radius: 200 });
            alert('Safe zone added successfully!');
        } catch (err) {
            console.error('Failed to save zone', err);
            setError('Failed to add safe zone');
        } finally {
            setSaving(false);
        }
    };

    const removeZone = async (index) => {
        try {
            const updatedZones = geofences.filter((_, i) => i !== index);
            const childId = child._id || child.id;
            await locationService.updateGeofence({ childId, geofence: updatedZones });
            setGeofences(updatedZones);
        } catch (err) {
            setError('Failed to remove zone');
        }
    };

    const onAutocompleteLoad = (autocompleteInstance) => {
        setAutocomplete(autocompleteInstance);
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                setNewZone(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng,
                    address: place.formatted_address
                }));
            }
        }
    };

    return (
        <div className="card location-map-privacy">
            <div className="card-header">
                <div className="card-title-group">
                    <Shield size={20} className="card-icon" />
                    <h3>Privacy-First Safe Zones</h3>
                </div>
                <p className="privacy-mode-badge">Event Tracking Only</p>
            </div>

            <div className="privacy-disclaimer">
                <AlertCircle size={16} />
                <p>Live tracking and maps are hidden for privacy. You will receive alerts only when <strong>{child?.name}</strong> enters or leaves these areas.</p>
            </div>

            {error && (
                <div className="error-message">
                    <AlertCircle size={16} />
                    <p>{error}</p>
                </div>
            )}

            {loading && <p className="loading-text">⏳ Loading safe zones...</p>}

            <div className="geofence-setup-grid">
                <div className="zones-list-panel">
                    <h4>Configured Safe Zones</h4>
                    <div className="zones-scroll">
                        {geofences.length > 0 ? (
                            geofences.map((zone, idx) => (
                                <div key={idx} className="zone-item-card">
                                    <div className="zone-header">
                                        <div className="zone-title">
                                            <MapPin size={16} />
                                            <strong>{zone.name}</strong>
                                        </div>
                                        <button className="delete-zone-btn" onClick={() => removeZone(idx)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="zone-meta">
                                        <span>Radius: {zone.radius}m</span>
                                        <div className="zone-hours">
                                            <Clock size={12} />
                                            <span>{zone.startTime} - {zone.endTime}</span>
                                        </div>
                                    </div>
                                    <div className="zone-status">
                                        Last Event: <span className={`status-text ${zone.lastStatus}`}>{zone.lastStatus}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="zones-empty">
                                <Navigation size={32} />
                                <p>No safe zones configured yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="add-zone-panel">
                    <h4>Define New Safe Zone</h4>
                    <div className="zone-form">
                        <input
                            type="text"
                            placeholder="Zone Name (e.g. School)"
                            value={newZone.name}
                            onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                            className="zone-input"
                        />

                        <div className="search-box-panel">
                            <p className="hint-text">Search for an address:</p>
                            {isLoaded && (
                                <Autocomplete
                                    onLoad={onAutocompleteLoad}
                                    onPlaceChanged={onPlaceChanged}
                                >
                                    <div className="search-input-wrapper">
                                        <Search size={16} />
                                        <input
                                            type="text"
                                            placeholder="Enter address..."
                                            className="address-search-input"
                                        />
                                    </div>
                                </Autocomplete>
                            )}
                        </div>

                        <div className="time-range">
                            <input
                                type="time"
                                value={newZone.startTime}
                                onChange={(e) => setNewZone({ ...newZone, startTime: e.target.value })}
                            />
                            <span>to</span>
                            <input
                                type="time"
                                value={newZone.endTime}
                                onChange={(e) => setNewZone({ ...newZone, endTime: e.target.value })}
                            />
                        </div>

                        <div className="manual-config-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                            <p className="hint-text"><strong>Manual Override:</strong> Set coordinates and range without map</p>
                            <div className="coord-inputs-v2" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <small>Latitude</small>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={newZone.latitude}
                                        onChange={(e) => setNewZone({ ...newZone, latitude: parseFloat(e.target.value) })}
                                        className="zone-input"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <small>Longitude</small>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={newZone.longitude}
                                        onChange={(e) => setNewZone({ ...newZone, longitude: parseFloat(e.target.value) })}
                                        className="zone-input"
                                    />
                                </div>
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                <small>Range / Radius (meters)</small>
                                <input
                                    type="number"
                                    value={newZone.radius}
                                    onChange={(e) => setNewZone({ ...newZone, radius: parseInt(e.target.value) })}
                                    className="zone-input"
                                    placeholder="e.g. 200"
                                />
                            </div>
                        </div>

                        <p className="hint-text">Or click on the map to set location center:</p>
                        <div className="mini-map-container" style={{ height: '200px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '10px' }}>
                            {isLoaded && !isMapKeyPlaceholder ? (
                                <GoogleMap
                                    mapContainerStyle={{ width: '100%', height: '100%' }}
                                    center={{ lat: newZone.latitude, lng: newZone.longitude }}
                                    zoom={14}
                                    onClick={handleMapClick}
                                >
                                    <Marker position={{ lat: newZone.latitude, lng: newZone.longitude }} />
                                    <Circle
                                        center={{ lat: newZone.latitude, lng: newZone.longitude }}
                                        radius={newZone.radius}
                                        options={{ fillColor: '#2563eb', fillOpacity: 0.1, strokeColor: '#2563eb', strokeWeight: 1 }}
                                    />
                                </GoogleMap>
                            ) : (
                                <div className="map-placeholder" style={{
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#f3f4f6',
                                    color: '#6b7280',
                                    textAlign: 'center',
                                    padding: '20px'
                                }}>
                                    <div>
                                        <MapPin size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                        <p>Map disabled: No valid API key found.</p>
                                        <p style={{ fontSize: '11px' }}>Check .env file for REACT_APP_GOOGLE_MAPS_API_KEY</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            className="btn-primary add-zone-btn"
                            onClick={handleAddZone}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : <><Plus size={16} /> Add Safe Zone</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationMap;
