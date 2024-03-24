"use client";
import Cookie from "js-cookie";
import React, { useEffect, useState } from "react";
import { Loader, SegmentedControl } from "@mantine/core";
import { API_URL } from "@/constants";
import { FriendsJourneysAPIResponse, Journey } from "@/types";
import { showErrorMessage } from "@/utils";

export default function FriendInfo({ params }: { params: { id: string } }) {
  const [value, setValue] = useState<string>("journeys");
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [getJourneyLoading, setGetJourneyLoading] = useState(true);

  const getJourney = async () => {
    setGetJourneyLoading(true);

    const token = Cookie.get("token");
    try {
      const response = await fetch(`${API_URL}//get_friends_journey?friend=${params.id}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      const friendsJourneys: FriendsJourneysAPIResponse = await response.json();
      if (response.status === 404) {
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

  useEffect(() => {
    getJourney();
  }, []);

  return (
    <main className="w-screen h-screen">
      <div className="w-full h-full">
        <header className="flex w-full h-20 justify-around items-center mt-6 ">
          <div className="flex flex-col w-full flex-grow">
            <p className="text-center text-3xl font-serif "></p>
            <p className="text-center text-lg font-serif">
              “Every journey begins with a single step”
            </p>
          </div>
        </header>

        <div className="flex justify-center mt-10">
          <SegmentedControl
            value={value}
            size="md"
            color="rgba(55, 130, 82, 1)"
            onChange={setValue}
            data={[
              { label: "Journeys", value: "journeys" },
              { label: "Statistics", value: "statistics" },
            ]}
          />
        </div>

        <div className="flex justify-center mt-10">
          {value == "journeys" ? (
            <div className="w-full h-full">
              {getJourneyLoading && (
                <div className="flex justify-center items-center gap-5 mt-10 py-10 mx-10  text-slate-400">
                  <Loader size={32} color="gray" />
                  <h2 className="text-xs md:text-lg">Loading journeys</h2>
                </div>
              )}
              <div className="mt-5">
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
            </div>
          ) : (
            <p>Statistics</p>
          )}
        </div>
      </div>
    </main>
  );
}
