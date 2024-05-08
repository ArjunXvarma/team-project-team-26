"use client";
import Cookie from "js-cookie";
import "@mantine/charts/styles.css";
import { API_URL } from "@/constants";
import { LineChart } from "@mantine/charts";
import { showErrorMessage } from "@/utils";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { FutureRevenuePredictionAPIResponse, Revenue } from "@/types";
import { Loader } from "@mantine/core";
import { MdOutlineErrorOutline } from "react-icons/md";

interface FutureRevenue {
  revenue: number;
  week: number;
}

export default function Statistics() {
  const { theme } = useTheme();
  const [weeklyRevenue, setWeeklyRevenue] = useState<Revenue[]>();
  const [futureRevenue, setFutureRevenue] = useState<FutureRevenue[]>();
  const [weeklyRevenueLoading, setWeeklyRevenueLoading] = useState(true);
  const [futureRevenueLoading, setfutureRevenueLoading] = useState(true);

  const getRevenues = async () => {
    setWeeklyRevenueLoading(true);
    try {
      let token = Cookie.get("token");
      let response = await fetch(`${API_URL}/admin/get_revenues?period=week`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      let data: Revenue[] = await response.json();
      setWeeklyRevenue(data);
    } catch (error) {
      showErrorMessage("Error", "Unable to get weekly revenues");
    }
    setWeeklyRevenueLoading(false);
  };

  const getFutureRevenue = async () => {
    setfutureRevenueLoading(true);
    try {
      let token = Cookie.get("token");
      let response = await fetch(`${API_URL}/admin/get_future_revenue?period=week&limit=52`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      let fr: FutureRevenue[] = [];
      let responseData: FutureRevenuePredictionAPIResponse = await response.json();

      //   const currentWeek = moment().get("w");
      responseData.data.future_revenues.map((val, i) => {
        fr.push({
          revenue: val,
          week: i + 1,
        });
      });
      setFutureRevenue(fr);
    } catch (error) {
      showErrorMessage("Error", "Unable to get weekly revenues");
    }
    setfutureRevenueLoading(false);
  };

  useEffect(() => {
    getRevenues();
    getFutureRevenue();
  }, []);
  return (
    <main>
      <div
        className={`min-h-screen ${theme == "dark" ? "bg-dk_background" : "bg-background"}`}
      >
        <div
          className={`h-full m-3 md:m-8 drop-shadow-xl py-4 px-3 md:px-20 rounded-3xl ${
            theme == "dark" ? "bg-[#1B2733]" : "bg-white"
          }`}
        >
          <p
            className={`flex justify-center font-black text-2xl mb-4 ${
              theme == "dark" ? "text-[#5FE996]" : "text-green-800"
            }`}
          >
            Weekly Revenue
          </p>
          {weeklyRevenue && (
            <div className="w-full overflow-x-auto">
              <table className="min-w-full flex-shrink rounded-md overflow-scroll">
                <thead className="text-sm font-semibold shad-text-gray-500 dark:shad-text-gray-400">
                  <tr
                    className={`border-b-2 text-lg font ${
                      theme == "dark" ? "text-[#5bdd8f] border-[#787878]" : "text-green-900"
                    }`}
                  >
                    <th className="px-4 py-3 text-center">Weeks</th>
                    <th className="px-4 py-3 text-center">Basic</th>
                    <th className="px-4 py-3 text-center">Standard</th>
                    <th className="px-4 py-3 text-center">Premium</th>
                    <th className="px-4 py-3 text-center">Weekly Revenue</th>
                  </tr>
                </thead>
                <tbody className="shad-text-gray-500 dark:shad-text-gray-400 text-sm">
                  {weeklyRevenue.map((val, i) => (
                    <tr
                      key={i}
                      className={`border-b hover:shad-bg-gray-100 dark:hover:shad-bg-gray-800 h-16 ${
                        theme == "dark" ? "border-[#787878] text-white" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-center">{val.period}</td>
                      <td className="px-4 py-3 text-center">
                        {val.by_type.Basic?.total_revenue || 0}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {val.by_type.Standard?.total_revenue || 0}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {val.by_type.Premium?.total_revenue || 0}
                      </td>
                      <td className="px-4 py-3 text-center">{val.total_revenue || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {weeklyRevenueLoading ? (
            <div
              className={`flex justify-center items-center gap-5 mt-10 py-10 mx-10 border-2 rounded-md ${
                theme === "dark"
                  ? "border-[#5FE996] bg-[#1B2733] text-green-400"
                  : "border-slate-100 bg-slate-50 text-slate-400"
              }`}
            >
              <Loader size={32} color={theme == "dark" ? "#5FE996" : "gray"} />
              <p>Loading Weekly Revenue</p>
            </div>
          ) : (
            !weeklyRevenue && (
              <div
                className={`flex justify-center items-center gap-5 mt-10 py-10 mx-10 border-2 rounded-md ${
                  theme === "dark"
                    ? "border-red-400 bg-[#1B2733] text-red-400"
                    : "border-red-400 bg-red-50 text-red-400"
                }`}
              >
                <MdOutlineErrorOutline size={32} />
                <p className="text-lg">Error fetching weekly revenue</p>
              </div>
            )
          )}
          <p
            className={`flex justify-center text-green-800 font-bold text-xl mb-4 mt-16 ${
              theme == "dark" ? "text-[#5bdd8f] border-[#787878]" : "text-green-900"
            }`}
          >
            Predicted Revenue for the next 10 weeks
          </p>
          {futureRevenue && (
            <div
              className={`px-3 sm:py-3 py-10 rounded-3xl text-white gradient--dark-mode overflow-x-auto ${
                theme == "dark" ? "gradient--light-mode" : "gradient--dark-mode"
              }`}
            >
              <LineChart
                h={450}
                withLegend
                gridAxis="xy"
                dataKey="week"
                strokeWidth={3}
                curveType="natural"
                withDots={false}
                className="min-w-80"
                data={futureRevenue}
                legendProps={{ verticalAlign: "bottom" }}
                series={[{ name: "revenue", label: "Week from today", color: "white" }]}
              />
            </div>
          )}

          {futureRevenueLoading ? (
            <div
              className={`flex justify-center items-center gap-5 mt-10 py-10 mx-10 border-2 rounded-md ${
                theme === "dark"
                  ? "border-[#5FE996] bg-[#1B2733] text-green-400"
                  : "border-slate-100 bg-slate-50 text-slate-400"
              }`}
            >
              <Loader size={32} color={theme == "dark" ? "#5FE996" : "gray"} />
              <p>Loading Future Revenue</p>
            </div>
          ) : (
            !futureRevenue && (
              <div
                className={`flex justify-center items-center gap-5 mt-10 py-10 mx-10 border-2 rounded-md ${
                  theme === "dark"
                    ? "border-red-400 bg-[#1B2733] text-red-400"
                    : "border-red-400 bg-red-50 text-red-400"
                }`}
              >
                <MdOutlineErrorOutline size={32} />
                <p className="text-lg">Error fetching weekly revenue</p>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}
