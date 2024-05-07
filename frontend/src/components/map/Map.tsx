"use client";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from "react-leaflet";
import { LatLngExpression, LatLngTuple } from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

interface MapProps {
  center: LatLngExpression | LatLngTuple;
  tracks: { lat: number; lon: number; ele: number }[][];
}

const Map = ({ center, tracks }: MapProps) => {
  return (
    <MapContainer
      zoom={16}
      center={center}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {tracks.map((track, i) => (
        <>
          <Polyline
            pathOptions={{ color: "#1B6D4B", weight: 5 }}
            positions={track.map((point) => [point.lat, point.lon])}
          />
          <Circle
            radius={0}
            weight={8}
            color="#c90028"
            center={[track[0].lat, track[0].lon]}
          />
          <Circle
            radius={0}
            weight={8}
            fill={true}
            color="#005dba"
            center={[track[track.length - 1].lat, track[track.length - 1].lon]}
          />
        </>
      ))}
    </MapContainer>
  );
};

export default Map;
