"use client"
import Link from "next/link";
import Cookie from "js-cookie";
import { API_URL } from "@/constants";
import { Button } from "@mantine/core";
import { Select } from '@mantine/core';
import { FaArrowRight } from "react-icons/fa";
import React, { useState , useEffect} from 'react';
import { CurrentMembership, MembershipData} from "@/types";
import { showErrorMessage, showSuccessMessage } from "@/utils";

export default function Home(){
    const [membershipData, setMembershipData] = useState<MembershipData>();
    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
    const [selectedPlanType, setSelectedPlanType] = useState<String | null>(null);

    const handlePlanTypeChange = (value: String | null) => {
        setSelectedPlanType(value);
    };

    const selectedMembershipPlans = selectedPlanType == membershipData?.MembershipDuration[0] ? membershipData?.MembershipPriceMonthly : membershipData?.MembershipPriceAnnually;
    const handleSelectPlan = (planId:number) => {
        if (selectedPlan === planId) {
            setSelectedPlan(null); 
        } else {
            setSelectedPlan(planId); 
        }
      };
    
      const [current, setCurrent] = useState<CurrentMembership>();
      const setCurrentMembership = (currentMembershipData: CurrentMembership) => {
        if(currentMembershipData){
            setCurrent(currentMembershipData);
            const currentPlanIndex = membershipData?.MembershipDuration.indexOf(currentMembershipData?.membership_duration.toString());
            if (currentPlanIndex !== -1) {
                // @ts-ignore
                handlePlanTypeChange(membershipData?.MembershipDuration[currentPlanIndex]);
                const index = membershipData?.MembershipType.indexOf(currentMembershipData?.membership_type.toString());
                // @ts-ignore
                handleSelectPlan(index);
            }
        }
      };

      const getCurrentMembership = async () => {
        try {
            const token = Cookie.get("token");
            const response = await fetch(`${API_URL}/get_current_membership`, {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
            });
            const membershipResponse = await response.json();
            if (response.status === 200) {
            setCurrentMembership(membershipResponse);
            } else if (response.status === 404) {
            showErrorMessage("Error", "User not found");
            }
        } catch (error) {
            showErrorMessage(
            "Server Error",
            "There was a problem contacting the server. Please try again later."
            );
        }
    };

    const update = async () => {
        try {
          const token = Cookie.get("token");
          const response = await fetch(`${API_URL}/update_membership`, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({ 
                // @ts-ignore
                membership_type: membershipData?.MembershipType[selectedPlan],
                duration: selectedPlanType,
                auto_renew : true}),
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          });
    
          if (response.status === 200) {
            showSuccessMessage("Success", "Plan updated, will be charged at next billing cycle");
            setTimeout(() => {
                window.location.href = "/planChanged"; // Replace with your desired URL
              }, 1200);
          }
        } catch (error) {
          showErrorMessage(
            "Server Error",
            "There was a problem contacting the server. Please try again later."
          );
        }
      };

    useEffect(() => {
        fetch(`${API_URL}/api/enums`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json() as Promise<MembershipData>;
            })
            .then(data => {
                setMembershipData(data);
            })
            .catch(error => {
                console.error('Error fetching membership data:', error);
            });
    }, []);

    useEffect(() => {
        getCurrentMembership();
    }, [membershipData]);

    const gradient = {
      background: 'linear-gradient(#3B8B5D, #04372C)'
    };

    return (
        <main> 
          <div className="w-full min-h-screen bg-background flex justify-center items-center">
            <div className="max-w-screen-lg w-full mb-20">

                <header className="justify-around items-center pt-10 flex-grow">
                    <p className="text-center text-4xl font-semibold pb-2 font-serif  "> Membership</p>
                    <p className="text-center text-lg  font-serif ">“Every journey begins with a single step”</p>
                </header>

                <p className="text-2xl text-center font-serif mt-12 mb-6">Choose your membership plan </p>
                <div className='flex justify-center'>
                    <Select
                        placeholder="Pick type"
                        data={membershipData?.MembershipDuration || []}
                        className='w-fit'
                        defaultValue={membershipData?.MembershipDuration[0]}
                        onChange={handlePlanTypeChange}
                        allowDeselect={false}
                    />
                </div>  


                <div className="flex justify-center items-center mt-10 gap-2 flex-wrap">
                {selectedPlanType && selectedMembershipPlans?.map((plan, index) => (
                <div key={index} className={`flex flex-col items-center rounded-xl p-6 w-72 h-80 drop-shadow-sharp ${selectedPlan === index ? 'w-80 h-96' : 'bg-white'}`}
                style={{...(selectedPlan === index && gradient)}}>
                        <p className={`text-2xl font-semibold mt-2 ${selectedPlan === index ? "text-white":"text-green-800" }`}>{membershipData?.MembershipType[index]}</p>
                        <div className={`divide-y ${selectedPlan === index ? "divide-white ":"t divide-gray-500 " } flex flex-col justify-between `}>
                            <div className={`flex mt-4 mb-3 justify-center font-bold ${selectedPlan === index ? "text-white":"text-green-800" }`}>
                                <p className="text-2xl mt-6">£</p>
                                <p className="text-4xl mt-4 ">{plan}</p>
                                <p className="text-xl mt-7">/{selectedPlanType}</p>
                            </div>
                            
                            <div className=" pt-10 py-4 flex items-center justify-center">
                                {selectedPlan === index ? (
                                    <Button onClick={() => handleSelectPlan(index)} className=" bg-green-600 rounded-full drop-shadow-sharp" variant="filled" color="green" radius="sm">Cancel</Button>
                                ) : (
                                    <Button onClick={() => handleSelectPlan(index)} className=" bg-gray-50 rounded-full drop-shadow-sharp text-green-800 font-bold" variant="filled" color="#2EAE69" radius="sm">Select</Button>
                                )}
                            </div> 
                        </div> 
                    </div>
                    ))}
                </div>

                <div>
                    {selectedPlan !== null && (
                        <div className="flex justify-center mt-10">
                            {(membershipData?.MembershipType[selectedPlan] == current?.membership_type && selectedPlanType == current?.membership_duration && current?.auto_renew) ? (
                                <div className="flex flex-col justify-center items-center">
                                    <p className="text-lg">Selected Plan is same as current plan.  </p>
                                    <p className="text-lg"> Please Select a different plan.</p>
                                </div>
                            ) :
                                (membershipData?.MembershipType[selectedPlan] == current?.membership_type && selectedPlanType == current?.membership_duration && !current?.auto_renew) ? (
                                <div className="flex flex-col justify-center items-center">
                                    <p className="text-lg">This is the same plan as before, are you sure want to continue?</p>
                                    <Button className="text-white px-4 py-2 drop-shadow-sharp mt-4 rounded-full bg-green-700" onClick={update} variant="filled" size="md"> Continue &nbsp; <FaArrowRight/></Button>
                                </div>
                            ):
                            (
                                <div>
                                    <Button className="text-white px-4 py-2  drop-shadow-sharp rounded-full bg-green-700" onClick={update} color="green" variant="filled" size="md"> Continue &nbsp; <FaArrowRight/></Button>
                                </div>
                            )}
                        </div>
                        
                    )}
                </div>
            </div>
          </div>  
        </main>
    )
}