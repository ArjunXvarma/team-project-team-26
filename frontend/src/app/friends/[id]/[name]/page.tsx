"use client";
import Link from "next/link";
import Cookie from "js-cookie";
import Cookies from "js-cookie";
import "leaflet/dist/leaflet.css";
import { API_URL } from "@/constants";
import { BsFire } from "react-icons/bs";
import { Progress } from '@mantine/core';
import { MdLogout } from "react-icons/md";
import { GiCycling } from "react-icons/gi";
import { IoIosLock } from "react-icons/io";
import { showErrorMessage } from "@/utils";
import { FaRunning } from "react-icons/fa";
import { LineChart } from '@mantine/charts';
import { DonutChart } from '@mantine/charts';
import { GiRunningShoe } from "react-icons/gi";
import { JourneyData, StatsData } from "@/types";
import { Polyline } from "react-leaflet/Polyline";
import React, { useEffect, useState } from "react";
import { Loader, SegmentedControl } from "@mantine/core";
import { FriendsJourneysAPIResponse, Journey } from "@/types";
import { Circle, MapContainer, TileLayer } from "react-leaflet";

export default function FriendInfo({ params }: { params: { id: string,  name: string } }) {

  const [value, setValue] = useState<string>("journeys");
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [getJourneyLoading, setGetJourneyLoading] = useState(true);

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
        if(response.status == 403 )
            setPrivacy(true);
        else
          showErrorMessage("Error", friendsJourneys.message);
      } 
       else if (response.status === 404) {
        showErrorMessage("Error", "Friends journeys are not available");
      } else {
        if (friendsJourneys.data.length === 0) {
          showErrorMessage("Error", "No journeys found");
        } else {
          setJourneys(friendsJourneys.data);
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

  const [data, setData] = useState<StatsData | null>(null);
  const [journey, setJourney] = useState<JourneyData[] | null>(null);
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
        setJourney(dataResponse.journeysData);
      }
      else if(response.status == 403 )
            setPrivacy(true);
      else {
        showErrorMessage("Error:", dataResponse.message );
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
    const formattedDate = new Date(journeyItem.date).toLocaleDateString('en-US', {  
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    return {
      date: formattedDate,
      totalDistance: Math.floor(Number(journeyItem.totalDistance) as number),
    };
  });

  const weightLoss = [
    { name: 'Lost Weight', value: 400, color: "teal.6" },
    { name: 'Maintained Weight', value: 600, color: 'blue' },
  ];
  const cyclingTarget = 40;
  const runningTarget = 30;
  const walkingTarget = 10;

  const gradient = {
    background: 'linear-gradient(#3B8B5D, #04372C)'
  };
  

  return (
    <main>
      <div className="min-h-screen bg-background">
        <header className="flex w-full h-20 justify-around items-center pt-6">
        <div className="flex w-full h-20 items-center px-5">
            <p className="text-center text-lg font-serif flex-grow  ml-24">
              “Every journey begins with a single step”
            </p>
            <Link href={"/logout"} prefetch={false} className="ml-auto flex items-center">
              <p className="text-xl font-semibold text-green-700 hover:text-green-900 mr-2">Logout</p>
              <MdLogout size={24} color="green" />
            </Link>
          </div> 
        </header>

      {privacy == false ? (
        <div>
        <div className="flex justify-center mt-6 -ml-4">
          <SegmentedControl
            value={value}
            size="md"
            className="bg-white drop-shadow-sharp rounded-3xl font-bold"
            color="rgba(55, 130, 82, 1)"
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
              <div className="w-full h-full mr-6 mb-5">
                <div className="flex justify-center">
                  <div className="inline-block mt-8 bg-white rounded-xl p-3 drop-shadow-sharp" >
                    <span className="text-xl text-ellipsis overflow-hidden">All of {name}&apos;s journeys</span>
                  </div>
                </div>

                {getJourneyLoading && (
                  <div className="flex justify-center items-center gap-5 mt-10 py-10 mx-10  text-slate-400">
                    <Loader size={32} color="gray" />
                    <h2 className="text-xs md:text-lg">Loading journeys</h2>
                  </div>
                )}
                {journeys && journeys.length > 0 ? (
                  <div className="mt-3 h-1/2">
                    <MapContainer
                      center={[
                        journeys[0].points[Math.ceil(journeys[0].points.length / 2)].lat,
                        journeys[0].points[Math.ceil(journeys[0].points.length / 2)].lon,
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
                            pathOptions={{ color: getRandomColor(), weight: 5 }}
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
                        </div>
                      ))}
                    </MapContainer>
                  </div>
                ) : (
                  <div className="flex justify-center items-center gap-5 mt-10 py-10 mx-10  text-slate-400">
                    <h2 className="text-xs md:text-lg">No Journeys Found</h2>
                  </div>
                )}
              </div>
              ) : (
                <div className="flex flex-col justify-center">

                  <div className="flex justify-center">
                    <div className="inline-block mt-8 bg-white rounded-xl p-3 drop-shadow-sharp" >
                      <span className="text-xl text-ellipsis overflow-hidden">{name}&apos;s Statistics</span>
                    </div>
                  </div>

                  <div className="w-full mt-8">
                    <div className="text-white min-w-60 text-sm mx-20 rounded-3xl" style={gradient}>
                      { mappedJourneyData?.length !=0 ?
                        (<LineChart
                          h={400}
                          data={mappedJourneyData ?? []}
                          dataKey="date"
                          dotProps={{ r:6, strokeWidth: 1, fill: '#5FE996' }}
                          activeDotProps={{ r: 8, strokeWidth:4, stroke: '#5FE996' }}
                          series={[
                            { name: 'totalDistance', color: 'white' }
                          ]}
                          className="p-6"
                          curveType="bump"
                          tickLine="none"
                          gridAxis="y"
                          strokeWidth={5}
                        />):
                        (<div className="text-white font-bold text-xl flex justify-center items-center h-full">No journeys taken yet</div>)
                      }
                    </div>
                  </div>
                  
                  <div className="mt-10 flex flex-col md:flex-row flex-wrap gap-10 justify-center items-center">
                    <div className="flex flex-col justify-center items-center drop-shadow-sharp mb-4">
                      <div className="flex justify-center items-center p-2 rounded-xl w-16 -mb-6 z-10" style={gradient}>
                          <GiCycling size={40} color={'white'} />
                        </div>
                      <div className="bg-white rounded-3xl flex flex-col items-center p-6 pt-12 gap-2">
                        <span className="text-green-800 font-bold">Cycling</span>
                        <div className="flex justify-between w-full">
                          <small className="">Progress:</small>
                          <small className="">{Math.floor(((data?.byModes?.cycle?.totalDistance ?? 0)/(cyclingTarget*1000))*100)}%</small>
                        </div>
                        <Progress color="rgba(39, 117, 83, 1)" value={Math.floor(((data?.byModes?.cycle?.totalDistance  ?? 0)/(cyclingTarget*1000))*100)} radius="lg" className="w-60"/>
                        <small className="text-gray-600 self-start">Target: {cyclingTarget}Km</small>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center items-center drop-shadow-sharp mb-4">
                      <div className="flex justify-center items-center p-2 rounded-xl w-16 -mb-6 z-10" style={gradient}>
                        <FaRunning size={40} color={'white'} />
                      </div>
                      <div className="bg-white rounded-3xl flex flex-col items-center p-6 pt-12 gap-2 ">
                        <span className="text-green-800 font-bold">Running</span>
                        <div className="flex justify-between w-full">
                          <small className="">Progress:</small>
                          <small className="">{Math.floor(((data?.byModes?.running?.totalDistance  ?? 0)/(runningTarget*1000))*100)}%</small>
                        </div>
                        <Progress color="rgba(39, 117, 83, 1)" value={Math.floor(((data?.byModes?.running?.totalDistance ?? 0)/(runningTarget*1000))*100)} radius="lg" className="w-60 "/>
                        <small className="text-gray-600 self-start">Target: {runningTarget}Km</small>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center items-center drop-shadow-sharp mb-4">
                      <div className="flex justify-center items-center p-2 rounded-xl w-16 -mb-6 z-10" style={gradient}>
                        <GiRunningShoe size={40} color={'white'} />
                      </div>
                      <div className="bg-white rounded-3xl flex flex-col items-center p-6 pt-12 gap-2 ">
                        <span className="text-green-800 font-bold">Walking</span>
                        <div className="flex justify-between w-full">
                          <small className="">Progress:</small>
                          <small className="">{Math.floor(((data?.byModes?.walking?.totalDistance ?? 0)/(walkingTarget*1000))*100)}%</small>
                        </div>
                        <Progress color="rgba(39, 117, 83, 1)" value={Math.floor(((data?.byModes?.walking?.totalDistance ?? 0)/(walkingTarget*1000))*100)} radius="lg" className="w-60"/>
                        <small className="text-gray-600 self-start">Target: {walkingTarget}Km</small>
                      </div>
                    </div>
                  </div>
                    
                  <div className="flex gap-6 mt-8 mb-10 md:flex-row justify-center items-center">
                      <div className="bg-white flex gap-2 rounded-3xl p-6 min-w-80 drop-shadow-sharp">
                        <div className="flex justify-center items-center p-2 rounded-xl " style={gradient}>
                          <BsFire size={30} color={'white'} />
                        </div>
                        <div className="flex flex-col ml-4 ">
                          <span className="text-green-800 font-bold">Calories</span>
                          <small className="text-xs -mt-1 text-gray-700">Total burnt</small>
                          <span className="font-bold text-green-700 mt-4">{Math.floor(data?.totalCaloriesBurned ?? 0)} kcal</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-3xl p-6 flex flex-col items-center min-w-80 drop-shadow-sharp">
                        <span className="text-green-800 font-bold">Weight Loss Goal</span>
                        <small className="text-gray-700">20kg</small>
                        <DonutChart className="h-8 w-8" data={weightLoss} startAngle={170} endAngle={10} /> 
                      </div>
                  </div>

                </div>
            )}
        </div>
        </div>
      ):(
        <div className="mt-20 mx-10 bg-white rounded-3xl drop-shadow-sharp">
          <div className="p-20 text-xl flex flex-col justify-center items-center">
            <p>Your friends Journeys and Statistics are private.</p>
            <IoIosLock className="mt-6" color="green" size={46}/>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}
