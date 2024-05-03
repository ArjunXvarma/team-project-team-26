"use client";
import Cookies from "js-cookie";
import { StatsData } from "@/types";
import { StatsData } from "@/types";
import { API_URL } from "@/constants";
import { BsFire } from "react-icons/bs";
import { Progress } from "@mantine/core";
import { Progress } from "@mantine/core";
import { FaRunning } from "react-icons/fa";
import { showErrorMessage } from "@/utils";
import { showErrorMessage } from "@/utils";
import { GiCycling } from "react-icons/gi";
import { LineChart } from "@mantine/charts";
import { LineChart } from "@mantine/charts";
import { useState, useEffect } from "react";
import { DonutChart } from "@mantine/charts";
import { DonutChart } from "@mantine/charts";
import { GiRunningShoe } from "react-icons/gi";
import { useTheme } from "@/components/theme-provider";
import { useTheme } from "@/components/theme-provider";

export default function Home() {
  const { theme } = useTheme();
  const { theme } = useTheme();
  const [data, setData] = useState<StatsData | null>(null);
  const [username, setUsername] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    statsData();
    setUsername(Cookies.get("username") as string);
    statsData();
    setUsername(Cookies.get("username") as string);
  }, []);

  const statsData = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(`${API_URL}/getStats`, {
        method: "GET",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });

      const dataResponse = await response.json();

      if (dataResponse.status == 200) {
        setData(dataResponse.data);
      } else {
        showErrorMessage("Error:", dataResponse.error);
      } else {
        showErrorMessage("Error:", dataResponse.error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const mappedJourneyData = data?.journeysData.map((journeyItem) => {
    const formattedDate = new Date(journeyItem.date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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
    { name: 'Lost', value: 400, color: '#1B5D44' },
    {  name: 'Maintanied', value: 600, color: '#E6E6E6' },
  ];

  const cyclingTarget = 40;
  const runningTarget = 30;
  const walkingTarget = 10;

  return (
    <main>
      <div
        className={`min-h-screen  ${theme == "dark" ? "bg-dk_background" : "bg-background"}`}
      >
        <div className="px-4 md:px-14 mb-20">
          <p
            className={`font-serif text-xl mt-6 ${
              theme == "dark" ? "text-white" : "text-black"
            }`}
          >
            Hi {username},
          </p>

          <div className="mt-8 flex flex-col md:flex-row gap-5 justify-between w-full">
            <div
              className={`text-white text-sm py-6 pr-6 w-full rounded-3xl ${
                theme == "dark"
                  ? "gradient--dark-mode border border-[#5FE996]"
                  : "gradient--light-mode"
              }`}
            >
              {mappedJourneyData?.length != 0 ? (
                <LineChart
                  data={mappedJourneyData ?? []}
                  h={450}
                  gridAxis="y"
                  dataKey="date"
                  tickLine="none"
                  strokeWidth={5}
                  curveType="bump"
                  className="min-w-80 min-"
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
    <main>
      <div
        className={`min-h-screen  ${theme == "dark" ? "bg-dk_background" : "bg-background"}`}
      >
        <div className="px-4 md:px-14 mb-20">
          <p
            className={`font-serif text-xl mt-6 ${
              theme == "dark" ? "text-white" : "text-black"
            }`}
          >
            Hi {username},
          </p>

          <div className="mt-8 flex flex-col md:flex-row gap-5 justify-between w-full">
            <div
              className={`text-white text-sm py-6 pr-6 w-full rounded-3xl ${
                theme == "dark"
                  ? "gradient--dark-mode border border-[#5FE996]"
                  : "gradient--light-mode"
              }`}
            >
              {mappedJourneyData?.length != 0 ? (
                <LineChart
                  data={mappedJourneyData ?? []}
                  h={450}
                  gridAxis="y"
                  dataKey="date"
                  tickLine="none"
                  strokeWidth={5}
                  curveType="bump"
                  className="min-w-80 min-"
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
                <DonutChart className="mt-4 -mb-20 h-40 w-80" size={160} thickness={42} data={weightLoss} startAngle={165} endAngle={15}  withTooltip tooltipDataSource="segment" mx="auto"/>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col md:flex-row justify-between gap-5 items-center p-5 md:px-20">
          <div className="flex flex-col justify-center items-center drop-shadow-sharp mb-4 w-full max-w-96">
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
                    ((data?.byModes?.cycle?.totalDistance ?? 0) / (cyclingTarget * 1000)) * 100
                  )}
                  %
                </small>
        <div className="flex w-full flex-col md:flex-row justify-between gap-5 items-center p-5 md:px-20">
          <div className="flex flex-col justify-center items-center drop-shadow-sharp mb-4 w-full max-w-96">
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
                    ((data?.byModes?.cycle?.totalDistance ?? 0) / (cyclingTarget * 1000)) * 100
                  )}
                  %
                </small>
              </div>
              <Progress
                radius="lg"
                className="w-full"
                color="rgba(39, 117, 83, 1)"
                value={Math.floor(
                  ((data?.byModes?.cycle?.totalDistance ?? 0) / (cyclingTarget * 1000)) * 100
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

          <div className="flex flex-col justify-center items-center drop-shadow-sharp mb-4 w-full max-w-96">
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
                    ((data?.byModes?.running?.totalDistance ?? 0) / (runningTarget * 1000)) *
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
                  ((data?.byModes?.running?.totalDistance ?? 0) / (runningTarget * 1000)) * 100
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

          <div className="flex flex-col justify-center items-center drop-shadow-sharp mb-4 w-full max-w-96">
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
                    ((data?.byModes?.walking?.totalDistance ?? 0) / (walkingTarget * 1000)) *
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
                  ((data?.byModes?.walking?.totalDistance ?? 0) / (walkingTarget * 1000)) * 100
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
              <Progress
                radius="lg"
                className="w-full"
                color="rgba(39, 117, 83, 1)"
                value={Math.floor(
                  ((data?.byModes?.cycle?.totalDistance ?? 0) / (cyclingTarget * 1000)) * 100
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

          <div className="flex flex-col justify-center items-center drop-shadow-sharp mb-4 w-full max-w-96">
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
                    ((data?.byModes?.running?.totalDistance ?? 0) / (runningTarget * 1000)) *
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
                  ((data?.byModes?.running?.totalDistance ?? 0) / (runningTarget * 1000)) * 100
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

          <div className="flex flex-col justify-center items-center drop-shadow-sharp mb-4 w-full max-w-96">
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
                    ((data?.byModes?.walking?.totalDistance ?? 0) / (walkingTarget * 1000)) *
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
                  ((data?.byModes?.walking?.totalDistance ?? 0) / (walkingTarget * 1000)) * 100
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
    </main>
        </div>
      </div>
    </main>
  );
}
