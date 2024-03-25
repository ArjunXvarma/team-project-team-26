"use client";
import Link from "next/link";
import { ReactNode } from "react";
import { FaGear, FaUsers } from "react-icons/fa6";
import { MdLogout } from "react-icons/md";
import { FaHome, FaMapMarkedAlt } from "react-icons/fa";
import { CiUser } from "react-icons/ci";
import { PiMoneyThin } from "react-icons/pi";

interface NavbarProps {
  children: ReactNode;
}

export default function AdminNavbar({ children }: NavbarProps) {
  return (
    <div className="flex w-screen h-screen">
      <div className="bg-primary w-96 flex flex-col items-center">
        <h1 className="text-white font-black text-3xl mt-28">My App</h1>
        <div className="mt-36 flex flex-col gap-5">
          <Link href={"/admin"}>
            <div className="text-white flex gap-3 font-medium w-48 p-5 rounded-xl hover:bg-green-800">
              <FaUsers size={32} />
              <p className="text-xl">Users</p>
            </div>
          </Link>
          <Link href={"/admin/revenue"} prefetch={true}>
            <div className="text-white flex gap-3 font-medium w-48 p-5 rounded-xl hover:bg-green-800">
              <PiMoneyThin size={32} />
              <p className="text-xl">Revenue</p>
            </div>
          </Link>
          <Link href={"/"}>
            <div className="text-white flex gap-3 font-medium w-48 p-5 rounded-xl hover:bg-green-800">
              <CiUser size={32} />
              <p className="text-xl">User Mode</p>
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
