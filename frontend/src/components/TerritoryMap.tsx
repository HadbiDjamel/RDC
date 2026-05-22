import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface Zone {
    id: string;
    name: string;
    color: string;
    polygons: [number, number][][]; // multiple disconnected shapes per zone
}

export interface StatPoint {
    wilayaId: string;
    name: string;
    lat: number;
    lng: number;
    value: number;
}

interface TerritoryMapProps {
    zones: Zone[];
    drawingPoints: [number, number][];
    isDrawing: boolean;
    onMapClick: (lat: number, lng: number) => void;
    showStats: boolean;
    statsData: StatPoint[];
}

const ALGERIA_CENTER: [number, number] = [28.5, 2.5];

const TerritoryMap: React.FC<TerritoryMapProps> = ({
    zones,
    drawingPoints,
    isDrawing,
    onMapClick,
    showStats,
    statsData,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const zonesLayer = useRef<L.LayerGroup | null>(null);
    const drawLayer = useRef<L.LayerGroup | null>(null);
    const statsLayer = useRef<L.LayerGroup | null>(null);

    const onMapClickRef = useRef(onMapClick);
    useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // Ensure Leaflet assets are correctly pathed (sometimes needed in some build environments)
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        const map = L.map(containerRef.current, {
            center: ALGERIA_CENTER,
            zoom: 5, // Back to integer zoom for better tile loading
            zoomControl: false,
            doubleClickZoom: false,
            scrollWheelZoom: true,
        });

        // Use standard OSM tiles first to verify visibility, then switch back to clean light tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '© OSM © CARTO',
            subdomains: 'abcd',
            maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Subtler Wilaya boundaries - using a more reliable mirror
        fetch('https://raw.githubusercontent.com/creativetimofficial/argon-dashboard-pro-angular/master/src/assets/json/algeria.json')
            .then(r => {
                if (!r.ok) throw new Error('GeoJSON not found');
                return r.json();
            })
            .then(data => {
                L.geoJSON(data as GeoJSON.GeoJsonObject, {
                    style: {
                        color: 'rgba(30, 41, 59, 0.12)',
                        weight: 1,
                        fillOpacity: 0.02,
                        fillColor: '#64748b'
                    },
                }).addTo(map);
            })
            .catch(() => {
                console.warn("Wilaya boundaries could not be loaded. Map will function without overlays.");
            });

        zonesLayer.current = L.layerGroup().addTo(map);
        drawLayer.current = L.layerGroup().addTo(map);
        statsLayer.current = L.layerGroup().addTo(map);

        map.on('click', (e: L.LeafletMouseEvent) => {
            onMapClickRef.current(e.latlng.lat, e.latlng.lng);
        });

        mapRef.current = map;

        // Force a resize check to fix "blank map" issues in flex containers
        setTimeout(() => map.invalidateSize(), 100);

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        const container = mapRef.current?.getContainer();
        if (container) container.style.cursor = isDrawing ? 'crosshair' : '';
    }, [isDrawing]);

    // Update drawing layer
    useEffect(() => {
        const layer = drawLayer.current;
        if (!layer) return;
        layer.clearLayers();
        if (drawingPoints.length === 0) return;

        drawingPoints.forEach((pt, i) => {
            L.circleMarker(pt, {
                radius: i === 0 ? 10 : 6,
                color: '#2563eb',
                fillColor: '#ffffff',
                fillOpacity: 1,
                weight: 3,
                interactive: false,
            } as L.CircleMarkerOptions).addTo(layer);
        });

        if (drawingPoints.length > 1) {
            L.polyline(drawingPoints, {
                color: '#2563eb', weight: 3, dashArray: '10,10', opacity: 1, interactive: false,
            }).addTo(layer);
        }
    }, [drawingPoints]);

    useEffect(() => {
        const layer = zonesLayer.current;
        if (!layer) return;
        layer.clearLayers();
        zones.forEach(zone => {
            (zone.polygons || []).forEach(poly => {
                if (poly.length < 3) return;
                L.polygon(poly, {
                    color: zone.color,
                    weight: 3,
                    fillColor: zone.color,
                    fillOpacity: 0.25,
                }).bindTooltip(`<b>${zone.name}</b>`, { sticky: true }).addTo(layer);
            });
        });
    }, [zones]);

    useEffect(() => {
        const layer = statsLayer.current;
        if (!layer) return;
        layer.clearLayers();
        if (!showStats || statsData.length === 0) return;

        const vals = statsData.map(s => s.value);
        const maxVal = Math.max(...vals);
        const minVal = Math.min(...vals);
        const range = maxVal - minVal || 1;

        statsData.forEach(stat => {
            const norm = (stat.value - minVal) / range;
            const radius = 6 + norm * 18;
            const opacity = 0.3 + norm * 0.5;
            
            L.circleMarker([stat.lat, stat.lng] as [number, number], {
                radius,
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: opacity,
                weight: 1.5,
                opacity: 0.8,
            } as L.CircleMarkerOptions)
                .bindTooltip(
                    `<b>${stat.name}</b><br/>Cas: ${stat.value}`,
                    { sticky: true }
                )
                .addTo(layer);
        });
    }, [showStats, statsData]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full"
            style={{ minHeight: '600px', backgroundColor: '#f8fafc' }}
        />
    );
};

export default TerritoryMap;
