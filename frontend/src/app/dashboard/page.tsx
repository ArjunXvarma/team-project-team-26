"use client";
import Link from "next/link";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { BsFire } from "react-icons/bs";
import { DonutChart } from '@mantine/charts';
import { LineChart } from '@mantine/charts';
import { showErrorMessage, showSuccessMessage } from "@/utils";
import { FaRunning } from "react-icons/fa";
import { GiCycling } from "react-icons/gi";
import { API_URL } from "@/constants";
import { GiRunningShoe } from "react-icons/gi";
import { Progress } from '@mantine/core';



export default function Home() {

  interface StatsData {
    byModes: {
      cycle: {
        totalCaloriesBurned: number;
        totalDistance: number;
        totalTimeWorkingOutHours: number;
        totalTimeWorkingOutMinutes: number;
        totalTimeWorkingOutSeconds: number;
      };
      running: {
        totalCaloriesBurned: number;
        totalDistance: number;
        totalTimeWorkingOutHours: number;
        totalTimeWorkingOutMinutes: number;
        totalTimeWorkingOutSeconds: number;};
      walking:{
        totalCaloriesBurned: number;
        totalDistance: number;
        totalTimeWorkingOutHours: number;
        totalTimeWorkingOutMinutes: number;
        totalTimeWorkingOutSeconds: number;};
    };
    journeysData: JourneyData[]; 
    totalCaloriesBurned: number;
    totalDistanceCombined: number;
    totalTimeWorkingOutHours: number;
    totalTimeWorkingOutMinutes: number;
    totalTimeWorkingOutSeconds: number;
  }
  
  interface JourneyData {
    averageSpeed: number;
    date: number;
    caloriesBurned: number;
    hours_taken: number;
    journeyId: number;
    minutes_taken: number;
    mode: string;
    seconds_taken: number;
    totalDistance: number;
  }

  const [data, setData] = useState<StatsData | null>(null);
  const [journey, setJourney] = useState<JourneyData[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      await statsData();
    };

    fetchData();
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
        setJourney(dataResponse.journeysData);
      }
      else {
        showErrorMessage("Error:", dataResponse.error );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [username, __] = useState(Cookies.get("username"));
  const gradient = {
    background: 'linear-gradient(#3B8B5D, #04372C)'
  };

  const mappedJourneyData = data?.journeysData.map((journeyItem) => ({
    date: new Date(journeyItem.date).toLocaleDateString('en-US', {  
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    totalDistance: Math.floor(Number(journeyItem.totalDistance) as number),
  }));


  const weightLoss = [
    { name: 'USA', value: 400, color: 'indigo.6' },
    { name: 'India', value: 600, color: 'yellow.6' },
  ];

  const cyclingTarget = 40;
  const runningTarget = 10;
  const walkingTarget = 20;


  return (
      <main>
        <div className="w-full h-screen bg-#F1F1F1">
          <div className="flex w-full h-20 justify-around items-center pt-6 px-5">
            <p className="text-center text-lg font-serif flex-grow">
              “Every journey begins with a single step”
            </p>
          </div>  
              
          <div className="px-16 mb-20">
            <p className="font-serif text-xl mt-8 ">Hi {username},</p>
            
            <div className="mt-8 flex gap-4 justify-around w-full">

              <div className="text-white text-sm py-6 pr-6 rounded-3xl w-1/2" style={gradient}>
                <LineChart
                  h={300}
                  data={mappedJourneyData ?? []}
                  dataKey="date"
                  dotProps={{ r:6, strokeWidth: 1, fill: '#5FE996' }}
                  activeDotProps={{ r: 8, strokeWidth:4, stroke: '#5FE996' }}
                  // withTooltip={false}
                  series={[
                    { name: 'totalDistance', color: 'white' }
                  ]}
                  
                  curveType="bump"
                  tickLine="none"
                  gridAxis="y"
                  strokeWidth={5}
                />
              </div>
                  
              <div className="flex flex-col justify-around">
                  <div className="bg-white flex gap-2 rounded-3xl p-6 min-w-72 drop-shadow-sharp">
                    <div className="flex justify-center items-center p-2 rounded-xl " style={gradient}>
                      <BsFire size={30} color={'white'} />
                    </div>

                    <div className="flex flex-col ml-4 ">
                      <span className="text-green-800 font-bold">Calories</span>
                      <small className="text-xs -mt-1 text-gray-700">Total burnt</small>
                      <span className="font-bold text-green-700 mt-4">{Math.floor(data?.totalCaloriesBurned ?? 0)} kcal</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6 flex flex-col items-center min-w-72 drop-shadow-sharp">
                    <span className="text-green-800 font-bold">Weight Loss Goal</span>
                    <small className="text-gray-700">20kg</small>
                    <DonutChart data={weightLoss} size={117} thickness={30} startAngle={170} endAngle={10} /> 
                  </div>
              </div>
            </div>

            <div className="mt-10 flex justify-around items-center">
              
              <div className="flex flex-col justify-center items-center drop-shadow-sharp">
                <div className="flex justify-center items-center p-2 rounded-xl w-16 -mb-6 z-10" style={gradient}>
                    <GiCycling size={40} color={'white'} />
                  </div>
                <div className="bg-white rounded-3xl flex flex-col items-center p-6 pt-8 gap-2 min-w-72">
                  <span className="text-green-800 font-bold">Cycling</span>
                  <div className="flex justify-between w-full">
                    <small className="">Progress:</small>
                    <small className="">{Math.floor(((data?.byModes?.cycle.totalDistance  ?? 0)/(cyclingTarget*1000))*100)}%</small>
                  </div>
                  <Progress color="rgba(39, 117, 83, 1)" value={Math.floor(((data?.byModes?.cycle.totalDistance  ?? 0)/(cyclingTarget*1000))*100)} radius="lg" className="w-60"/>
                  <small className="text-gray-600 self-start">Target: {cyclingTarget}Km</small>
                </div>
              </div>

              <div className="flex flex-col justify-center items-center drop-shadow-sharp">
                <div className="flex justify-center items-center p-2 rounded-xl w-16 -mb-6 z-10" style={gradient}>
                  <FaRunning size={40} color={'white'} />
                </div>
                <div className="bg-white rounded-3xl flex flex-col items-center p-6 pt-8 gap-2 min-w-72">
                  <span className="text-green-800 font-bold">Running</span>
                  <div className="flex justify-between w-full">
                    <small className="">Progress:</small>
                    <small className="">{Math.floor(((data?.byModes?.running.totalDistance  ?? 0)/(runningTarget*1000))*100)}%</small>
                  </div>
                  <Progress color="rgba(39, 117, 83, 1)" value={Math.floor(((data?.byModes?.running.totalDistance ?? 0)/(runningTarget*1000))*100)} radius="lg" className="w-60"/>
                  <small className="text-gray-600 self-start">Target: {runningTarget}Km</small>
                </div>
              </div>
              
              <div className="flex flex-col justify-center items-center drop-shadow-sharp">
                <div className="flex justify-center items-center p-2 rounded-xl w-16 -mb-6 z-10" style={gradient}>
                  <GiRunningShoe size={40} color={'white'} />
                </div>
                <div className="bg-white rounded-3xl flex flex-col items-center p-6 pt-8 gap-2 min-w-72">
                  <span className="text-green-800 font-bold">Walking</span>
                  <div className="flex justify-between w-full">
                    <small className="">Progress:</small>
                    <small className="">{Math.floor(((data?.byModes?.walking.totalDistance ?? 0)/(walkingTarget*1000))*100)}%</small>
                  </div>
                  <Progress color="rgba(39, 117, 83, 1)" value={Math.floor(((data?.byModes?.walking.totalDistance ?? 0)/(walkingTarget*1000))*100)} radius="lg" className="w-60"/>
                  <small className="text-gray-600 self-start">Target: {walkingTarget}Km</small>
                </div>
              </div>

            </div>
                  
          </div>
        </div>
      </main>
  );
}
