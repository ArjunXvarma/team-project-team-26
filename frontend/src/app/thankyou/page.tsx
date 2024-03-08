"use client"
import { Button } from "@mantine/core";
import Link from "next/link";
import { IoMdHome } from "react-icons/io";

export default function Thankyou() {
    return ( 
        <main className="w-screen h-screen bg-primary">
            <div className="flex justify-center p-20"> 
                <div className="flex-col text-center mt-28"> 
                    <h1 className="text-white text-4xl font-semibold">Thank You for joining Us!</h1>
                    <h1 className="text-white text-3xl font-semibold mt-10">View your dashboard</h1>
                    <Link href={'/home'}>
                        <Button color="#2EAE69" className="mt-6 "><IoMdHome size={36}/></Button>
                    </Link>
                </div>
            </div>
           
        </main>
     );
}

