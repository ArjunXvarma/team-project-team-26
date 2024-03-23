"use client"
"use client"
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from 'react';
import React, { useEffect, useState } from 'react';
import { Button, UnstyledButton } from "@mantine/core";
import Cookies from "js-cookie";
import { API_URL } from "@/constants";

export default function Landing(){

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hasActiveMembership, sethasActiveMembership] = useState(false);
 

    useEffect(() => {
        const token = Cookies.get('token');
        // setting isLoggedIn to true if token exists
        setIsLoggedIn(!!token); 
        async function fetchMembershipStatus() {
        try {
            const response = await fetch(`${API_URL}/has_active_membership`, {
                method: 'GET',
                credentials: "include",
                headers: {"Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                },
            });

            const membershipResponse = await response.json();
            
            if (response.status == 200) {
                sethasActiveMembership(membershipResponse.has_active_membership);
            } else if (response.status == 401) {
                sethasActiveMembership(membershipResponse.has_active_membership);
                console.log(membershipResponse.error);
            }
        } catch (error) {
            console.error('Error fetching membership status:',error);
        } 
    
    }
    fetchMembershipStatus();
}, []);
 

    return (
        <main> 
          <div className="w-full h-full">
            <header className=" flex items-center justify-between px-16 pt-10">

                <p className="ml-4 text-2xl font-bold text-green-700">MyApp</p>
                <div className="flex items-center hover:text-green-700">
                    {isLoggedIn ? (
                    <div className="flex justify-center">
                        <Link href={"/logout"}>
                            <UnstyledButton className="font-semibold text-lg hover:text-green-700">Logout</UnstyledButton>
                        </Link>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <Link href={"/login"} >
                            <UnstyledButton className="font-semibold text-lg hover:text-green-700">Login</UnstyledButton>
                        </Link>
                        <p className="text-lg mx-2">/</p>
                        <Link href={"/signup"}>
                            <UnstyledButton className="font-semibold text-lg hover:text-green-700">SignUp</UnstyledButton>
                        </Link>
                    </div>
                )}
                <div className="flex items-center hover:text-green-700">
                    {isLoggedIn ? (
                    <div className="flex justify-center">
                        <Link href={"/logout"}>
                            <UnstyledButton className="font-semibold text-lg hover:text-green-700">Logout</UnstyledButton>
                        </Link>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <Link href={"/login"} >
                            <UnstyledButton className="font-semibold text-lg hover:text-green-700">Login</UnstyledButton>
                        </Link>
                        <p className="text-lg mx-2">/</p>
                        <Link href={"/signup"}>
                            <UnstyledButton className="font-semibold text-lg hover:text-green-700">SignUp</UnstyledButton>
                        </Link>
                    </div>
                )}
                </div>
            </header>
            
            <p className="text-center text-lg font-serif">“ Every journey begins with a single step ”</p>
            <div className="flex items-start justify-between">
                <div className="ml-24 py-40">
                    <p className="text-4xl font-serif font-medium underline">Heading</p>
                    <p className="text-xl font-serif ">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu dui non diam eleifend egestas id a ligula.</p>
                    {isLoggedIn && hasActiveMembership? (
                        <Link href={"/home"} className="flex w-full py-10">
                            <Button variant="filled" className="bg-green-700 hover:bg-green-800"  size="md" radius="xl">View your Dashboard</Button>
                        </Link> 
                    ):(
                        <Link href={"/membership"} className="flex w-full py-10">
                            <Button variant="filled" className="bg-green-700 hover:bg-green-800"  size="md" radius="xl">Join Now</Button>
                        </Link>
                    )}
                    
                    {isLoggedIn && hasActiveMembership? (
                        <Link href={"/home"} className="flex w-full py-10">
                            <Button variant="filled" className="bg-green-700 hover:bg-green-800"  size="md" radius="xl">View your Dashboard</Button>
                        </Link> 
                    ):(
                        <Link href={"/membership"} className="flex w-full py-10">
                            <Button variant="filled" className="bg-green-700 hover:bg-green-800"  size="md" radius="xl">Join Now</Button>
                        </Link>
                    )}
                    
                </div>
                <div className="flex items-center justify-end">
                    <Image src="/landing.png" alt="Running People Image" width={990} height={680} />
                </div> 
            </div>
         </div>
            
        </main>
    )
  }
  
