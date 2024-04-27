"use client"
import Link from "next/link";
import Cookies from "js-cookie";
import { useState } from 'react';
import { Image } from "@mantine/core";
import { Button } from "@mantine/core";
import { IoMdHome } from "react-icons/io";
import { IoFootsteps } from "react-icons/io5";

export default function Thankyou() {
    const [username, setUsername] = useState(Cookies.get("username"));
     
    return ( 
        <main className="w-screen h-screen bg-tertiary relative">
            <div className="flex justify-center p-28 "> 
                <div className="bg-white rounded-lg shadow-xl flex-col text-center p-28  relative z-10"> 
                    <p className=" text-4xl font-semibold text-green-800">Success!</p>
                    <p className=" text-2xl font-semibold mt-8">Your membership plans have been updated.</p>
                    <p className=" text-2xl font-semibold mt-2">You will be charged from the same payment method as before, after current plan expires.</p>
                    <p className=" text-3xl font-semibold mt-8">View your dashboard</p>
                    <Link href={'/dashboard'}>
                        <Button className="mt-5 bg-green-700" color="green" size="md"><IoMdHome size={36}/></Button>
                    </Link>
                    <IoFootsteps size={150} className="absolute top-2 right-0 transform translate-x-1/2 -translate-y-1/2 -rotate-45"/>
                </div>

                 <div className="absolute bottom-0 right-0 z-0">
                    <Image src="/plant2.png" alt="Plant image" className="w-screen"/>
                </div>
            </div>
           
        </main>
     );
}

