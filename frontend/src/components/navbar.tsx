"use client";
import Link from "next/link";
import { ReactNode } from "react";
import { FaGear } from "react-icons/fa6";
import { MdLogout } from "react-icons/md";
import { FaHome, FaMapMarkedAlt, FaUserFriends } from "react-icons/fa";

interface NavbarProps {
  children: ReactNode;
}
const gradient = {
  background: 'linear-gradient(#3B8B5D, #04372C)'
};

export default function Navbar({ children }: NavbarProps) {
  return (
    <div className="flex bg-background">
      <div className="m-2 rounded-3xl w-64 flex flex-col items-center fixed top-0 bottom-0 left-0 overflow-y-auto" style={gradient}>
      <Link href={"/"}>
        <h1 className="text-white font-black text-3xl mt-20">FitFusion</h1>
        <hr/>
      </Link>
        <div className="mt-20 flex flex-col gap-6 justify-around">
          <Link href={"/dashboard"}>
            <div className="text-white flex justify-center gap-3 font-medium w-48 p-5 rounded-lg hover:bg-hover">
              <FaHome size={32} />
              <p className="text-xl">Home</p>
            </div>
          </Link>
          <Link href={"/journeys"} prefetch={true}>
            <div className="text-white flex justify-center gap-3 font-medium w-48 p-5 rounded-lg hover:bg-hover">
              <FaMapMarkedAlt size={32} />
              <p className="text-xl">Journeys</p>
            </div>
          </Link>
          <Link href={"/friends"}>
            <div className="text-white flex justify-center gap-3 font-medium w-48 p-5 rounded-lg hover:bg-hover">
              <FaUserFriends size={32} />
              <p className="text-xl">Friends</p>
            </div>
          </Link>
          <Link href={"/settings"}>
            <div className="text-white flex justify-center gap-3 font-medium w-48 p-5 rounded-lg hover:bg-hover">
              <FaGear size={32} />
              <p className="text-xl">Settings</p>
            </div>
          </Link>
        </div>
      </div>
      <div className="flex-grow ml-72">{children}</div>
    </div>
  );
}
