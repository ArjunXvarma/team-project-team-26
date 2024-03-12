"use client"
import Link from "next/link";
import Cookies from "js-cookie";
import { CiUser} from "react-icons/ci";
import { Button } from "@mantine/core";
import { API_URL } from "@/constants";
import { FaCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { FaRegUser } from "react-icons/fa";
import { Accordion, UnstyledButton } from '@mantine/core';
import { notifications } from "@mantine/notifications";
import { IoIosSearch } from "react-icons/io";
import { HiArrowLongRight } from "react-icons/hi2";
import { AuthAPIResponse } from "@/types";
import { BiSolidError } from "react-icons/bi";
import { useState, useEffect } from 'react';
import { Input, CloseButton } from '@mantine/core';
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

export default function Friends() {

    const [value, setValue] = useState("");
    const [friendRequests, setFriendRequests] = useState<string[]>([]);
    const [friendList, setFriendList] = useState<string[]>([]);


    useEffect(() => {
        const friendReqList = async () => {
            try {
            const token = Cookies.get("token"); 
            const response = await fetch(`${API_URL}/list_friend_requests`, {
                method: "GET",
                credentials: "include",
                headers: { "Authorization": `Bearer ${token}` }
            });
        
                const listResponse: AuthAPIResponse = await response.json();
                // handle errors
                if (response.status == 401) {
                    console.log(listResponse.error);
                
                } else{
                    const requestInfo = listResponse.pending_requests;
                    if(requestInfo)
                    {
                            setFriendRequests(prevFriendRequests => (
                            requestInfo.map(request => ({
                                name: request.name,
                                email: request.email
                            })).concat(prevFriendRequests)
                        ));
                    }
                } 

            } catch (error) {
            console.log(error);
            }

        };
        const friendsList = async () => {
            try {
            const token = Cookies.get("token"); 
            console.log(token);
            const response = await fetch(`${API_URL}/list_friends`, {
                method: "GET",
                credentials: "include",
                headers: { "Authorization": `Bearer ${token}` }
            });
        
                const friendListResponse: AuthAPIResponse = await response.json();
                // handle errors
                if (response.status == 200) {
                    const friendInfo = friendListResponse.friends;
                    if(friendInfo)
                   { 
                        setFriendList(prevFriendRequests => (
                            friendInfo.map(friend => ({
                                name: friend.name,
                                email: friend.email
                            })).concat(prevFriendRequests)
                        ));
                    }
                } 

            } catch (error) {
            console.log(error);
            }

        };
        friendReqList(); 
        friendsList();

    }, []); 


    const accept = async (email:string) => {
        try {
        const token = Cookies.get("token"); 

        const response = await fetch(`${API_URL}/accept_friend_request`, {
            method: "POST",
            credentials: "include",
            headers: {  "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
                email: email
            }),
        });
            const acceptResponse: AuthAPIResponse = await response.json();

            if (response.status == 200) {
                console.log(acceptResponse.error);
                notifications.show({
                    color: "green",
                    title: "Success",
                    icon: <IoMdCheckmarkCircleOutline />,
                    message: "Friended Sucessfully",
                    });
            } else {
                console.log(acceptResponse.error);
                notifications.show({
                    color: "red",
                    title: "Error",
                    icon: <BiSolidError />,
                    message: acceptResponse.error,
                });
            }   

        } catch (error) {
        console.log(error);
        }
    };


    const reject = async (email:string) => {
        try {
        const token = Cookies.get("token"); 

        const response = await fetch(`${API_URL}/accept_friend_request`, {
            method: "POST",
            credentials: "include",
            headers: {  "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
                email: email
            }),
        });
            const acceptResponse: AuthAPIResponse = await response.json();

            if (response.status == 200) {
                console.log(acceptResponse.error);
                notifications.show({
                    color: "green",
                    title: "Success",
                    icon: <IoMdCheckmarkCircleOutline />,
                    message: "Friendship Request Declined",
                    });
            } else {
                console.log(acceptResponse.error);
                notifications.show({
                    color: "red",
                    title: "Error",
                    icon: <BiSolidError />,
                    message: acceptResponse.error,
                });
            }   

        } catch (error) {
        console.log(error);
        }
    };
    return ( 

        <main> 
            <div className="w-full h-full">
                <header className="flex w-full h-20 justify-around items-center pt-6">
                    <div className="flex flex-col w-full flex-grow">
                        <p className="text-center text-3xl font-semibold font-domine">Friends</p>
                        <p className="text-center text-lg font-serif">“Every journey begins with a single step”</p>
                    </div>

                    <Link href={"/landing"} className="flex items-center rounded-xl mr-10">
                        <p className='font-domine font-bold mr-2'>Home</p>
                        <Button  className="rounded-full bg-green-700" variant="filled" color="rgba(0, 133, 57, 1)" radius="xl" >  <CiUser size={30}/></Button>
                    </Link>
                </header>

                <div className="flex flex-col mx-28 pt-10 ">
                    <div className="">
                        <Input
                            placeholder="Friend name" 
                            leftSection={<IoIosSearch size={26}/>} 
                            value={value}
                            onChange={(event) => setValue(event.currentTarget.value)}
                            rightSectionPointerEvents="all"
                            size="lg"
                            rightSection={
                            <CloseButton
                                aria-label="Clear input"
                                onClick={() => setValue('')}
                                style={{ display: value ? undefined : 'none' }}
                            />
                            }
                        />
                    </div>
                    { friendRequests.length != 0  && 
                        <div className="mt-10">
                            <Accordion>
                                <Accordion.Item value="Pending Requests">
                                    <Accordion.Control className="text-2xl font-semibold font-domine">Pending Friend Requests</Accordion.Control>
                                    <Accordion.Panel>
                                        <div className="flex gap-4">
                                        {friendRequests.map((request, index) => (
                                            <div key={index} className="flex items-center  gap-2 bg-tertiary p-4 rounded-md">
                                                <div className="bg-primary rounded-full p-2">
                                                    <FaRegUser color={"white"} size={24}/>
                                                </div>  
                                                <p className="text-2xl">{request.name}</p>
                                                <Button onClick={()=>accept(request.email)} variant="transparent"> <FaCheck color={"green"} size={26}/></Button>
                                                <CloseButton onClick={()=>reject(request.email)} variant="transparent" icon={< RxCross2 color={"red"} size={28}/>}/>
                                            
                                            </div>
                                        ))}
                                        </div>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            </Accordion>
                        </div>
                    }
                    
                    <div className="flex flex-col mt-10 h-max">
                        <p className="text-2xl font-domine ">Friends</p>
                        <div className="flex flex-col gap-5 mt-4">
                            { friendList && friendList.map((friend, index) => (
                                <div key={index} className="flex justify-between items-center gap-3 bg-tertiary p-4 rounded-md">
                                    <div className="bg-primary rounded-full p-2">
                                        <FaRegUser color={"white"} size={24}/>
                                    </div>  

                                    <p className="text-2xl">{friend.name}</p>
                                    <div className="flex-grow">  </div>
                                    <Link href={{ pathname: '/friendInfo', query: { 
                                        friendName: friend.name
                                    }}}>
                                        <HiArrowLongRight size={48} color="gray"/>
                                    </Link>
                                  
                                    {/* <CloseButton variant="transparent" icon={< RxCross2 color={"red"} size={28}/>}/> */}
                                </div>
                            ))}
                        </div>
                    </div>
                   
                </div>
            </div>
        </main>
     );
}

