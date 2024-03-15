"use client"
import { Button } from "@mantine/core";
import { Image } from "@mantine/core";
import Link from "next/link";
import { IoMdHome } from "react-icons/io";
import { IoFootsteps } from "react-icons/io5";
import { useState } from 'react';
import Cookies from "js-cookie";

export default function Thankyou() {
    const [username, setUsername] = useState(Cookies.get("username"));
     
    return ( 
        <main className="w-screen h-screen bg-tertiary relative">
            <div className="flex justify-center p-28 "> 
                <div className="bg-white rounded-lg shadow-xl flex-col text-center p-28  relative z-10"> 
                    <p className=" text-4xl font-semibold">Congratulations {username}!</p>
                    <p className=" text-4xl font-semibold mt-4">You are now a member</p>
                    <p className=" text-3xl font-semibold mt-8">View your dashboard</p>
                    <Link href={'/home'}>
                        <Button className="mt-5  bg-green-700" size="md"><IoMdHome size={36}/></Button>
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

