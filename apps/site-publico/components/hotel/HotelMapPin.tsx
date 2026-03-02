"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export interface HotelMapPinProps {
  lat: number;
  lng: number;
  title?: string;
  className?: string;
}

export function HotelMapPin({ lat, lng, title, className = "" }: HotelMapPinProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    import("leaflet").then((L) => {
      if (!containerRef.current) return;
      const DefaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      const map = L.map(containerRef.current).setView([lat, lng], 15);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      const marker = L.marker([lat, lng]).addTo(map);
      if (title) marker.bindPopup(title).openPopup();
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, title]);

  return (
    <div
      ref={containerRef}
      className={`rounded-lg overflow-hidden border border-gray-200 ${className}`}
      style={{ height: 280, width: "100%", zIndex: 0 }}
    />
  );
}
