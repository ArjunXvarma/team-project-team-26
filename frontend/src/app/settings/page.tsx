"use client";
import Link from "next/link";
import Cookie from "js-cookie";
import { API_URL } from "@/constants";
import { Button } from "@mantine/core";
import { Switch } from "@mantine/core";
import { MdLogout } from "react-icons/md";
import { useEffect, useState } from "react";
import { BiSolidError } from "react-icons/bi";
import { UnstyledButton } from "@mantine/core";
import { FaArrowRightLong } from "react-icons/fa6";
import { GetUserPrivacyAPIResponse } from "@/types";
import { notifications } from "@mantine/notifications";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { showErrorMessage, showSuccessMessage } from "@/utils";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [adminMode, setAdminMode] = useState(false);

  const [isAdmin, setIsAdmin] = useState(Cookie.get("isAdmin") === "true");
  const [privacyMode, setPrivacyMode] = useState<"Public" | "Private">("Public");

  const handleDarkModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDarkMode(event.currentTarget.checked);
  };

  const getPrivacySetting = async () => {
    try {
      const token = Cookie.get("token");
      const response = await fetch(`${API_URL}/privacy_status`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });

      let data: GetUserPrivacyAPIResponse = await response.json();

      if (!data.account_type) {
        setPrivacyMode("Public");
      } else {
        setPrivacyMode("Private");
      }
    } catch (error) {
      showErrorMessage(
        "Server Error",
        "There was a problem contacting the server. Please try again later."
      );
    }
  };

  const changePrivacyMode = async () => {
    try {
      const token = Cookie.get("token");
      const response = await fetch(`${API_URL}/update_privacy`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ isPrivate: privacyMode == "Public" }),
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        getPrivacySetting();
        showSuccessMessage("Success", "Privacy settings updated");
      }
    } catch (error) {
      showErrorMessage(
        "Server Error",
        "There was a problem contacting the server. Please try again later."
      );
    }
  };

  const handleAdminModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAdminMode(event.currentTarget.checked);
  };

  const submit = async () => {
    try {
      const token = Cookie.get("token");
      const response = await fetch(`${API_URL}/cancel_membership`, {
        method: "DELETE",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
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
      } else if (response.status == 200) {
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
  };

  useEffect(() => {
    getPrivacySetting();
  }, []);
  return (
    <main>
      <div className="min-h-screen">
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

        <div className="flex flex-col flex-shrink gap-10 justify-center mt-20 mx-20">
          <div className="flex justify-between items-center bg-white drop-shadow-sharp rounded-xl p-8  w-full">
            <p className="text-xl"> Cancel Membership Plan</p>
            <UnstyledButton onClick={submit}>
              <FaArrowRightLong size={38} color="green"/>
            </UnstyledButton>
          </div>
          <div className="flex justify-between items-center bg-white drop-shadow-sharp rounded-xl p-8  w-full">
            <p className="text-xl"> Dark Mode</p>
            <Switch
              color={darkMode ? "green" : "gray"}
              size="lg"
              onLabel="ON"
              offLabel="OFF"
              checked={darkMode}
              onChange={handleDarkModeChange}
            />
          </div>
          <div className="flex justify-between items-center bg-white drop-shadow-sharp rounded-xl p-8  w-full">
            <p className="text-xl">
              Privacy Setting: <span className="font-bold text-primary">{privacyMode}</span>
            </p>
            <Button onClick={changePrivacyMode} className="bg-primary hover:bg-green-900">
              Make {privacyMode == "Public" ? "Private" : "Public"}
            </Button>
          </div>
          {isAdmin && (
            <div className="flex justify-between items-center bg-tertiary rounded-lg p-8  w-full">
              <p className="text-xl">Switch to admin mode</p>
              <Button component="a" href="/admin" className="bg-primary">
                Admin Mode
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
