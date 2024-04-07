"use client";
import Cookie from "js-cookie";
import "leaflet/dist/leaflet.css";
import { API_URL } from "@/constants";
import { Loader } from "@mantine/core";
import { showErrorMessage } from "@/utils";
import { useEffect, useState } from "react";
import { RiRunFill } from "react-icons/ri";
import { useRouter } from "next/navigation";
import { FaRegClock } from "react-icons/fa6";
import { PiBicycleLight } from "react-icons/pi";
import { BsPersonWalking } from "react-icons/bs";
import { Polyline } from "react-leaflet/Polyline";
import { GetJourneyAPIResponse, Journey } from "@/types";
import { Circle, MapContainer, TileLayer } from "react-leaflet";

export default function Page({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [journey, setJourney] = useState<Journey>();
  const [getJourneyLoading, setGetJourneyLoading] = useState(true);

  const getJourney = async () => {
    setGetJourneyLoading(true);

    const token = Cookie.get("token");
    try {
      const response = await fetch(`${API_URL}/get_journeys_of_user`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      const journeyData: GetJourneyAPIResponse = await response.json();
      if (response.status === 404) {
        showErrorMessage("Error", journeyData.message!);
      } else {
        const data = journeyData.data!.find((val) => val.id.toString() === params.id);
        if (!data) {
          showErrorMessage("Error", "Journey does not exists");
          router.push("/journeys");
        } else {
          setJourney(data);
        }
      }
    } catch (error) {
      console.log(error);
      showErrorMessage(
        "Server Error",
        "There was a problem contacting the server. Please try again later."
      );
    }

    setGetJourneyLoading(false);
  };

  useEffect(() => {
    getJourney();
  }, []);

  return (
    <main>
      {getJourneyLoading && (
        <div className="flex justify-center items-center gap-5 mt-10 py-10 mx-10 border-2 rounded-md border-slate-100 bg-slate-50 text-slate-400">
          <Loader size={32} color="gray" />
          <h2 className="text-xs md:text-lg">Loading your journeys</h2>
        </div>
      )}

      {journey && (
        <div className="flex flex-col md:flex-row w-full h-screen">
          <MapContainer
            center={[
              journey.points[Math.ceil(journey.points.length / 2)].lat,
              journey.points[Math.ceil(journey.points.length / 2)].lon,
            ]}
            zoom={16}
            scrollWheelZoom={true}
            className="w-full h-screen"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline
              pathOptions={{ color: "#1B6D4B", weight: 5 }}
              positions={journey.points.map((point) => [point.lat, point.lon])}
            />
            <Circle
              radius={0}
              weight={8}
              color="#c90028"
              center={[journey.points[0].lat, journey.points[0].lon]}
            />
            <Circle
              radius={0}
              weight={8}
              fill={true}
              color="#005dba"
              center={[
                journey.points[journey.points.length - 1].lat,
                journey.points[journey.points.length - 1].lon,
              ]}
            />
          </MapContainer>
          <div className="md:w-96 h-screen flex flex-col justify-center items-center bg-primary text-white">
            <h1 className="text-3xl font-thin">{journey.name}</h1>
            <div className="mt-5">
              {journey.type === "Walk" && <BsPersonWalking size={64} />}
              {journey.type === "Run" && <RiRunFill size={64} />}
              {journey.type === "Cycle" && <PiBicycleLight size={64} />}
            </div>
            <div className="mt-5 flex items-center gap-3">
              <FaRegClock size={18} />
              <p className="text-lg font-semibold">{journey.startTime}</p>|
              <p className="text-lg font-semibold">{journey.endTime}</p>
            </div>
            <p className="text-2xl mt-8 font-black">{journey.totalDistance.toFixed(2)} m</p>
            <p className="text-md">Distance Covered</p>

            <p className="text-2xl mt-8 font-black">{journey.elevation.avg.toFixed(2)} m</p>
            <p className="text-md">Average Elevation </p>

            <p className="text-2xl mt-8 font-black">{journey.elevation.max.toFixed(2)} m</p>
            <p className="text-md">Highest Peak </p>
          </div>
        </div>
      )}
    </main>
  );
}
