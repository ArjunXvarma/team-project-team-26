"use client"
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useRef} from 'react';
import { Button, UnstyledButton } from "@mantine/core";
import Cookies from "js-cookie";
import { API_URL } from "@/constants";
import { LuHeartPulse } from "react-icons/lu";
import { LiaDumbbellSolid } from "react-icons/lia";
import { IoNutritionOutline } from "react-icons/io5";
import { RxTrackNext } from "react-icons/rx";

export default function Landing(){

    interface MembershipData {
        MembershipDuration: string[];
        MembershipType: string[];
        MembershipPriceMonthly: string[];
        MembershipPriceAnnually: string[];
    }
    
    const [membershipData, setMembershipData] = useState<MembershipData | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hasActiveMembership, sethasActiveMembership] = useState(false);
    const description = [
        ["Heart Rate Tracking", "Personalized Workouts"],
        ["Heart Rate Tracking", "Personalized Workouts", "Nutrition Tracking", "Progress Tracking"],
        ["Heart Rate Tracking", "Personalized Workouts", "Nutrition Tracking", "Progress Tracking", "Customer Analytics", "Dedicated Support"]
    ];

    async function fetchMembershipStatus(token:string | undefined) {
        try {
            const response = await fetch(`${API_URL}/has_active_membership`, {
                method: 'GET',
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                },
            });
    
            const membershipResponse = await response.json();
    
            if (response.status === 200 || response.status === 401) {
                sethasActiveMembership(membershipResponse.has_active_membership);
                if (response.status === 401) {
                    console.log(membershipResponse.error);
                }
            }
        } catch (error) {
            console.error('Error fetching membership status:', error);
        }
    }
    
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
        const token = Cookies.get('token');
        setIsLoggedIn(!!token);
        if (isLoggedIn) {
            fetchMembershipStatus(token);
        }
    }, [isLoggedIn]);


    const gradient = {
        background: 'linear-gradient(#3B8B5D, #04372C)'
      };
    const videos = ['/water.mp4', '/race.mp4', '/running.mp4'];
 

    return (
        <main> 
            <div className="w-full h-full">

            <header className="bg-white flex items-center justify-between p-8 ">
                <p className="text-3xl font-bold text-green-600">FitFusion</p>
                <div className="flex items-center">
                    {isLoggedIn ? (
                    <div className="flex justify-center">
                        <Link href={"/logout"}>
                            <UnstyledButton className="font-semibold text-xl text-green-600">Logout</UnstyledButton>
                        </Link>
                    </div>
                    ) : (
                    <div className="flex justify-center">
                        <Link href={"/login"} >
                            <UnstyledButton className="font-semibold text-2xl text-green-600  hover:text-green-700">Login</UnstyledButton>
                        </Link>
                        <p className="text-lg mx-2 text-green-700">/</p>
                        <Link href={"/signup"}>
                            <UnstyledButton className="font-semibold text-2xl text-green-600 hover:text-green-700">SignUp</UnstyledButton>
                        </Link>
                    </div>
                    )}
                </div>
            </header>


            <div className="w-full p-32  text-center text-white flex flex-col justify-center items-center" style={gradient}>
                <h1 className="text-7xl font-bold">Transform Your Fitness Journey</h1>
                <p className="text-3xl pt-8">Unlock your full potential with our cutting-edge fitness app.<br/> Achieve your goals and feel better than ever.</p>
                <div className="">
                        {isLoggedIn && hasActiveMembership? (
                            <Link href={"/dashboard"} className="flex w-full py-10">
                                <Button variant="filled" className="bg-white text-2xl text-green-700 hover:bg-green-600" size="lg" radius="md">View your Dashboard</Button>
                            </Link> 
                        ):(
                            <Link href={"/membership"} className="flex w-full py-10">
                                <Button variant="filled" className="bg-white text-2xl text-green-700 hover:bg-green-600" size="lg" radius="md" >Join Now</Button>
                            </Link>
                        )}
                </div>
            </div>

            <div className="flex flex-wrap justify-center items-center text-center py-36 lg:px-10">
                <div className="flex flex-col justify-center items-center mb-10 lg:mb-0 lg:w-1/4">
                    <LuHeartPulse size={50} color={'green'}/>
                    <p className="mt-2 text-3xl font-semibold">Heart Rate Tracking</p>
                    <p className="mt-5 text-xl">Accurately monitor your heart rate during workouts to optimize your performance.</p>
                </div>

                <div className="flex flex-col justify-center items-center mb-10 lg:mb-0 lg:w-1/4">
                    <LiaDumbbellSolid size={50} color={'green'}/>
                    <p className="mt-2 text-3xl font-semibold">Personalised Workouts</p>
                    <p className="mt-5 text-xl">Get custom workout plans tailored to your fitness level and goals.</p>
                </div>

                <div className="flex flex-col justify-center items-center mb-10 lg:mb-0 lg:w-1/4">
                    <IoNutritionOutline  size={50} color={'green'}/>
                    <p className="mt-2 text-3xl font-semibold">Nutrition Tracking</p>
                    <p className="mt-5 text-xl">Log your meals and get personalized nutrition recommendations.</p>
                </div>
                
                <div className="flex flex-col justify-center items-center lg:w-1/4">
                    <RxTrackNext  size={50} color={'green'}/>
                    <p className="mt-2 text-3xl font-semibold">Progress Tracking</p>
                    <p className="mt-5 text-xl">Monitor your progress and see how far you have come on your fitness journey.</p>
                </div>
            </div>  


            <div className="w-full py-28 px-6 bg-gray-100 flex flex-col justify-center items-center">

                <div className="flex flex-col justify-center items-center">
                    <p className="text-5xl font-bold">Pricing</p>
                    <p className="text-2xl mt-5" >Choose the plan that fits your fitness needs and budget.</p>
                </div>

                <div className="flex flex-wrap justify-center items-start text-center mt-6">
                        {membershipData && membershipData.MembershipType.map((type, index) => (
                            <div key={index} className="m-4 px-20 py-10 bg-white rounded-lg drop-shadow-sharp">
                                <p className="text-3xl font-bold text-center"> {type} </p>

                                <div className="flex justify-center items-baseline mt-2">
                                    <p className="text-3xl text-gray-500 font-bold"> £{membershipData.MembershipPriceMonthly[index]}</p>
                                    <p className="text-lg text-gray-500 font-domine">/ month</p>
                                </div>
                                
                                <p className="text-left text-xl font-semibold mt-4">Features:</p>
                                <ul className="text-left mt-2">
                                    {description[index].map((feature, i) => (
                                        <li key={i} className="text-lg">-{feature}</li>
                                    ))}
                                </ul>

                                {!isLoggedIn ? (
                                    <Link href={"/login"} className="flex w-full py-10">
                                        <Button className="bg-green-700 hover:bg-green-600 text-lg justify-self-end w-full mt-4" >Get Started</Button>
                                    </Link>
                                ) : (
                                    (isLoggedIn && hasActiveMembership) ? (
                                        <Link href={"/dashboard"} className="flex w-full py-10">
                                            <Button className="bg-green-700 hover:bg-green-600 text-lg justify-self-end w-full mt-4" >Get Started</Button>
                                        </Link>
                                    ) : (
                                        <Link href={"/membership"} className="flex w-full py-10">
                                            <Button className="bg-green-700 hover:bg-green-600 text-lg justify-self-end w-full mt-4" >Get Started</Button>
                                        </Link>
                                    )
                                )}


                            </div>
                        ))}
                    </div>
            </div>

            <div className="bg-white p-28 flex flex-col justify-center items-center">
                <h1 className="text-5xl font-bold text-green-700">SignUp Now!</h1>
                <p className="text-3xl pt-8 text-center">Get the fitness app that is changing the game.<br/> Available on all your favorite devices.</p>
                {isLoggedIn ? (
                <div className="flex justify-center mt-6">
                    <Link href={"/dashboard"}>
                        <Button className="font-semibold text-xl bg-green-700 hover:bg-green-800" size="lg">Dashboard</Button>
                    </Link>
                </div>
                ) : (
                <div className="flex justify-center mt-6">
                    <Link href={"/signup"}>
                        <Button className="font-semibold text-2xl bg-green-700 hover:bg-green-800" size="lg">SignUp</Button>
                    </Link>
                </div>
                )}
            </div>

        </div>
            
        </main>
    )
  }
  
