"use client";
import Cookie from "js-cookie";
import Cookies from "js-cookie";
import "../../friends-styles.css";
import "leaflet/dist/leaflet.css";
import { StatsData } from "@/types";
import { API_URL } from "@/constants";
import { BsFire } from "react-icons/bs";
import { Progress } from "@mantine/core";
import { MdLogout } from "react-icons/md";
import { GiCycling } from "react-icons/gi";
import { IoIosLock } from "react-icons/io";
import { showErrorMessage } from "@/utils";
import { FaRunning } from "react-icons/fa";
import { LineChart } from "@mantine/charts";
import { DonutChart } from "@mantine/charts";
import { GiRunningShoe } from "react-icons/gi";
import React, { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Loader, SegmentedControl } from "@mantine/core";
import { FriendsJourneysAPIResponse, Journey } from "@/types";
import { MapContainer, TileLayer, Polyline, Circle } from "react-leaflet";

export default function FriendInfo({ params }: { params: { id: string; name: string } }) {
  const { theme } = useTheme();
  const [value, setValue] = useState<string>("journeys");
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [data, setData] = useState<StatsData | null>(null);
  const [getJourneyLoading, setGetJourneyLoading] = useState(true);
  const [legend, setLegend] = useState<{ color: string; name: String }[]>([]);

  const getRandomColor = () => {
    return "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
  };

  const [privacy, setPrivacy] = useState<boolean>(false);
  const friendEmail = decodeURIComponent(params.id);

  const getJourney = async () => {
    setGetJourneyLoading(true);
    const token = Cookie.get("token");
    try {
      const response = await fetch(`${API_URL}/get_friends_journey?friend=${friendEmail}`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });

      const friendsJourneys: FriendsJourneysAPIResponse = await response.json();
      if (friendsJourneys.status === "error") {
        if (response.status == 403) setPrivacy(true);
        else showErrorMessage("Error", friendsJourneys.message);
      } else if (response.status === 404) {
        showErrorMessage("Error", "Friends journeys are not available");
      } else {
        if (friendsJourneys.data.length === 0) {
          showErrorMessage("Error", "No journeys found");
        } else {
          setJourneys(friendsJourneys.data);
          setLegend(
            friendsJourneys.data.map((val, i) => {
              let color = getRandomColor();
              return { color: color, name: val.name };
            })
          );
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

  const friendStatsData = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(`${API_URL}/get_friends_stats?friend=${friendEmail}`, {
        method: "GET",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataResponse = await response.json();

      if (dataResponse.status == 200) {
        setData(dataResponse.data);
      } else if (response.status == 403) setPrivacy(true);
      else {
        showErrorMessage("Error:", dataResponse.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getJourney();
    friendStatsData();
  }, []);

  const name = decodeURIComponent(params.name);

  const mappedJourneyData = data?.journeysData.map((journeyItem) => {
    const formattedDate = new Date(journeyItem.date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return {
      date: formattedDate,
      totalDistance: Math.floor(Number(journeyItem.totalDistance) as number),
    };
  });

  const weightLoss = [
    { name: "Lost", value: 400, color: "#1B5D44" },
    { name: "Maintanied", value: 600, color: "#E6E6E6" },
  ];

  const cyclingTarget = 40;
  const runningTarget = 30;
  const walkingTarget = 10;

  return (
    <main>
      <div
        className={`min-h-screen ${theme == "dark" ? "bg-dk_background" : "bg-background"}`}
      >
        {privacy == false ? (
          <div>
            <div className="flex justify-center mt-6 -ml-4">
              <SegmentedControl
                value={value}
                size="md"
                color="rgba(55, 130, 82, 1)"
                className={`drop-shadow-sharp rounded-3xl font-bold ${
                  theme == "dark" ? "dark-segment" : "bg-white"
                }`}
                onChange={setValue}
                radius="xl"
                data={[
                  { label: "Journeys", value: "journeys" },
                  { label: "Statistics", value: "statistics" },
                ]}
              />
            </div>

            <div className="flex justify-center mt-2 ">
              {value == "journeys" ? (
                <div className="w-full h-full mb-5">
                  <div className="flex justify-center">
                    <div
                      className={`inline-block mt-8 rounded-xl p-3 drop-shadow-sharp ${
                        theme == "dark" ? "bg-[#1B2733]" : "bg-white"
                      }`}
                    >
                      <span
                        className={`text-xl text-ellipsis overflow-hidden ${
                          theme == "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        All of {name}&apos;s journeys
                      </span>
                    </div>
                  </div>

                  {getJourneyLoading ? (
                    <div className="flex justify-center items-center gap-5 mt-10 py-10 mx-10  text-slate-400">
                      <Loader size={32} color="gray" />
                      <h2 className="text-xs md:text-lg">Loading journeys</h2>
                    </div>
                  ) : (
                    <>
                      {" "}
                      {journeys && journeys.length > 0 ? (
                        <div className="w-full flex md:flex-row items-center md:items-start flex-col justify-center">
                          <div className="mt-3 h-1/2 md:w-2/3 w-full md:mx-3 mx-5">
                            <MapContainer
                              center={[
                                journeys[0].points[Math.ceil(journeys[0].points.length / 2)]
                                  .lat,
                                journeys[0].points[Math.ceil(journeys[0].points.length / 2)]
                                  .lon,
                              ]}
                              zoom={16}
                              scrollWheelZoom={true}
                              className="w-full h-[700px]"
                            >
                              <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              {journeys.map((journey, i) => (
                                <div key={i}>
                                  <Polyline
                                    pathOptions={{ color: legend[i].color, weight: 5 }}
                                    positions={journey.points.map((point) => [
                                      point.lat,
                                      point.lon,
                                    ])}
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
                                </div>
                              ))}
                            </MapContainer>
                          </div>
                          <div
                            className={`flex flex-col gap-3 rounded-2xl px-10 py-3 relative top-0 left-0 h-fit md:mt-0 mt-10 md:w-fit w-full ${
                              theme == "dark" ? "bg-[#1B2733] text-white" : "bg-white"
                            }`}
                          >
                            <h3
                              className={`font-semibold text-lg ${
                                theme == "dark" ? "text-[#5FE996]" : "text-black"
                              }`}
                            >
                              Legend
                            </h3>
                            {legend.map((val, i) => (
                              <div className="flex items-center gap-3" key={i}>
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: val.color }}
                                ></div>
                                <span>{val.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center items-center gap-5 mt-10 py-10 mx-10  text-slate-400">
                          <h2 className="text-xs md:text-lg">No Journeys Found</h2>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col justify-center w-full p-10">
                  <div className="flex justify-center">
                    <div
                      className={`inline-block mt-8 rounded-xl p-3 drop-shadow-sharp ${
                        theme == "dark" ? "bg-[#1B2733]" : "bg-white"
                      }`}
                    >
                      <span
                        className={`text-xl text-ellipsis overflow-hidden ${
                          theme == "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {name}&apos;s Statistics
                      </span>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-col md:flex-row gap-5 justify-evenly w-full">
                    <div
                      className={`text-white text-sm py-6 pr-6 w-full rounded-3xl ${
                        theme == "dark"
                          ? "gradient--dark-mode border border-[#5FE996]"
                          : "gradient--light-mode"
                      }`}
                    >
                      {mappedJourneyData?.length != 0 ? (
                        <LineChart
                          h={280}
                          gridAxis="y"
                          dataKey="date"
                          tickLine="none"
                          strokeWidth={5}
                          curveType="bump"
                          className="min-w-80"
                          data={mappedJourneyData ?? []}
                          series={[{ name: "totalDistance", color: "white" }]}
                          dotProps={{ r: 6, strokeWidth: 1, fill: "#5FE996" }}
                          activeDotProps={{ r: 8, strokeWidth: 4, stroke: "#5FE996" }}
                        />
                      ) : (
                        <div className="text-white font-bold text-xl flex justify-center items-center h-full">
                          No journeys taken yet
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-6 ">
                      <div
                        className={`flex gap-2 rounded-3xl p-6 min-w-80 ${
                          theme == "dark" ? "bg-[#1B2733]" : "bg-white drop-shadow-sharp"
                        }`}
                      >
                        <div
                          className={`flex justify-center items-center p-2 min-w-20 min-h-20 rounded-xl ${
                            theme == "dark"
                              ? "gradient--dark-mode drop-shadow-sharp"
                              : "gradient--light-mode border "
                          }`}
                        >
                          <BsFire size={30} color={"white"} />
                        </div>

                        <div className={`flex flex-col ml-4`}>
                          <span
                            className={`font-bold ${
                              theme == "dark" ? "text-[#5FE996]" : "text-green-800"
                            }`}
                          >
                            Calories
                          </span>
                          <small
                            className={`text-xs -mt-1  ${
                              theme == "dark" ? "text-white" : "text-gray-700"
                            }`}
                          >
                            Total burnt
                          </small>
                          <span
                            className={`font-bold  mt-4 ${
                              theme == "dark" ? "text-[#5FE996]" : "text-green-700"
                            }`}
                          >
                            {Math.floor(data?.totalCaloriesBurned ?? 0)} kcal
                          </span>
                        </div>
                      </div>

                      <div
                        className={`rounded-3xl p-6 flex flex-col items-center min-w-80 drop-shadow-sharp ${
                          theme == "dark" ? "bg-[#1B2733]" : "bg-white"
                        }`}
                      >
                        <span
                          className={`font-bold ${
                            theme == "dark" ? "text-[#5FE996]" : "text-green-800"
                          }`}
                        >
                          Weight Loss Goal
                        </span>
                        <small
                          className={`text-xs -mt-1  ${
                            theme == "dark" ? "text-white" : "text-gray-700"
                          }`}
                        >
                          20kg
                        </small>
                        <DonutChart
                          className="mt-4 -mb-20 h-40 w-80"
                          size={160}
                          thickness={42}
                          data={weightLoss}
                          startAngle={165}
                          endAngle={15}
                          withTooltip
                          tooltipDataSource="segment"
                          mx="auto"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-col flex-nowrap md:flex-row justify-between gap-5 items-center p-5 md:px-20">
                    <div className="flex flex-col justify-center items-center drop-shadow-sharp mb-4 w-full  max-w-96">
                      <div
                        className={`flex justify-center items-center p-2 rounded-xl min-w-20 min-h-20 -mb-8 z-10 ${
                          theme == "dark"
                            ? "gradient--dark-mode drop-shadow-sharp"
                            : "gradient--light-mode"
                        }`}
                      >
                        <GiCycling size={40} color={"white"} />
                      </div>

                      <div
                        className={` rounded-3xl flex flex-col items-center justify-center p-6 pt-8 gap-2 min-h-48 w-full ${
                          theme == "dark" ? "bg-[#1B2733]" : "bg-white drop-shadow-sharp"
                        }`}
                      >
                        <span
                          className={` font-bold text-xl ${
                            theme == "dark" ? "text-[#5FE996]" : "text-green-800"
                          }`}
                        >
                          Cycling
                        </span>
                        <div
                          className={`flex justify-between w-full ${
                            theme == "dark" ? "text-white" : "text-black"
                          }`}
                        >
                          <small className="">Progress:</small>
                          <small className="">
                            {Math.floor(
                              ((data?.byModes?.cycle?.totalDistance ?? 0) /
                                (cyclingTarget * 1000)) *
                                100
                            )}
                            %
                          </small>
                        </div>
                        <Progress
                          radius="lg"
                          className="w-full"
                          color="rgba(39, 117, 83, 1)"
                          value={Math.floor(
                            ((data?.byModes?.cycle?.totalDistance ?? 0) /
                              (cyclingTarget * 1000)) *
                              100
                          )}
                        />
                        <small
                          className={` self-start ${
                            theme == "dark" ? "text-[#787878]" : "text-gray-600"
                          }`}
                        >
                          Target: {cyclingTarget} Km
                        </small>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center items-center drop-shadow-sharp mb-4 w-full  max-w-96">
                      <div
                        className={`flex justify-center items-center p-2 rounded-xl min-w-20 min-h-20 -mb-8 z-10 ${
                          theme == "dark"
                            ? "gradient--dark-mode drop-shadow-sharp"
                            : "gradient--light-mode"
                        }`}
                      >
                        <FaRunning size={40} color={"white"} />
                      </div>

                      <div
                        className={`rounded-3xl flex flex-col items-center justify-center p-6 pt-8 gap-2 min-h-48 w-full ${
                          theme == "dark" ? "bg-[#1B2733]" : "bg-white drop-shadow-sharp"
                        }`}
                      >
                        <span
                          className={` font-bold text-xl ${
                            theme == "dark" ? "text-[#5FE996]" : "text-green-800"
                          }`}
                        >
                          Running
                        </span>
                        <div
                          className={`flex justify-between w-full ${
                            theme == "dark" ? "text-white" : "text-black"
                          }`}
                        >
                          <small className="">Progress:</small>
                          <small className="">
                            {Math.floor(
                              ((data?.byModes?.running?.totalDistance ?? 0) /
                                (runningTarget * 1000)) *
                                100
                            )}
                            %
                          </small>
                        </div>
                        <Progress
                          radius="lg"
                          className="w-full"
                          color="rgba(39, 117, 83, 1)"
                          value={Math.floor(
                            ((data?.byModes?.running?.totalDistance ?? 0) /
                              (runningTarget * 1000)) *
                              100
                          )}
                        />
                        <small
                          className={` self-start ${
                            theme == "dark" ? "text-[#787878]" : "text-gray-600"
                          }`}
                        >
                          Target: {runningTarget} Km
                        </small>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center items-center drop-shadow-sharp mb-4 w-full  max-w-96">
                      <div
                        className={`flex justify-center items-center p-2 rounded-xl min-w-20 min-h-20 -mb-8 z-10 ${
                          theme == "dark"
                            ? "gradient--dark-mode drop-shadow-sharp"
                            : "gradient--light-mode"
                        }`}
                      >
                        <GiRunningShoe size={40} color={"white"} />
                      </div>

                      <div
                        className={`rounded-3xl flex flex-col items-center justify-center p-6 pt-8 gap-2 min-h-48 w-full ${
                          theme == "dark" ? "bg-[#1B2733]" : "bg-white drop-shadow-sharp"
                        }`}
                      >
                        <span
                          className={` font-bold text-xl ${
                            theme == "dark" ? "text-[#5FE996]" : "text-green-800"
                          }`}
                        >
                          Walking
                        </span>
                        <div
                          className={`flex justify-between w-full ${
                            theme == "dark" ? "text-white" : "text-black"
                          }`}
                        >
                          <small className="">Progress:</small>
                          <small className="">
                            {Math.floor(
                              ((data?.byModes?.walking?.totalDistance ?? 0) /
                                (walkingTarget * 1000)) *
                                100
                            )}
                            %
                          </small>
                        </div>
                        <Progress
                          radius="lg"
                          className="w-full"
                          color="rgba(39, 117, 83, 1)"
                          value={Math.floor(
                            ((data?.byModes?.walking?.totalDistance ?? 0) /
                              (walkingTarget * 1000)) *
                              100
                          )}
                        />
                        <small
                          className={` self-start ${
                            theme == "dark" ? "text-[#787878]" : "text-gray-600"
                          }`}
                        >
                          Target: {walkingTarget} Km
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-20 mx-10 bg-white rounded-3xl drop-shadow-sharp">
            <div className="p-20 text-xl flex flex-col justify-center items-center">
              <p>Your friends Journeys and Statistics are private.</p>
              <IoIosLock className="mt-6" color="green" size={46} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
