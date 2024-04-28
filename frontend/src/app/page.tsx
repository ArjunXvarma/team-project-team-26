"use client"
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useRef} from 'react';
import { Button, UnstyledButton } from "@mantine/core";
import Cookies from "js-cookie";
import { API_URL } from "@/constants";

export default function Landing(){

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hasActiveMembership, sethasActiveMembership] = useState(false);
    

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
        const token = Cookies.get('token');
        setIsLoggedIn(!!token);
        if (isLoggedIn) {
            fetchMembershipStatus(token);
        }
    }, [isLoggedIn]);
    

  


    const videos = ['/water.mp4', '/race.mp4', '/running.mp4'];
 


  


    const videos = ['/water.mp4', '/race.mp4', '/running.mp4'];
 

    return (
        <main> 
          <div className="w-full h-full">

            <div className="fixed top-0 left-0 w-full h-full -z-10">
                    <video 
                        className="w-full h-full object-cover " 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                    >
                    <source src="/water.mp4" type="video/mp4" />
                    </video>
                </div>
            

            <header className="bg-black opacity-65 flex items-center justify-between pt-12 pb-6 px-10 z-10">
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
                            <UnstyledButton className="font-semibold text-xl text-green-600  hover:text-green-700">Login</UnstyledButton>
                        </Link>
                        <p className="text-lg mx-2 text-green-700">/</p>
                        <Link href={"/signup"}>
                            <UnstyledButton className="font-semibold text-xl text-green-600 hover:text-green-700">SignUp</UnstyledButton>
                        </Link>
                    </div>
                    )}
                </div>
            </header>
            
            <div className="mt-28 ml-20">
                <div className="bg-black opacity-65 pr-6 py-8 w-1/4 flex flex-col justify-end items-end rounded-2xl">
                    <p className="text-3xl text-green-500 ">Journey with Tom : :</p>
                    <p className="text-xl text-white mt-6 font-bold">Friday</p>
                    <p className="text-xl text-white font-bold">12/02/24</p>
                </div>
                

                    <div className="flex flex-col">
                        <p className="text-4xl font-mono text-white mt-8">Push Your Boundaries</p>
                        <p className="text-2xl text-green-600 text-wrap font-domine mt-6 w-2/3">&quot;Best app to go on a hike with friends&quot; -Mike</p>
                    </div>
                    
                    <div className="">
                            {isLoggedIn && hasActiveMembership? (
                                <Link href={"/dashboard"} className="flex w-full py-10">
                                    <Button variant="filled" className="bg-green-700 hover:bg-green-800" size="md">View your Dashboard</Button>
                                </Link> 
                            ):(
                                <Link href={"/membership"} className="flex w-full py-10">
                                    <Button variant="filled" className="bg-green-700 hover:bg-green-800" size="md" >Join Now</Button>
                                </Link>
                            )}
                    </div>
            </div>

         

         </div>
            
        </main>
    )
  }
  
