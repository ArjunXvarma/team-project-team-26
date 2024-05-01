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
  background: "linear-gradient(#3B8B5D, #04372C)",
};

export default function Navbar({ children }: NavbarProps) {
  return (
    <div className="flex bg-background">
      <div>
        <button
          data-drawer-target="default-sidebar"
          data-drawer-toggle="default-sidebar"
          aria-controls="default-sidebar"
          type="button"
          className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        >
          <span className="sr-only">Open sidebar</span>
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clip-rule="evenodd"
              fill-rule="evenodd"
              d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
            ></path>
          </svg>
        </button>
      </div>
      <aside
        id="default-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div
          className="my-5 rounded-3xl w-64 flex flex-col items-center h-full"
          style={gradient}
        >
          <Link href={"/"}>
            <h1 className="text-white font-black text-3xl mt-20">FitFusion</h1>
            <hr />
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
          {/* <Link href={"/logout"} prefetch={false} className=" mt-16">
          <div className="text-red-500 flex justify-center gap-3 font-medium w-48 p-5 rounded-lg hover:bg-hover">
            <MdLogout size={32} />
            <p className="text-xl">Logout</p>
          </div>
        </Link> */}
        </div>
      </aside>
      <div className="p-4 sm:ml-64 flex-grow">{children}</div>
    </div>
  );
}
