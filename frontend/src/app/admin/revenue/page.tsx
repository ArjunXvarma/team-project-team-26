"use client";
import Cookie from "js-cookie";
import moment from "moment";
import { API_URL } from "@/constants";
import { LineChart } from "@mantine/charts";
import { showErrorMessage } from "@/utils";
import { useEffect, useState } from "react";
import { FutureRevenuePredictionAPIResponse, Revenue } from "@/types";

interface FutureRevenue {
  revenue: number;
  week: number;
}

export default function Statistics() {
  const [weeklyRevenue, setWeeklyRevenue] = useState<Revenue[]>();
  const [futureRevenue, setFutureRevenue] = useState<FutureRevenue[]>();

  // @ts-ignore
  Date.prototype.getWeekNumber = function () {
    var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // @ts-ignore
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };

  const getRevenues = async () => {
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
  };

  const getFutureRevenue = async () => {
    try {
      let token = Cookie.get("token");
      let response = await fetch(`${API_URL}/admin/get_future_revenue?period=week&limit=10`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      let fr: FutureRevenue[] = [];
      let responseData: FutureRevenuePredictionAPIResponse = await response.json();

      const currentWeek = moment().get("w");
      responseData.data.future_revenues.map((val, i) => {
        fr.push({
          revenue: val,
          week: currentWeek + i + 1,
        });
      });
      setFutureRevenue(fr);

      console.log(fr);
    } catch (error) {
      showErrorMessage("Error", "Unable to get weekly revenues");
    }
  };

  useEffect(() => {
    getRevenues();
    getFutureRevenue();
  }, []);
  return (
    <main>
     <div className="min-h-screen bg-background">
        <div className="h-full m-8 drop-shadow-xl rounded-md bg-white py-4 px-20">
          <p className="flex justify-center text-green-800 font-bold text-xl mb-4">
            Weekly Revenue
          </p>
          {weeklyRevenue && (
            <table className="h-1/2 min-w-full flex-shrink bg-white rounded-md">
              <thead className="text-sm font-semibold shad-text-gray-500 dark:shad-text-gray-400">
                <tr className="border-b text-lg text-green-900 ">
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
                    className="border-b hover:shad-bg-gray-100 dark:hover:shad-bg-gray-800"
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
          )}
          {!weeklyRevenue && (
            <div className="flex justify-center text-red-600 font-bold">
              <p>Error fetching weekly revenue</p>
            </div>
          )}
          <p className="flex justify-center text-green-800 font-bold text-xl mb-4 mt-16">
            Predicted Revenue for the next 10 weeks
          </p>
          {futureRevenue && (
            <LineChart
              h={300}
              withLegend
              dataKey="week"
              data={futureRevenue}
              legendProps={{ verticalAlign: "bottom" }}
              series={[{ name: "revenue", label: "Week from today", color: "indigo.6" }]}
            />
          )}

          {!weeklyRevenue && (
            <div className="flex justify-center text-red-600 font-bold">
              <p>Error fetching future revenue</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
