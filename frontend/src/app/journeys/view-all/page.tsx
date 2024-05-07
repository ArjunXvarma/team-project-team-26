"use client";
import Cookie from "js-cookie";
import "leaflet/dist/leaflet.css";
import { Journey } from "@/types";
import dynamic from "next/dynamic";
import { API_URL } from "@/constants";
import { Loader } from "@mantine/core";
import "../../friends/friends-styles.css";
import { showErrorMessage } from "@/utils";
import { GetJourneyAPIResponse } from "@/types";
import { useTheme } from "@/components/theme-provider";
import React, { useEffect, useMemo, useState } from "react";

export default function AllJourney() {
  const { theme } = useTheme();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [getJourneyLoading, setGetJourneyLoading] = useState(true);
  const [legend, setLegend] = useState<{ color: string; name: String }[]>([]);
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/map/Map"), {
        ssr: false,
        loading: () => <p>A map is loading</p>,
      }),
    []
  );

  const getRandomColor = () => {
    return "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
  };

  const getJourneys = async () => {
    setGetJourneyLoading(true);

    const token = Cookie.get("token");
    try {
      const response = await fetch(`${API_URL}/get_journeys_of_user`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      const journeyData: GetJourneyAPIResponse = await response.json();
      console.log(journeyData);
      if (response.status === 404) {
        setJourneys([]);
      } else {
        setJourneys(journeyData.data!);
        setLegend(
          journeyData.data!.map((val, i) => {
            let color = getRandomColor();
            return { color: color, name: val.name };
          })
        );
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
    getJourneys();
  }, []);

  return (
    <main>
      <div
        className={`min-h-screen ${theme == "dark" ? "bg-dk_background" : "bg-background"}`}
      >
        <div>
          <div className="flex justify-center mt-2 ">
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
                    All your journeys
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
                  {journeys && journeys.length > 0 ? (
                    <div className="w-full flex md:flex-row items-center md:items-start flex-col justify-center">
                      <div className="mt-3 h-2/3 md:w-2/3 w-full md:mx-3 mx-5">
                        <Map
                          tracks={journeys.map((journey, i) => ({
                            data: journey.points,
                            color: legend[i].color,
                          }))}
                          center={{
                            lat: journeys[0].points[Math.ceil(journeys[0].points.length / 2)]
                              .lat,
                            lng: journeys[0].points[Math.ceil(journeys[0].points.length / 2)]
                              .lon,
                          }}
                        />
                      </div>
                      <div
                        className={`flex flex-col gap-3 rounded-2xl px-10 py-3 relative top-0 left-0 h-fit md:mt-0 mt-10 md:w-fit w-full drop-shadow-sharp ${
                          theme == "dark" ? "bg-[#1B2733] text-white" : "bg-white"
                        }`}
                      >
                        <h2
                          className={`font-semibold text-lg ${
                            theme == "dark" ? "text-[#5FE996]" : "text-black"
                          }`}
                        >
                          Legend
                        </h2>
                        {legend.map((val, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full`}
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
          </div>
        </div>
      </div>
    </main>
  );
}
