"use client";
import Cookie from "js-cookie";
import "leaflet/dist/leaflet.css";
import { API_URL } from "@/constants";
import { Loader } from "@mantine/core";
import { MdFlag } from "react-icons/md";
import { FaClock } from "react-icons/fa";
import { showErrorMessage } from "@/utils";
import { RiRunFill } from "react-icons/ri";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaMountainSun } from "react-icons/fa6";
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

    
  const gradient = {
    background: 'linear-gradient(#3B8B5D, #04372C)'
  };


  return (
    <main>
      {getJourneyLoading && (
        <div className="flex justify-center items-center gap-5 mt-10 py-10 mx-10 border-2 rounded-md border-slate-100 bg-slate-50 text-slate-400">
          <Loader size={32} color="gray" />
          <h2 className="text-xs md:text-lg">Loading your journeys</h2>
        </div>
      )}

      {journey && 
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

          <div className="md:w-96 rounded-3xl flex flex-col p-8 m-4" style={gradient}>

            <div className="text-white">

              <div className="bg-white rounded-3xl py-2 px-2">
                <div className="flex m-4">
                  <div className="p-4 rounded-xl" style={gradient}>
                    {journey.type === "Walk" && <BsPersonWalking size={50} />}
                    {journey.type === "Run" && <RiRunFill size={50} />}
                    {journey.type === "Cycle" && <PiBicycleLight size={50} />}
                  </div>

                  <div className="flex flex-col ml-4">
                    <h1 className="text-md text-green-800 font-bold">{journey.name}</h1>
                    <small className="text-gray-700 -mt-1">Distance Covered</small>
                    <h1 className="text-md text-green-800 font-bold">{journey.totalDistance.toFixed(2)} m</h1>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl py-2 px-2 mt-5">
                  <div className="flex m-4">
                    <div className="p-4 rounded-xl" style={gradient}>
                      <FaClock size={40}/>
                    </div>

                    <div className="flex flex-col ml-4">
                      <h1 className="text-md text-green-800 font-bold">Time Taken</h1>
                      <small className="text-gray-700 -mt-1">Time Taken to cover distance</small>

                      <div className="flex gap-2 text-green-800">
                        <p className="text-lg font-semibold">{journey.startTime}</p>|
                        <p className="text-lg font-semibold">{journey.endTime}</p>
                      </div>
                    </div>

                  </div>
              </div>

              <div className="bg-white rounded-3xl py-2 px-2  mt-5">
                <div className="flex flex-col m-4">
                  <div className="flex gap-2">
                    <FaMountainSun color="#0C4F40" size={26}/>
                    <p className="text-gray-600">Average Elevation</p>
                  </div>
                  <p className="text-xl text-green-800 font-semibold ml-14">{journey.elevation.avg.toFixed(2)} m</p>
                  <div className="flex gap-2">
                    <MdFlag color="#0C4F40" size={30}/>
                    <p className="text-gray-600">Highest Peak</p>
                  </div>
                  <p className="text-xl text-green-800 font-semibold ml-14">{journey.elevation.max.toFixed(2)} m</p>
                </div>
              </div>
            </div>
          
          </div>
        </div>
      }
    </main>
  );
}
