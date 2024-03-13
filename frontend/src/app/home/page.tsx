"use client"
import Link from "next/link";
import Image from "next/image";
import { Button } from "@mantine/core";
import { FaRegHeart } from "react-icons/fa";
import { CiUser} from "react-icons/ci";
import { AiOutlineFire } from "react-icons/ai";
import { SlDrop } from "react-icons/sl";
import { useState } from 'react';


  
export default function Home(){

    const [data, setData] = useState([
        { day: 'Mon', distance: 10 },
        { day: 'Tue', distance: 15 },
        { day: 'Wed', distance: 20 },
        { day: 'Thur', distance: 18 },
        { day: 'Fri', distance: 25 },
        { day: 'Sat', distance: 30 },
        { day: 'Sun', distance: 28 },
      ]);
      const maxDistance = Math.max(...data.map(item => item.distance));

     
    return (
        <main> 
            <div className="w-full h-full">
                <header className="flex w-full h-20 justify-around items-center pt-6">
                    <p className="text-center text-lg font-serif flex-grow">“Every journey begins with a single step”</p>

                    <Link href={"/landing"} className="rounded-xl mr-10">
                        <Button  className="rounded-full" variant="filled" color="rgba(0, 133, 57, 1)" radius="xl"><CiUser size={30}/></Button>
                    </Link>
                </header>
                
                <div className="px-20 mb-20">
                    <p className="font-serif text-2xl mt-10 ">Hi, name</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-10">
                        <div className="w-auto border-2 border-primary bg-tertiary h-80 rounded-lg justify-start p-2 px-4">

                            <p className="font-sans font-semibold text-2xl">Weather Today</p>
                                <div className="flex justify-around p-10" >
                                    <Image  src="/sun.png" alt="Sun Image" width={180} height={180} />
                                    <div className="self-center">
                                        <p className="text-4xl">Sunny</p>
                                        <p className="text-4xl"> 22 C</p>
                                    </div>
                                </div>
                        </div>
                        <div className="w-auto border-2 border-primary bg-tertiary h-80 rounded-lg justify-start p-2 px-4"> 
                            <p className="font-sans font-semibold text-2xl"> Distance covered</p>
                            <div className="flex items-end justify-around mx-8 mt-10">
                                {data.map((item, index) => (
                                    <div key={index} className="flex flex-col flex-grow items-center">
                                    <p>{item.distance} km</p>
                                    <div className="bg-primary w-12 md:w-10 lg:w-12" style={{height:`${item.distance * 5}px` }}></div>
                                    <p className="mt-2">{item.day}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="w-auto border-2 border-primary bg-tertiary h-60 flex flex-col justify-between rounded-lg  p-2 px-4 ">
                            <FaRegHeart size={26}/>
                            <p className="font-sans self-center text-4xl">75 bpm</p>
                            <p className="font-sans font-semibold text-lg">Pulse</p>
                           
                        </div>
                        <div className="w-auto border-2 border-primary bg-tertiary h-60 flex flex-col justify-between rounded-lg p-2 px-4 ">
                            <AiOutlineFire size={30}/>
                            <p className="font-sans self-center text-4xl">580 cal</p>
                            <p className="font-sans font-semibold text-lg">Calories</p>
                        </div>
                        <div className="w-auto border-2 border-primary bg-tertiary h-60 flex flex-col justify-between rounded-lg p-2 px-4 ">
                            <SlDrop  size={27}/>
                            <p className="font-sans self-center text-4xl">88%</p>
                            <p className="font-sans font-semibold  text-lg">Hydration</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>


    )
}



