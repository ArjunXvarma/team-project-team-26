"use client";
import Link from "next/link";
import Cookie from "js-cookie";
import { API_URL } from "@/constants";
import { useEffect, useState } from "react";
import { Button, Switch } from "@mantine/core";
import { useTheme } from "@/components/theme-provider";
import { showErrorMessage, showSuccessMessage } from "@/utils";
import { CurrentMembership, GetUserPrivacyAPIResponse } from "@/types";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const [privacyMode, setPrivacyMode] = useState<"Public" | "Private">("Public");
  const [currentMembership, setCurrentMembership] = useState<CurrentMembership>();
  const [billingCycle, setBillingCycle] = useState<{ next_billing_cycle_date: String }>();
  const [pendingMembership, setpendingMembership] = useState<{
    pending_membership_type: String | null;
    pending_membership_duration: String | null;
  }>();

  const getCurrentMembership = async () => {
    try {
      const token = Cookie.get("token");
      const response = await fetch(`${API_URL}/get_current_membership`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });

      const membershipResponse = await response.json();
      if (response.status == 200) {
        setCurrentMembership(membershipResponse);
      } else if (response.status == 404) showErrorMessage("Error", "User not found");
    } catch (error) {
      showErrorMessage(
        "Server Error",
        "There was a problem contacting the server. Please try again later."
      );
    }
  };

  const getNextBillingCycle = async () => {
    try {
      const token = Cookie.get("token");
      const response = await fetch(`${API_URL}/get_billing_cycle_date`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });

      const billingResponse = await response.json();
      if (response.status == 200) {
        setBillingCycle(billingResponse);
      }
    } catch (error) {
      showErrorMessage(
        "Server Error",
        "There was a problem contacting the server. Please try again later."
      );
    }
  };

  const getPendingMembership = async () => {
    try {
      const token = Cookie.get("token");
      const response = await fetch(`${API_URL}/get_pending_membership`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });

      const pendingResponse = await response.json();
      if (response.status == 200) {
        setpendingMembership(pendingResponse);
        console.log(pendingMembership);
      }
    } catch (error) {
      showErrorMessage(
        "Server Error",
        "There was a problem contacting the server. Please try again later."
      );
    }
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

  const cancel = async () => {
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
        showErrorMessage("Error", "Unable to cancel membership plan. Please try again later.");
      } else if (response.status == 401) {
        console.log(cancelResponse.error);
      } else if (response.status == 200) {
        showSuccessMessage("Success", "Auto Renew for your plan was sucessfully disabled");
        getCurrentMembership();
      }
    } catch (error) {
      console.log(error);
      showErrorMessage(
        "Server Error",
        "There was a problem contacting the server. Please try again later."
      );
    }
  };

  useEffect(() => {
    getPrivacySetting();
    getCurrentMembership();
    if (currentMembership?.auto_renew) getNextBillingCycle();
    getPendingMembership();
  }, [currentMembership?.auto_renew]);

  useEffect(() => {
    setIsAdmin(Cookie.get("isAdmin") === "true");
  }, []);

  const gradient = {
    background: "linear-gradient(#3B8B5D, #04372C)",
  };

  return (
    <main>
      <div className="min-h-screen">
        <div className="flex flex-col flex-shrink gap-10 justify-center mt-20 md:mx-20 mx-3">
          <div
            className={`flex justify-between items-center drop-shadow-sharp rounded-3xl p-8 w-full ${
              theme == "dark" ? "bg-[#1B2733] text-white" : "bg-white"
            }`}
          >
            <div className="ml-2">
              <p
                className={`text-xl self-start mb-2 -ml-2 font-semibold ${
                  theme == "dark" ? "text-[#5FE996]" : "text-primary"
                }`}
              >
                Modify Membership Plan
              </p>

              <p>
                Current Membership: {currentMembership?.membership_type} -
                {currentMembership?.membership_duration}
              </p>
              {currentMembership?.auto_renew ? (
                <div>
                  <p> Auto Renew: On</p>
                  <p>
                    Plan Active from:{" "}
                    {currentMembership?.start_date
                      ?.slice(0, 10)
                      .split("-")
                      .reverse()
                      .join("-")}
                  </p>
                  <p>
                    Next Billing Cycle:{" "}
                    {billingCycle?.next_billing_cycle_date
                      ?.slice(0, 10)
                      .split("-")
                      .reverse()
                      .join("-")}
                  </p>
                  {pendingMembership?.pending_membership_duration && (
                    <p>
                      Next Plan: {pendingMembership.pending_membership_type} -
                      {pendingMembership.pending_membership_duration}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p> Auto Renew: Off</p>
                  <p>
                    Current Plan ends at:
                    {currentMembership?.end_date?.slice(0, 10).split("-").reverse().join("-")}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={cancel} className="rounded-full" style={gradient}>
                Cancel Plan
              </Button>
              <Link href={"/updatePlan"}>
                <Button className="rounded-full" style={gradient}>
                  Change Plan
                </Button>
              </Link>
            </div>
          </div>

          <div
            className={`flex justify-between items-center drop-shadow-sharp rounded-3xl p-8 w-full ${
              theme == "dark" ? "bg-[#1B2733] text-white" : "bg-white"
            }`}
          >
            <p
              className={`text-xl self-start font-semibold ${
                theme == "dark" ? "text-[#5FE996]" : "text-primary"
              }`}
            >
              Dark Mode
            </p>
            <div className="flex items-center gap-5">
              <div
                className={` px-3 p-1 rounded-lg font-bold ${
                  theme == "dark" ? "bg-[#293d53]" : "bg-[#f1f1f1] text-[#1d2732]"
                }`}
              >
                ctrl + L
              </div>
              <Switch
                size="lg"
                onLabel="ON"
                offLabel="OFF"
                onChange={toggleTheme}
                checked={theme == "dark"}
                color={theme == "dark" ? "green" : "gray"}
              />
            </div>
          </div>

          <div
            className={`flex justify-between items-center drop-shadow-sharp rounded-3xl p-8 w-full ${
              theme == "dark" ? "bg-[#1B2733] text-white" : "bg-white"
            }`}
          >
            <p className="text-xl">Logout</p>
            <Link prefetch={false} href={"/logout"}>
              <Button color="red" className="rounded-full">
                Sign Out
              </Button>
            </Link>
          </div>
          <div
            className={`flex justify-between items-center drop-shadow-sharp rounded-3xl p-8 w-full ${
              theme == "dark" ? "bg-[#1B2733] text-white" : "bg-white"
            }`}
          >
            <p className="text-xl">
              Privacy Setting: <span className="font-bold text-primary">{privacyMode}</span>
            </p>
            <Button onClick={changePrivacyMode} className="rounded-full" style={gradient}>
              Make {privacyMode == "Public" ? "Private" : "Public"}
            </Button>
          </div>

          {isAdmin && (
            <div
              className={`flex justify-between items-center drop-shadow-sharp rounded-3xl p-8 w-full ${
                theme == "dark" ? "bg-[#1B2733] text-white" : "bg-white"
              }`}
            >
              <p className="text-xl">Switch to admin mode</p>
              <Button component="a" href="/admin" className="rounded-full" style={gradient}>
                Admin Mode
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
