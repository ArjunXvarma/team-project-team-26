"use client";
import Link from "next/link";
import Cookies from "js-cookie";
import { Modal } from "@mantine/core";
import { API_URL } from "@/constants";
import { Button } from "@mantine/core";
import { CiUser } from "react-icons/ci";
import { FaCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { FaRegUser } from "react-icons/fa";
import { Accordion } from "@mantine/core";
import { MdLogout } from "react-icons/md";
import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { BiSolidError } from "react-icons/bi";
import { useDisclosure } from "@mantine/hooks";
import { HiArrowLongRight } from "react-icons/hi2";
import { notifications } from "@mantine/notifications";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { Input, CloseButton, Autocomplete } from "@mantine/core";

export default function Friends() {
  const [value, setValue] = useState("");
  const [email, setEmail] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  const [options, setOptions] = useState<{ name: String }[]>([]);
  const [friendList, setFriendList] = useState<{ name: String; email: String }[]>([]);
  const [friendRequests, setFriendRequests] = useState<{ name: String; email: String }[]>([]);

  interface Friend {
    name: string;
    email: string;
  }

  useEffect(() => {
    const fetchData = async () => {
      await friendReqList();
      await friendsList();
    };

    fetchData();
  }, []);

  const friendReqList = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(`${API_URL}/list_friend_requests`, {
        method: "GET",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });

      const listResponse = await response.json();

      if (response.status == 401) {
        console.log(listResponse.error);
      } else {
        const requestInfo = listResponse.pending_requests;
        if (requestInfo) {
          setFriendRequests(
            requestInfo.map((request: Friend) => ({
              name: request.name,
              email: request.email,
            }))
          );
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
        headers: { Authorization: `Bearer ${token}` },
      });

      const friendListResponse = await response.json();
      console.log(friendListResponse);
      if (response.status == 200) {
        const friendInfo = friendListResponse.friends;
        if (friendInfo) {
          setFriendList(
            friendInfo.map((friend: Friend) => ({
              name: friend.name,
              email: friend.email,
            }))
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const accept = async (email: string) => {
    try {
      const token = Cookies.get("token");

      const response = await fetch(`${API_URL}/accept_friend_request`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email: email,
        }),
      });
      const acceptResponse = await response.json();

      if (response.status == 200) {
        console.log(acceptResponse.error);
        notifications.show({
          color: "green",
          title: "Success",
          icon: <IoMdCheckmarkCircleOutline />,
          message: "Friended Sucessfully",
        });
        setTimeout(function () {
          window.location.reload();
        }, 1000);
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

  const reject = async (email: string) => {
    try {
      const token = Cookies.get("token");

      const response = await fetch(`${API_URL}/reject_friend_request`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email: email,
        }),
      });
      const acceptResponse = await response.json();

      if (response.status == 200) {
        console.log(acceptResponse.error);
        notifications.show({
          color: "green",
          title: "Success",
          icon: <IoMdCheckmarkCircleOutline />,
          message: "Friendship Request Declined",
        });
        setTimeout(function () {
          window.location.reload();
        }, 1500);
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

  const addFriend = async (email: string) => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(`${API_URL}/send_friend_request`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email: email,
        }),
      });
      const addResponse = await response.json();

      if (response.status == 200) {
        console.log(addResponse.error);
        notifications.show({
          color: "green",
          title: "Success",
          icon: <IoMdCheckmarkCircleOutline />,
          message: "Friend Request Sucessfully Sent",
        });
      } else {
        console.log(addResponse.error);
        notifications.show({
          color: "red",
          title: "Error",
          icon: <BiSolidError />,
          message: addResponse.error,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchOptions = async (inputValue: String) => {
    const len = inputValue.length;
    const op = [];
    for (const i in friendList) {
      const name = friendList[i].name;
      if (name.substring(0, len).toLowerCase().trim() == inputValue) {
        op.push({ name: name });
      }
    }
    setOptions(op);
  };
  const gradient = {
    background: 'linear-gradient(#3B8B5D, #04372C)'
  };
  
  return (
    <main>
      <div className="min-h-screen bg-background">
        <header className="flex w-full h-20 justify-around items-center pt-6">

          <div className="flex w-full h-20 items-center px-5">
            <p className="text-center text-lg font-serif flex-grow">
              “Every journey begins with a single step”
            </p>
            <Link href={"/logout"} prefetch={false} className="ml-auto flex items-center">
              <p className="text-xl font-semibold text-green-700 hover:text-green-900 mr-2">Logout</p>
              <MdLogout size={24} color="green" />
            </Link>
          </div> 
        </header>

        <div className="flex flex-col mx-28 pt-10 ">
          <div>
            <Autocomplete
              label="Friend name"
              placeholder="Search for a friend"
              leftSection={<IoIosSearch size={26} />}
              data={options.map((option) => ({
                label: option.name,
                value: option.name.toString(),
              }))}
              value={value}
              onChange={(newValue) => {
                setValue(newValue);
                fetchOptions(newValue);
              }}
              rightSection={<CloseButton onClick={() => setValue("")} />}
              // onSelect not working
              rightSectionPointerEvents="all"
              size="lg"
            />
          </div>

          {friendRequests.length != 0 && (
            <div className="mt-10">
              <Accordion>
                <Accordion.Item value="Pending Requests">
                  <Accordion.Control className="text-2xl font-semibold font-domine">
                    Pending Friend Requests
                  </Accordion.Control>
                  <Accordion.Panel>
                    <div className="flex gap-4">
                      {friendRequests.map((request, index) => (
                        <div
                          key={index}
                          className="flex items-center  gap-2 bg-tertiary p-4 rounded-md"
                        >
                          <div className="bg-primary rounded-full p-2">
                            <FaRegUser color={"white"} size={24} />
                          </div>
                          <p className="text-2xl">{request.name}</p>
                          <Button
                            onClick={() => accept(request.email.toString())}
                            variant="transparent"
                          >
                            {" "}
                            <FaCheck color={"green"} size={26} />
                          </Button>
                          <CloseButton
                            onClick={() => reject(request.email.toString())}
                            variant="transparent"
                            icon={<RxCross2 color={"red"} size={28} />}
                          />
                        </div>
                      ))}
                    </div>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </div>
          )}

          <div className="flex flex-col mt-10 h-max">
            <div className="flex justify-between">
              <p className="text-2xl font-domine ">Friends</p>
              <div>
                <Modal opened={opened} onClose={close} withCloseButton={false} centered>
                  <p className="text-lg mb-4">Enter friends email address:</p>
                  <Input
                    size="md"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  ></Input>
                  <div className="flex justify-center mt-4">
                    <Button
                      className="bg-primary"
                      onClick={() => {
                        addFriend(email);
                        setEmail("");
                      }}
                    >
                      Send Request
                    </Button>
                  </div>
                </Modal>

                <Button className="bg-primary rounded-full" onClick={open}>
                  Add Friend
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-5 mt-4">
              {friendList &&
                friendList.map((friend, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center gap-3 p-4 rounded-2xl bg-white drop-shadow-sharp"
                  >
                    <div className="bg-primary rounded-full p-2" >
                      <FaRegUser color={"white"} size={24} />
                    </div>
                    <p className="text-2xl">{friend.name}</p>
                    <div className="flex-grow"> </div>
                    <Link href={`/friends/${friend.email}/${friend.name}`}>
                      <HiArrowLongRight size={48} color="gray" />
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
