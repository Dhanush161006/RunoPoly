import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Territory, GpsPoint } from '@/types';
import { USER_COLORS } from '@/constants';

interface MapViewProps {
  territories: Territory[];
  gpsPoints: GpsPoint[];
  isRunning: boolean;
  mapCenter: [number, number];
}

export function MapView({ territories, gpsPoints, isRunning, mapCenter }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const territoryLayerRef = useRef<L.LayerGroup | null>(null);
  const runLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: mapCenter,
      zoom: 15,
      zoomControl: true,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    territoryLayerRef.current = L.layerGroup().addTo(map);
    runLayerRef.current = L.layerGroup().addTo(map);

    setTimeout(() => map.invalidateSize(), 100);
  }, [mapCenter]);

  // Update territory polygons
  useEffect(() => {
    if (!territoryLayerRef.current || !mapRef.current) return;
    territoryLayerRef.current.clearLayers();

    for (const t of territories) {
      const color = USER_COLORS[t.colorIdx] || '#4F8EF7';
      const polygon = L.polygon(t.coords, {
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.25,
      });
      polygon.bindTooltip(`${t.owner}`, { sticky: true });
      polygon.addTo(territoryLayerRef.current);
    }
  }, [territories]);

  // Update run track
  useEffect(() => {
    if (!runLayerRef.current || !mapRef.current) return;
    runLayerRef.current.clearLayers();

    if (gpsPoints.length === 0) return;

    const latlngs = gpsPoints.map((p) => [p.lat, p.lng] as [number, number]);
    const line = L.polyline(latlngs, {
      color: '#1a1a2e',
      weight: 4,
      opacity: 0.7,
      dashArray: '6 4',
    });
    line.addTo(runLayerRef.current);

    if (gpsPoints.length > 0) {
      const last = gpsPoints[gpsPoints.length - 1];
      const marker = L.circleMarker([last.lat, last.lng], {
        radius: 6,
        color: '#fff',
        weight: 2,
        fillColor: '#1a1a2e',
        fillOpacity: 1,
      });
      marker.addTo(runLayerRef.current);
    }

    if (isRunning && gpsPoints.length > 1) {
      const bounds = L.latLngBounds(latlngs);
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
    }
  }, [gpsPoints, isRunning]);

  return <div ref={containerRef} className="map-container" />;
}
