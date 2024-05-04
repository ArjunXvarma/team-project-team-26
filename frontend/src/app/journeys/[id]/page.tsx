"use client";
import Link from "next/link";
import Cookie from "js-cookie";
import "leaflet/dist/leaflet.css";
import { API_URL } from "@/constants";
import { Loader } from "@mantine/core";
import { MdFlag, MdOutlineFileDownload } from "react-icons/md";
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
import { useTheme } from "@/components/theme-provider";

export default function Page({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { theme } = useTheme();
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
        <div className="flex flex-col justify-around md:flex-row w-full min-h-screen">
          <div className="md:w-2/3">
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
          </div>
          <div className="md:w-96 flex flex-col items-center">
            <div
              className={`w-full rounded-3xl flex flex-col p-8 m-4 md:mt-0 mt-4 h-fit ${
                theme == "dark" ? "gradient--dark-mode" : "gradient--light-mode"
              }`}
            >
              <Link href="#">
                <div
                  className={`flex items-center gap-3 p-5 rounded-3xl text-lg font-bold ${
                    theme == "dark" ? "bg-[#131B23] text-[#5FE996]" : "bg-white text-primary"
                  }`}
                >
                  <MdOutlineFileDownload size={36} />
                  <p>Download Your Data</p>
                </div>
              </Link>
            </div>
            <div
              className={`w-full rounded-3xl flex flex-col p-8 m-4 h-fit mt-5 ${
                theme == "dark" ? "gradient--dark-mode" : "gradient--light-mode"
              }`}
            >
              <div className="text-white">
                <div
                  className={`rounded-3xl py-2 px-2 ${
                    theme == "dark" ? "bg-[#131B23] border-2 border-[#5FE996]" : "bg-white"
                  }`}
                >
                  <div className="flex m-4">
                    <div
                      className={`p-4 rounded-xl  ${
                        theme == "dark" ? "bg-primary" : "gradient--light-mode"
                      }`}
                    >
                      {journey.type === "Walk" && <BsPersonWalking size={50} />}
                      {journey.type === "Run" && <RiRunFill size={50} />}
                      {journey.type === "Cycle" && <PiBicycleLight size={50} />}
                    </div>

                    <div className="flex flex-col ml-4">
                      <h1
                        className={`text-md font-bold ${
                          theme == "dark" ? "text-[#5FE996]" : "text-green-800"
                        }`}
                      >
                        {journey.name}
                      </h1>
                      <small
                        className={`-mt-1 ${
                          theme == "dark" ? "text-[#787878]" : "text-gray-700"
                        }`}
                      >
                        Distance Covered
                      </small>
                      <h1
                        className={`text-md font-bold ${
                          theme == "dark" ? "text-[#5FE996]" : "text-green-800"
                        }`}
                      >
                        {journey.totalDistance.toFixed(2)} m
                      </h1>
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-3xl py-2 px-2 mt-5 ${
                    theme == "dark" ? "bg-[#131B23] border-2 border-[#5FE996]" : "bg-white"
                  }`}
                >
                  <div className="flex m-4">
                    <div
                      className={`p-4 rounded-xl h-fit ${
                        theme == "dark" ? "bg-primary" : "gradient--light-mode"
                      }`}
                    >
                      <FaClock size={40} />
                    </div>

                    <div className="flex flex-col ml-4">
                      <h1
                        className={`text-md font-bold ${
                          theme == "dark" ? "text-[#5FE996]" : "text-green-800"
                        }`}
                      >
                        Time Taken
                      </h1>
                      <small
                        className={`-mt-1 ${
                          theme == "dark" ? "text-[#787878]" : "text-gray-700 "
                        }`}
                      >
                        Journey Duration
                      </small>

                      <div
                        className={` flex gap-3 text-md font-bold ${
                          theme == "dark" ? "text-[#5FE996]" : "text-green-800"
                        }`}
                      >
                        <p className="text-lg font-semibold">{journey.startTime}</p>|
                        <p className="text-lg font-semibold">{journey.endTime}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-3xl py-2 px-2 mt-5 ${
                    theme == "dark" ? "bg-[#131B23] border-2 border-[#5FE996]" : "bg-white"
                  }`}
                >
                  <div className="flex flex-col m-4">
                    <div className="flex gap-2">
                      <FaMountainSun
                        color={theme == "dark" ? "#5FE996" : "#0C4F40"}
                        size={26}
                      />
                      <p className={`${theme == "dark" ? "text-[#787878]" : "text-gray-700"}`}>
                        Average Elevation
                      </p>
                    </div>
                    <p
                      className={`text-xl font-semibold ml-14 ${
                        theme == "dark" ? "text-[#5FE996]" : "text-green-800"
                      }`}
                    >
                      {journey.elevation.avg.toFixed(2)} m
                    </p>
                    <div className="flex gap-2">
                      <MdFlag color={theme == "dark" ? "#5FE996" : "#0C4F40"} size={30} />
                      <p className={`${theme == "dark" ? "text-[#787878]" : "text-gray-700"}`}>
                        Highest Peak
                      </p>
                    </div>
                    <p
                      className={`text-xl font-semibold ml-14 ${
                        theme == "dark" ? "text-[#5FE996]" : "text-green-800"
                      }`}
                    >
                      {journey.elevation.max.toFixed(2)} m
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
