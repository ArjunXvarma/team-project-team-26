"use client";
import Link from "next/link";
import { ReactNode } from "react";
import { FaGear } from "react-icons/fa6";
import { MdLogout } from "react-icons/md";
import { FaHome, FaMapMarkedAlt, FaUserFriends } from "react-icons/fa";

interface NavbarProps {
  children: ReactNode;
}

export default function Navbar({ children }: NavbarProps) {
  return (
    <div className="flex w-screen h-screen">
      <div className="bg-primary w-96 flex flex-col items-center">
        <h1 className="text-white font-black text-3xl mt-28">My App</h1>
        <div className="mt-36 flex flex-col gap-5">
          <Link href={"/"}>
            <div className="text-white flex gap-3 font-medium w-48 p-5 rounded-xl hover:bg-green-800">
              <FaHome size={32} />
              <p className="text-xl">Home</p>
            </div>
          </Link>
          <Link href={"/journeys"} prefetch={true}>
            <div className="text-white flex gap-3 font-medium w-48 p-5 rounded-xl hover:bg-green-800">
              <FaMapMarkedAlt size={32} />
              <p className="text-xl">Journeys</p>
            </div>
          </Link>
          <Link href={"/friends"}>
            <div className="text-white flex gap-3 font-medium w-48 p-5 rounded-xl hover:bg-green-800">
              <FaUserFriends size={32} />
              <p className="text-xl">Friends</p>
            </div>
          </Link>
          <Link href={"/settings"}>
            <div className="text-white flex gap-3 font-medium w-48 p-5 rounded-xl hover:bg-green-800">
              <FaGear size={32} />
              <p className="text-xl">Settings</p>
            </div>
          </Link>
        </div>
        <Link href={"/logout"} prefetch={false} className=" mt-20">
          <div className="text-red-500 flex gap-3 font-medium w-48 p-5 rounded-xl hover:bg-green-800">
            <MdLogout size={32} />
            <p className="text-xl">Logout</p>
          </div>
        </Link>
      </div>
      <div className="w-full"> {children}</div>
    </div>
  );
}
