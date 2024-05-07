"use client";
import Link from "next/link";
import { FaUser } from "react-icons/fa";
import { FaUsers } from "react-icons/fa6";
import { ActionIcon } from "@mantine/core";
import { useTheme } from "./theme-provider";
import { ReactNode, useState } from "react";
import { HiMenuAlt3 } from "react-icons/hi";
import "@/components/navbar/navbar-styles.css";
import { FcMoneyTransfer } from "react-icons/fc";

interface NavbarProps {
  children: ReactNode;
}

export default function AdminNavbar({ children }: NavbarProps) {
  const { theme } = useTheme();
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className={`${theme == "dark" ? "bg-[#131B23]" : "bg-[#f1f1f1]"}`}>
      <div className="flex w-full items-center px-3">
        <p
          className={`text-center text-lg font-serif flex-grow mt-5 ${
            theme == "dark" ? "text-white" : "text-black"
          }`}
        >
          "Every journey begins with a single step"
        </p>
        <div className="mt-2 ml-2 md:hidden visible">
          <ActionIcon
            size="lg"
            color="gray"
            variant="transparent"
            aria-controls="sidebar"
            aria-expanded={showSidebar}
            onClick={() => setShowSidebar((o) => !o)}
          >
            <HiMenuAlt3 size={32} />
          </ActionIcon>
        </div>
      </div>

      <aside
        id="sidebar"
        aria-label="Sidebar"
        className={`fixed p-5 top-0 left-0 z-40 w-64 h-screen transition-transform ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div
          className={`h-full min-h-[600px] w-32 flex flex-col justify-between items-center rounded-3xl ${
            theme == "dark"
              ? "navbar-gradient--dark-mode border border-[#5FE996]"
              : "navbar-gradient--light-mode"
          }`}
        >
          <div>
            <Link href={"/"}>
              <h1
                className={`font-semibold text-xl mt-16 font-serif ${
                  theme == "dark" ? "text-[#5FE996]" : "text-white"
                }`}
              >
                FitFusion
              </h1>
              <hr />
            </Link>
          </div>
          <div className="mt-16 flex flex-col h-full gap-10">
            <Link href={"/admin"}>
              <div
                className={`text-white flex justify-center gap-3 font-medium w-20 p-5 rounded-lg hover:bg-${
                  theme == "dark" ? "primary" : "hover"
                }`}
              >
                <FaUsers size={34} />
              </div>
            </Link>

            <Link href={"/admin/revenue"}>
              <div
                className={`text-white flex justify-center gap-3 font-medium w-20 p-5 rounded-lg hover:bg-${
                  theme == "dark" ? "primary" : "hover"
                }`}
              >
                <FcMoneyTransfer size={32} />
              </div>
            </Link>
            <Link href={"/"}>
              <div
                className={`text-white flex justify-center gap-3 font-medium w-20 p-5 rounded-lg hover:bg-${
                  theme == "dark" ? "primary" : "hover"
                }`}
              >
                <FaUser size={26} />
              </div>
            </Link>
          </div>
        </div>
      </aside>
      <div className="p-4 md:ml-32">{children}</div>
    </div>
  );
}
