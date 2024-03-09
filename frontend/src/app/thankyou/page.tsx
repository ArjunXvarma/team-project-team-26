"use client"
import { Button } from "@mantine/core";
import Link from "next/link";
import { IoMdHome } from "react-icons/io";

export default function Thankyou() {
    return ( 
        <main className="w-screen h-screen bg-primary">
            <div className="flex justify-center p-20"> 
                <div className="flex-col text-center mt-28"> 
                    <p className="text-white text-4xl font-semibold">Thank You for joining Us!</p>
                    <p className="text-white text-3xl font-semibold mt-10">View your dashboard</p>
                    <Link href={'/home'}>
                        <Button className=" mt-6 bg-green-600" ><IoMdHome size={36}/></Button>
                    </Link>
                </div>
            </div>
           
        </main>
     );
}

