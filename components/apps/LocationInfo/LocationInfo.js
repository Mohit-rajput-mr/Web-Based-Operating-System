import React, { useState, useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point, LineString } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Circle, Fill, Stroke, Icon, Text } from 'ol/style';
import Overlay from 'ol/Overlay';
import { defaults as defaultControls } from 'ol/control';
import { Search, MapPin, Compass, Navigation, Layers, ChevronDown, CornerUpLeft, Ruler, Target, Menu, AlertTriangle } from 'lucide-react';
import './LocationInfo.css';

const LocationInfo = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mapLayers, setMapLayers] = useState([
    { id: 'osm', name: 'Standard', active: true },
    { id: 'cycle', name: 'Cycle Map', active: false },
    { id: 'transport', name: 'Transport', active: false }
  ]);
  const [showLayers, setShowLayers] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);
  const [distance, setDistance] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);
  
  const mapRef = useRef(null);
  const mapElement = useRef(null);
  const overlayRef = useRef(null);
  const overlayElement = useRef(null);
  const markerLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const measureLayerRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!mapElement.current) return;

    const map = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      controls: defaultControls({ zoom: false, rotate: false }),
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2
      })
    });
    
    mapRef.current = map;

    const overlay = new Overlay({
      element: overlayElement.current,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -10]
    });
    
    map.addOverlay(overlay);
    overlayRef.current = overlay;

    const markerSource = new VectorSource();
    const markerLayer = new VectorLayer({
      source: markerSource,
      style: new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: '#3498db' }),
          stroke: new Stroke({ color: '#ffffff', width: 2 })
        })
      })
    });
    
    map.addLayer(markerLayer);
    markerLayerRef.current = markerSource;

    const routeSource = new VectorSource();
    const routeLayer = new VectorLayer({
      source: routeSource,
      style: new Style({
        stroke: new Stroke({
          color: '#2ecc71',
          width: 4,
          lineDash: [8, 4]
        })
      })
    });
    
    map.addLayer(routeLayer);
    routeLayerRef.current = routeSource;

    const measureSource = new VectorSource();
    const measureLayer = new VectorLayer({
      source: measureSource,
      style: function(feature) {
        if (feature.getGeometry().getType() === 'Point') {
          return new Style({
            image: new Circle({
              radius: 6,
              fill: new Fill({ color: '#e74c3c' }),
              stroke: new Stroke({ color: '#ffffff', width: 2 })
            })
          });
        } else {
          return new Style({
            stroke: new Stroke({
              color: '#e74c3c',
              width: 3,
              lineDash: [5, 5]
            }),
            text: new Text({
              text: feature.get('distance') ? feature.get('distance') + ' km' : '',
              font: '14px Arial',
              fill: new Fill({ color: '#ffffff' }),
              stroke: new Stroke({ color: '#000000', width: 3 }),
              offsetY: -15
            })
          });
        }
      }
    });
    
    map.addLayer(measureLayer);
    measureLayerRef.current = measureSource;

    map.on('click', function(evt) {
      if (measureMode) {
        const coords = toLonLat(evt.coordinate);
        addMeasurePoint(coords);
      } else {
        const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
          return feature;
        });
        
        if (feature) {
          const coordinates = feature.getGeometry().getCoordinates();
          const props = feature.getProperties();
          
          if (props.type === 'marker') {
            overlay.setPosition(coordinates);
            const popupContent = document.createElement('div');
            popupContent.innerHTML = `<strong>${props.title || 'Location'}</strong><br>${props.description || ''}`;
            overlayElement.current.innerHTML = '';
            overlayElement.current.appendChild(popupContent);
          }
        } else {
          overlay.setPosition(undefined);
        }
      }
    });

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      map.setTarget(null);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    
    mapRef.current.getLayers().getArray()
      .filter(layer => layer instanceof TileLayer)
      .forEach(layer => mapRef.current.removeLayer(layer));
    
    mapLayers.forEach(layerConfig => {
      if (layerConfig.active) {
        let source;
        
        switch(layerConfig.id) {
          case 'cycle':
            source = new OSM({
              url: 'https://{a-c}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png'
            });
            break;
          case 'transport':
            source = new OSM({
              url: 'https://{a-c}.tile.thunderforest.com/transport/{z}/{x}/{y}.png'
            });
            break;
          default:
            source = new OSM();
        }
        
        const layer = new TileLayer({ source });
        mapRef.current.getLayers().insertAt(0, layer);
      }
    });
  }, [mapLayers]);

  const requestLocationPermission = () => {
    setLoading(true);
    setError('');
    setPermissionRequested(true);
    
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };
    
    if (navigator.geolocation) {
      // First, get a single position
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handlePositionUpdate(pos);
          
          // Then set up continuous watching for better mobile experience
          watchIdRef.current = navigator.geolocation.watchPosition(
            handlePositionUpdate,
            handleLocationError,
            geoOptions
          );
        },
        handleLocationError,
        geoOptions
      );
    } else {
      setError('Geolocation not supported by your browser');
      setLoading(false);
    }
  };
  
  const handlePositionUpdate = (pos) => {
    const newLocation = { 
      lat: pos.coords.latitude, 
      lon: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      heading: pos.coords.heading,
      speed: pos.coords.speed,
      altitude: pos.coords.altitude,
      timestamp: new Date(pos.timestamp).toLocaleString()
    };
    
    setLocation(newLocation);
    
    if (mapRef.current) {
      // Clear previous user location markers
      if (markerLayerRef.current) {
        const userMarkers = markerLayerRef.current.getFeatures()
          .filter(f => f.get('isUserLocation'));
        
        userMarkers.forEach(marker => {
          markerLayerRef.current.removeFeature(marker);
        });
      }
      
      // Add new marker and animate to it
      const view = mapRef.current.getView();
      view.animate({
        center: fromLonLat([newLocation.lon, newLocation.lat]),
        zoom: 15,
        duration: 1000
      });
      
      addMarker(newLocation.lon, newLocation.lat, 'Current Location', 'Your position', true);
    }
    
    setLoading(false);
    
    // Get reverse geocoding info
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLocation.lat}&lon=${newLocation.lon}`)
      .then(response => response.json())
      .then(data => {
        setLocation(prevLoc => ({
          ...prevLoc,
          address: data.display_name
        }));
      })
      .catch(() => {
        // Silently fail on reverse geocoding error
      });
  };
  
  const handleLocationError = (err) => {
    let errorMsg = 'Failed to get your location';
    
    switch(err.code) {
      case 1:
        errorMsg = 'Location permission denied. Please enable location services for this website.';
        break;
      case 2:
        errorMsg = 'Location unavailable. Please try again.';
        break;
      case 3:
        errorMsg = 'Location request timed out. Please try again.';
        break;
    }
    
    setError(errorMsg);
    setLoading(false);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
      .then(response => response.json())
      .then(data => {
        setSearchResults(data);
        setIsSearching(false);
      })
      .catch(() => {
        setError("Search failed. Please try again.");
        setIsSearching(false);
      });
  };

  const addMarker = (lon, lat, title, description, isUserLocation = false) => {
    if (!markerLayerRef.current) return;
    
    const marker = new Feature({
      geometry: new Point(fromLonLat([lon, lat])),
      type: 'marker',
      title: title,
      description: description,
      isUserLocation: isUserLocation
    });
    
    // Use a special style for user location
    if (isUserLocation) {
      marker.setStyle(new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: '#565cf0' }),
          stroke: new Stroke({ color: '#ffffff', width: 2 })
        })
      }));
    }
    
    markerLayerRef.current.addFeature(marker);
  };

  const addDestination = (place) => {
    if (!location) {
      setError("Please enable location first to add destinations");
      return;
    }
    
    const newDestination = {
      id: Date.now(),
      name: place.display_name,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon)
    };
    
    setDestinations([...destinations, newDestination]);
    addMarker(newDestination.lon, newDestination.lat, newDestination.name, '');
    drawRoute(location, newDestination);
    
    if (mapRef.current) {
      const extent = routeLayerRef.current.getExtent();
      mapRef.current.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });
    }
    
    setShowSearch(false);
  };

  const drawRoute = (from, to) => {
    if (!routeLayerRef.current) return;
    
    const routeFeature = new Feature({
      geometry: new LineString([
        fromLonLat([from.lon, from.lat]),
        fromLonLat([to.lon, to.lat])
      ])
    });
    
    routeLayerRef.current.addFeature(routeFeature);
  };

  const addMeasurePoint = (coords) => {
    if (!measureLayerRef.current) return;
    
    const newPoints = [...measurePoints, {lon: coords[0], lat: coords[1]}];
    setMeasurePoints(newPoints);
    
    const pointFeature = new Feature({
      geometry: new Point(fromLonLat([coords[0], coords[1]]))
    });
    measureLayerRef.current.addFeature(pointFeature);
    
    if (newPoints.length >= 2) {
      const existingLines = measureLayerRef.current.getFeatures()
        .filter(f => f.getGeometry().getType() === 'LineString');
      existingLines.forEach(f => measureLayerRef.current.removeFeature(f));
      
      const lineCoords = newPoints.map(p => fromLonLat([p.lon, p.lat]));
      
      let totalDistance = 0;
      for (let i = 1; i < newPoints.length; i++) {
        totalDistance += calculateDistance(
          newPoints[i-1].lat, newPoints[i-1].lon,
          newPoints[i].lat, newPoints[i].lon
        );
      }
      setDistance(totalDistance.toFixed(2));
      
      const lineFeature = new Feature({
        geometry: new LineString(lineCoords),
        distance: totalDistance.toFixed(2)
      });
      measureLayerRef.current.addFeature(lineFeature);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const toggleLayer = (id) => {
    setMapLayers(layers => layers.map(layer => 
      layer.id === id 
        ? {...layer, active: !layer.active} 
        : layer
    ));
  };

  const resetMeasurement = () => {
    if (measureLayerRef.current) {
      measureLayerRef.current.clear();
    }
    setMeasurePoints([]);
    setDistance(null);
  };

  const clearMap = () => {
    if (routeLayerRef.current) {
      routeLayerRef.current.clear();
    }
    
    // Remove all markers except user location
    if (markerLayerRef.current) {
      const nonUserMarkers = markerLayerRef.current.getFeatures()
        .filter(f => !f.get('isUserLocation'));
      
      nonUserMarkers.forEach(marker => {
        markerLayerRef.current.removeFeature(marker);
      });
    }
    
    setDestinations([]);
  };

  return (
    <div className="locationinfo-container">
      <div className="locationinfo-header">
        <button className="menu-button" onClick={() => setShowSidebar(!showSidebar)}>
          <Menu size={20} />
        </button>
        <h2>Location Explorer</h2>
        <div className="toolbar">
          <button className="tool-button" onClick={() => setShowSearch(!showSearch)} title="Search">
            <Search size={16} />
          </button>
          <button className="tool-button" onClick={() => setShowLayers(!showLayers)} title="Map Layers">
            <Layers size={16} />
          </button>
          <button 
            className={`tool-button ${measureMode ? 'active' : ''}`} 
            onClick={() => {
              setMeasureMode(!measureMode);
              if (!measureMode) {
                resetMeasurement();
              }
            }} 
            title="Measure Distance"
          >
            <Ruler size={16} />
          </button>
          <button className="tool-button" onClick={clearMap} title="Clear Map">
            <CornerUpLeft size={16} />
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="search-panel">
          <div className="search-input">
            <input 
              type="text" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search location..."
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? '...' : <Search size={16} />}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((place, index) => (
                <div key={index} className="search-result" onClick={() => addDestination(place)}>
                  <MapPin size={14} />
                  <span>{place.display_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showLayers && (
        <div className="layers-panel">
          {mapLayers.map(layer => (
            <div key={layer.id} className="layer-option">
              <input 
                type="checkbox" 
                id={`layer-${layer.id}`} 
                checked={layer.active} 
                onChange={() => toggleLayer(layer.id)} 
              />
              <label htmlFor={`layer-${layer.id}`}>{layer.name}</label>
            </div>
          ))}
        </div>
      )}

      <div className={`sidebar ${showSidebar ? 'active' : ''}`}>
        <div className="sidebar-section">
          <h3>Current Location</h3>
          {error && <p className="error">{error}</p>}
          
          {!permissionRequested ? (
            <div className="location-permission">
              <p>Please enable location services to see your current position</p>
              <button className="location-button" onClick={requestLocationPermission}>
                <Target size={16} /> Enable Location
              </button>
            </div>
          ) : loading ? (
            <p>Fetching location...</p>
          ) : location ? (
            <div className="location-details">
              <p><strong>Lat:</strong> {location.lat.toFixed(6)}</p>
              <p><strong>Lon:</strong> {location.lon.toFixed(6)}</p>
              {location.accuracy && <p><strong>Accuracy:</strong> ±{location.accuracy.toFixed(1)}m</p>}
              {location.altitude && <p><strong>Altitude:</strong> {location.altitude.toFixed(1)}m</p>}
              {location.heading && <p><strong>Heading:</strong> {location.heading.toFixed(1)}°</p>}
              {location.speed && <p><strong>Speed:</strong> {location.speed.toFixed(1)}m/s</p>}
              {location.address && (
                <p className="address"><strong>Address:</strong> {location.address}</p>
              )}
            </div>
          ) : null}
        </div>

        {destinations.length > 0 && (
          <div className="sidebar-section">
            <h3>Destinations</h3>
            <div className="destinations-list">
              {destinations.map(dest => (
                <div key={dest.id} className="destination-item">
                  <MapPin size={14} />
                  <span>{dest.name.split(',')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {measureMode && (
          <div className="sidebar-section">
            <h3>Distance Measurement</h3>
            <p>Tap on the map to place points</p>
            {distance && (
              <p className="measurement-result">Total: <strong>{distance} km</strong></p>
            )}
            <button className="reset-button" onClick={resetMeasurement}>Reset Measurement</button>
          </div>
        )}
      </div>

      <div className="map-container" ref={mapElement}></div>
      
      <div className="map-popup" ref={overlayElement}></div>

      <div className="compass">
        <Compass size={30} />
      </div>

      {location && (
        <button className="center-button" onClick={() => {
          if (mapRef.current && location) {
            mapRef.current.getView().animate({
              center: fromLonLat([location.lon, location.lat]),
              zoom: 15,
              duration: 500
            });
          }
        }}>
          <Target size={20} />
        </button>
      )}
      
      {!permissionRequested && (
        <div className="location-prompt">
          <AlertTriangle size={20} />
          <p>Location access required</p>
          <button onClick={requestLocationPermission}>
            Enable Location
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationInfo;