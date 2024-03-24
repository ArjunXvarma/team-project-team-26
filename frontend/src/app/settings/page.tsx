"use client"
import React, {useState} from 'react';
import Link from "next/link";
import { Button } from "@mantine/core";
import { CiUser} from "react-icons/ci";
import { FaArrowRightLong } from "react-icons/fa6";
import { UnstyledButton } from '@mantine/core';
import { Switch } from '@mantine/core';
import { useRouter } from "next/navigation";
import { SegmentedControl } from '@mantine/core';
import { API_URL } from "@/constants";
import { BiSolidError } from "react-icons/bi";
import Cookie from "js-cookie";
import { notifications } from "@mantine/notifications";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

export default function Settings() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [darkMode, setDarkMode] = useState(false);
    const [allowFriends, setAllowFriends] = useState<string>('no');
    const [adminMode, setAdminMode] = useState(false);

    const handleDarkModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDarkMode(event.currentTarget.checked);
    };

    const handleAllowFriendsChange = (value: string) => {
        setAllowFriends(value);
    };

    const handleAdminModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAdminMode(event.currentTarget.checked);
    };

    const submit = async () => {
        setLoading(true);

        try {
          const token = Cookie.get("token"); 
          const response = await fetch(`${API_URL}/cancel_membership`, {
            method: "DELETE",
            credentials: "include",
            headers: { "Authorization": `Bearer ${token}` },
          });
    
            const cancelResponse = await response.json();
            // handle errors
            if (response.status == 404) {
                console.log(cancelResponse.error);
                notifications.show({
                    color: "red",
                    title: "Error",
                    icon: <BiSolidError />,
                    message: cancelResponse.error,
                });
            } else if (response.status == 401) {
                console.log(cancelResponse.error);

            } else if (response.status == 200){
                notifications.show({
                color: "green",
                title: "Success",
                icon: <IoMdCheckmarkCircleOutline />,
                message: cancelResponse.message,
                });
            }

        } catch (error) {
        console.log(error);
        notifications.show({
            color: "red",
            title: "Server Error",
            icon: <BiSolidError />,
            message: "There was a problem contacting the server. Please try again later.",
        });
        }
        
        setLoading(false);
    };


    return ( 
        <main> 
            <div className="w-full h-full">
                <header className="flex w-full h-20 justify-around items-center pt-6">
                    <p className="text-center text-lg font-serif flex-grow">“Every journey begins with a single step”</p>

                    <Link href={"/landing"} className="flex items-center rounded-xl mr-10">
                        <p className='font-domine font-bold mr-2'>Home</p>
                        <Button  className="rounded-full bg-green-700" variant="filled" color="rgba(0, 133, 57, 1)" radius="xl" >  <CiUser size={30}/></Button>
                    </Link>
                </header>

                <div className='flex flex-col flex-shrink gap-10 justify-center mt-20 mx-20'>
            
                    <div className='flex justify-between items-center bg-tertiary rounded-lg p-8  w-full'>
                            <p className='text-xl'> Cancel Membership Plan</p>
                            <UnstyledButton onClick={submit}>
                                <FaArrowRightLong size={40} />
                            </UnstyledButton>
                    </div>
                    <div className='flex justify-between items-center bg-tertiary rounded-lg p-8  w-full'>
                            <p className='text-xl'> Dark Mode</p>
                            <Switch
                                color={darkMode ? "rgba(5, 150, 105, 1)" : "gray"}
                                size="lg"
                                onLabel="ON" offLabel="OFF"
                                checked={darkMode}
                                onChange={handleDarkModeChange}
                            />
                    </div>
                    <div className='flex justify-between items-center bg-tertiary rounded-lg p-8  w-full'>
                            <p className='text-xl'>Allow friends to view your statistics</p>
                            <SegmentedControl
                                color= "rgba(5, 150, 105, 1)"
                                value={allowFriends}
                                onChange={handleAllowFriendsChange}
                                data={[
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' },
                                ]}
                            />
                    </div>
                    <div className='flex justify-between items-center bg-tertiary rounded-lg p-8  w-full'>
                            <p className='text-xl'>Switch to admin mode</p>
                            <Switch
                                color={adminMode ? "rgba(5, 150, 105, 1)" : "gray"}
                                size="lg"
                                onLabel="ON" offLabel="OFF"
                                checked={adminMode}
                                onChange={handleAdminModeChange}
                        />
                    </div>
                </div>
            </div>
        </main>
     );
}

