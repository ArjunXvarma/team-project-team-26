"use client"
import Link from "next/link";
import Image from "next/image";
import { Button } from "@mantine/core";
import { FaRegHeart } from "react-icons/fa";
import { CiUser} from "react-icons/ci";
import { AiOutlineFire } from "react-icons/ai";
import { SlDrop } from "react-icons/sl";
import BarChart from '../components/page';


export default function Home(){
 
    return (
        <main> 
            <div className="w-full h-full">
                <header className="flex w-full h-20 justify-around items-center pt-6">
                    <h1 className="text-center text-lg font-serif flex-grow">“Every journey begins with a single step”</h1>

                    <Link href={"/landing"} className="rounded-xl mr-10">
                        <Button  className="rounded-full" variant="filled" color="rgba(0, 133, 57, 1)" radius="xl"><CiUser size={30}/></Button>
                    </Link>
                </header>
                
                <div className="px-20 mb-20">
                    <h1 className="font-serif text-2xl mt-10 ">Hi, name</h1>

                    <div className="grid grid-cols-2 gap-14 mb-16 mt-10 ">
                        <div className="w-auto border-2 border-primary bg-tertiary h-80 rounded-lg justify-start p-2 px-4">

                            <h1 className="font-sans font-semibold text-2xl">Weather Today</h1>
                                <div className="flex justify-around p-10" >
                                    <Image  src="/sun.png" alt="Sun Image" width={180} height={180} />
                                    <div className="self-center">
                                        <h1 className="text-4xl">Sunny</h1>
                                        <h1 className="text-4xl"> 22 C</h1>
                                    </div>
                                </div>
                        </div>
                        <div className="w-auto border-2 border-primary bg-tertiary h-80 rounded-lg justify-start p-2 px-4"> 
                            <h1 className="font-sans font-semibold text-2xl"> Distance covered</h1>
                            <BarChart/>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="w-auto border-2 border-primary bg-tertiary h-60 flex flex-col justify-between rounded-lg  p-2 px-4 ">
                            <FaRegHeart size={26}/>
                            <h1 className="font-sans self-center text-4xl">75 bpm</h1>
                            <h1 className="font-sans font-semibold text-lg">Pulse</h1>
                           
                        </div>
                        <div className="w-auto border-2 border-primary bg-tertiary h-60 flex flex-col justify-between rounded-lg p-2 px-4 ">
                            <AiOutlineFire size={30}/>
                            <h1 className="font-sans self-center text-4xl">580 cal</h1>
                            <h1 className="font-sans font-semibold text-lg">Calories</h1>
                        </div>
                        <div className="w-auto border-2 border-primary bg-tertiary h-60 flex flex-col justify-between rounded-lg p-2 px-4 ">
                            <SlDrop  size={27}/>
                            <h1 className="font-sans self-center text-4xl">88%</h1>
                            <h1 className="font-sans font-semibold  text-lg">Hydration</h1>
                        </div>
                    </div>
                </div>
            </div>
        </main>


    )
}



