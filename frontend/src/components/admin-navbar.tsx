"use client";
import Link from "next/link";
import { ReactNode } from "react";
import { FaGear, FaUsers } from "react-icons/fa6";
import { MdLogout } from "react-icons/md";
import { FcMoneyTransfer } from "react-icons/fc";
import { FaHome, FaMapMarkedAlt } from "react-icons/fa";
import { CiUser } from "react-icons/ci";
import { FaUser } from "react-icons/fa";
import { PiMoneyThin } from "react-icons/pi";

interface NavbarProps {
  children: ReactNode;
}

export default function AdminNavbar({ children }: NavbarProps) {
  const gradient = {
    background: 'linear-gradient(#3B8B5D, #04372C)'
  };
  return (
    <div className="flex bg-background">
      <div className="m-2 rounded-3xl w-64 flex flex-col items-center fixed top-0 bottom-0 left-0 overflow-y-auto" style={gradient}>
        <h1 className="text-white font-black text-3xl mt-28">FitFusion</h1>
        <hr/>
        <div className="mt-36 flex flex-col justify-center items-center gap-5">
          <Link href={"/admin"}>
            <div className="text-white flex gap-3 font-medium w-48 p-5 rounded-xl hover:bg-hover">
              <FaUsers size={34} />
              <p className="text-xl">Users</p>
            </div>
          </Link>
          <Link href={"/admin/revenue"} prefetch={true}>
            <div className="text-white flex gap-3 font-medium w-48 p-5 rounded-xl hover:bg-hover">
              <FcMoneyTransfer size={32} />
              <p className="text-xl">Revenue</p>
            </div>
          </Link>
          <Link href={"/"}>
            <div className="text-white flex gap-3 font-medium w-48 p-5 rounded-xl hover:bg-hover">
              <FaUser size={26} />
              <p className="text-xl">User Mode</p>
            </div>
          </Link>
        </div>
        <Link href={"/logout"} prefetch={false} className=" mt-20">
          <div className="text-red-500 flex gap-3 pl-8 font-medium w-48 p-5 rounded-xl hover:bg-hover">
            <MdLogout size={32} />
            <p className="text-xl">Logout</p>
          </div>
        </Link>
      </div>
      <div className="flex-grow ml-72">{children}</div>
    </div>
  );
}
