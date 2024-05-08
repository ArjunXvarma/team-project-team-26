"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

import { LatLngExpression, LatLngTuple } from "leaflet";
import { MapContainer, TileLayer, Polyline, Circle } from "react-leaflet";

interface MapProps {
  center: { lat: number; lng: number };
  tracks: { color: string; data: { lat: number; lon: number; ele: number }[] }[];
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
      {tracks.map(({ color, data }, i) => (
        <div key={i}>
          <Polyline
            pathOptions={{ color: color, weight: 5 }}
            positions={data.map((point) => [point.lat, point.lon])}
          />
          <Circle radius={0} weight={8} color="#c90028" center={[data[0].lat, data[0].lon]} />
          <Circle
            radius={0}
            weight={8}
            fill={true}
            color="#005dba"
            center={[data[data.length - 1].lat, data[data.length - 1].lon]}
          />
        </div>
      ))}
    </MapContainer>
  );
};

export default Map;
