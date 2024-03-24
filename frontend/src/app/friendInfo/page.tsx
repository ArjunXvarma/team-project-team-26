"use client"
import React, { useState } from 'react';
import { useSearchParams} from 'next/navigation';
import Link from "next/link";
import { CiUser} from "react-icons/ci";
import { Button } from "@mantine/core";
import { SegmentedControl } from '@mantine/core';

function FriendInfo() {

    const searchParams = useSearchParams();
    const name = searchParams.get("friendName");
    const [value, setValue] = useState<string>("journeys");

    return ( 
        <main className="w-screen h-screen">
            <div className="w-full h-full">

                <header className="flex w-full h-20 justify-around items-center mt-6 ">
                    <div className="flex flex-col w-full flex-grow">
                        <p className="text-center text-3xl font-serif ">{name}</p>
                        <p className="text-center text-lg font-serif">“Every journey begins with a single step”</p>
                    </div>
                    <Link href={"/landing"} className="flex items-center rounded-xl mr-10">
                        <p className='font-domine font-bold mr-2'>Home</p>
                        <Button  className="rounded-full bg-green-700" variant="filled" color="rgba(0, 133, 57, 1)" radius="xl" >  <CiUser size={30}/></Button>
                    </Link>
                </header>

                <div className='flex justify-center mt-10'>
                    <SegmentedControl
                        value={value}
                        size="md"
                        color="rgba(55, 130, 82, 1)"
                        onChange={setValue}
                        data={[
                            { label: 'Journeys', value: 'journeys' },
                            { label: 'Statistics', value: 'statistics' }
                        ]}
                        />
                </div>
                
                <div className='flex justify-center mt-10'>
                    { value == "journeys"? (
                        <p>Journeys</p>
                    )
                    :
                    ( 
                        <p>Statistics</p>  
                    )
                    }
                </div>
            </div>
        </main>

     );
}

export default FriendInfo;