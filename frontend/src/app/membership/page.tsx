"use client";
import "./membership-styles.css";
import Link from "next/link";
import { API_URL } from "@/constants";
import { MembershipData } from "@/types";
import { FaArrowRight } from "react-icons/fa";
import { Select, Button } from "@mantine/core";
import React, { useState, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";

export default function Home() {
  const { theme } = useTheme();
  const [membershipData, setMembershipData] = useState<MembershipData | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/enums`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json() as Promise<MembershipData>;
      })
      .then((data) => {
        setMembershipData(data);
      })
      .catch((error) => {
        console.error("Error fetching membership data:", error);
      });
  }, []);

  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [selectedPlanType, setSelectedPlanType] = useState<String | null>(null);

  const handlePlanTypeChange = (value: String | null) => {
    setSelectedPlanType(value);
  };

  const selectedMembershipPlans =
    selectedPlanType == membershipData?.MembershipDuration[0]
      ? membershipData?.MembershipPriceMonthly
      : membershipData?.MembershipPriceAnnually;

  const handleSelectPlan = (planId: number) => {
    if (selectedPlan === planId) {
      setSelectedPlan(null);
    } else {
      setSelectedPlan(planId);
    }
  };

  const gradient = {
    background: "linear-gradient(#3B8B5D, #04372C)",
  };

  return (
    <main>
      <div
        className={`w-screen min-h-screen flex justify-center items-center ${
          theme == "dark" ? "bg-dk_background" : "bg-background"
        }`}
      >
        <div className="w-full">
          <div className="justify-around items-center pt-10 flex-grow">
            <p
              className={`text-center text-4xl font-semibold pb-2 font-serif ${
                theme == "dark" ? "text-[#5FE996]" : "text-black"
              }`}
            >
              Membership
            </p>
            <p
              className={`text-center text-lg font-serif ${
                theme == "dark" ? "text-white" : "text-black"
              }`}
            >
              “Every journey begins with a single step”
            </p>
          </div>

          <p
            className={`text-2xl text-center font-serif mt-12 mb-6 ${
              theme == "dark" ? "text-white" : "text-black"
            }`}
          >
            Choose your membership plan
          </p>
          <div className="flex justify-center">
            <Select
              placeholder="Pick type"
              allowDeselect={false}
              onChange={handlePlanTypeChange}
              data={membershipData?.MembershipDuration || []}
              defaultValue={membershipData?.MembershipDuration[0]}
              className={`${theme == "dark" ? "dark-input" : ""}`}
            />
          </div>

          <div className="w-screen flex justify-center items-center mt-10 gap-3 flex-wrap">
            {selectedPlanType &&
              selectedMembershipPlans?.map((plan, index) => (
                <div
                  key={index}
                  className={`w-full flex flex-col items-center justify-between rounded-[24px] p-6 drop-shadow-sharp
                  ${theme == "dark" ? "bg-[#1B2733]" : "bg-white"}
                  ${theme == "dark" && selectedPlan == index ? "gradient--dark-mode" : ""}
                  ${theme == "light" && selectedPlan == index ? "gradient--light-mode" : ""}
                  ${selectedPlan === index ? "w-[388px] h-[561px]" : "w-[335px] h-[516px]"}`}
                >
                  <div className="flex flex-col items-center ">
                    <p
                      className={`text-2xl font-bold mt-2
                    ${
                      selectedPlan !== index
                        ? theme === "dark"
                          ? "text-[#5FE996]"
                          : "text-[#1C5F42]"
                        : "text-white"
                    }`}
                    >
                      {membershipData?.MembershipType[index]}
                    </p>
                    <div
                      className={`flex mt-2 mb-3 justify-center font-normal
                      ${
                        selectedPlan !== index
                          ? theme === "dark"
                            ? "text-[#5FE996]"
                            : "text-[#1C5F42]"
                          : "text-white"
                      }`}
                    >
                      <p className="text-2xl mt-6">£</p>
                      <p className="text-4xl font-bold mt-4 ">{plan}</p>
                      <p className="text-xl mt-7">/{selectedPlanType}</p>
                    </div>
                    <div className="border-t border-t-gray-500">
                      <p
                        className={`mt-20 text-3xl px-5 ${
                          selectedPlan === index ? "text-white mx-4" : "text-[#787878]"
                        }`}
                      >
                        Each plan includes access to all features
                      </p>
                    </div>
                  </div>
                  <div className=" pt-10 py-4 flex items-center justify-center self">
                    {selectedPlan === index ? (
                      <Button
                        radius="sm"
                        variant="filled"
                        className={`cancel-button`}
                        onClick={() => handleSelectPlan(index)}
                      >
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        radius="sm"
                        variant="filled"
                        onClick={() => handleSelectPlan(index)}
                        className={`drop-shadow-sharp ${
                          theme == "dark" ? "select-button-dark" : "select-button-light"
                        }`}
                      >
                        Select
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>

          <div>
            {selectedPlan !== null && (
              <div className="flex justify-center mt-10">
                <Link
                  href={{
                    pathname: "/payment",
                    query: {
                      selectedPlanName: membershipData?.MembershipType[selectedPlan],
                      selectedPlanPrice: "£" + selectedMembershipPlans?.[selectedPlan] + "/",
                      selectedPlanDuration: selectedPlanType + "",
                    },
                  }}
                >
                  <Button size="md" color="green" variant="filled" className={`cancel-button`}>
                    Continue &nbsp; <FaArrowRight />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
