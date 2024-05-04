"use client";
import Link from "next/link";
import Cookie from "js-cookie";
import "./payment-styles.css";
import { API_URL } from "@/constants";
import { useForm } from "@mantine/form";
import { FaPaypal } from "react-icons/fa";
import { FaApple } from "react-icons/fa6";
import { FaGoogle } from "react-icons/fa6";
import { FaAlipay } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { BiSolidError } from "react-icons/bi";
import { useSearchParams } from "next/navigation";
import { FaRegCreditCard } from "react-icons/fa6";
import { TextInput, Button } from "@mantine/core";
import React, { useState, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";
import { notifications } from "@mantine/notifications";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { number, expirationDate, cvv } from "card-validator";

export default function Payment() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  interface PaymentMethodData {
    PaymentMethod: string[];
  }

  const [PaymentMethod, setPaymentMethod] = useState<PaymentMethodData | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/enums`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json() as Promise<PaymentMethodData>;
      })
      .then((data) => {
        setPaymentMethod(data);
      })
      .catch((error) => {
        console.error("Error fetching membership data:", error);
      });
  }, []);

  const paymentIcons = [
    // Add more if needed
    { value: "Credit Card", icon: <FaRegCreditCard size={20} /> },
    { value: "Apple Pay", icon: <FaApple size={20} /> },
    { value: "Google Pay", icon: <FaGoogle size={17} /> },
    { value: "PayPal", icon: <FaPaypal size={20} /> },
    { value: "AliPay", icon: <FaAlipay size={20} /> },
  ];

  const searchParams = useSearchParams();
  const name = searchParams.get("selectedPlanName");
  const price = searchParams.get("selectedPlanPrice");
  const duration = searchParams.get("selectedPlanDuration");

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<String | null>(null);

  const submit = async () => {
    setLoading(true);
    try {
      const token = Cookie.get("token");
      console.log(token);

      const response = await fetch(`${API_URL}/buy_membership`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          membership_type: name,
          duration: duration,
          mode_of_payment: selectedPaymentMethod,
        }),
      });

      const purchaseResponse = await response.json();
      // handle errors
      if (response.status == 400) {
        console.log(purchaseResponse.error);
        notifications.show({
          color: "red",
          title: "Error",
          icon: <BiSolidError />,
          message: purchaseResponse.error,
        });
      } else if (response.status == 401) {
        console.log(purchaseResponse.error);
      } else {
        notifications.show({
          color: "green",
          title: "Success",
          icon: <IoMdCheckmarkCircleOutline />,
          message: "Purchased Membership",
        });
        router.push("/thankyou");
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

    setLoading(false);
  };

  const form = useForm({
    initialValues: { name: "", cardNo: "", date: "", cvv: "" },
    validate: {},
  });

  return (
    <main>
      <div
        className={`w-full min-h-screen ${
          theme == "dark" ? "bg-dk_background" : "bg-background"
        }`}
      >
        <header className="justify-around items-center pt-10 flex-grow">
          <p
            className={`text-center text-4xl font-semibold pb-6 font-serif ${
              theme == "dark" ? "text-white" : "text-black"
            }`}
          >
            Payment Details
          </p>
        </header>

        <div className=" flex justify-center mt-4">
          <div
            className={`w-fit flex drop-shadow-sharp rounded-md p-4 ${
              theme == "dark" ? "bg-[#1B2733]" : "bg-white"
            }`}
          >
            <p className={`text-lg ${theme == "dark" ? "text-[#787878]" : "text-black"}`}>
              Selected Plan: &nbsp;{" "}
            </p>
            <p
              className={`font-semibold text-lg  ${
                theme == "dark" ? "text-[#5FE996]" : "text-green-800"
              }`}
            >
              {name} - {price}
            </p>
            <p
              className={`font-semibold text-lg  ${
                theme == "dark" ? "text-[#5FE996]" : "text-green-800"
              }`}
            >
              {duration}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 m-10">
          {PaymentMethod &&
            PaymentMethod.PaymentMethod.map((type) => (
              <Button
                key={type}
                radius="sm"
                variant="filled"
                onClick={() => setSelectedPaymentMethod(type)}
                className={`drop-shadow-sharp hover:bg-green-600 
                ${theme == "dark" ? " select-button-dark " : " select-button-light "}
                ${selectedPaymentMethod === type ? "selected-button" : ""}`}
              >
                {paymentIcons.find((icon) => icon.value === type)?.icon}
                &nbsp;
                {type}
              </Button>
            ))}
        </div>

        <div className="flex justify-center items-center mt-6">
          {selectedPaymentMethod == "Credit Card" ? (
            <form className="flex flex-col gap-6">
              <TextInput
                required
                size="md"
                type="Name"
                placeholder="Name on card"
                {...form.getInputProps("name")}
                className={`drop-shadow-md ${theme == "dark" ? "dark-input" : "tahir"}`}
              />

              <TextInput
                required
                size="md"
                type="Card Number"
                placeholder="Card number"
                {...form.getInputProps("cardNo")}
                className={`drop-shadow-md ${theme == "dark" ? "dark-input" : ""}`}
              />

              <div className="flex gap-3">
                <TextInput
                  required
                  size="md"
                  type="text"
                  placeholder="MM/YY"
                  {...form.getInputProps("date")}
                  className={`drop-shadow-md ${theme == "dark" ? "dark-input" : ""}`}
                />
                <TextInput
                  required
                  type="CVV"
                  size="md"
                  placeholder="CVV"
                  {...form.getInputProps("cvv")}
                  className={`drop-shadow-md ${theme == "dark" ? "dark-input" : ""}`}
                />
              </div>
              <div className="flex justify-center w-full">
                <Button
                  loading={loading}
                  onClick={submit}
                  className="continue-button"
                  loaderProps={{ type: "dots" }}
                >
                  Continue
                </Button>
              </div>
            </form>
          ) : selectedPaymentMethod !== null ? (
            <div>
              <Button
                loading={loading}
                onClick={submit}
                className="continue-button"
                loaderProps={{ type: "dots" }}
              >
                Continue
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
