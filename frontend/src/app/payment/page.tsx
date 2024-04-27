"use client"
import Link from "next/link";
import Cookie from "js-cookie";
import { API_URL } from "@/constants";
import { useForm } from "@mantine/form";
import { FaPaypal } from "react-icons/fa";
import { FaApple } from "react-icons/fa6";
import { FaGoogle } from "react-icons/fa6";
import { FaAlipay } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { BiSolidError } from "react-icons/bi";
import { useSearchParams} from 'next/navigation';
import { FaRegCreditCard } from "react-icons/fa6";
import { TextInput, Button } from "@mantine/core";
import React, { useState, useEffect } from 'react';
import { notifications } from "@mantine/notifications";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { number, expirationDate, cvv } from 'card-validator';

export default function Payment() {

    const router = useRouter();
    const [loading, setLoading] = useState(false);

    interface PaymentMethodData{
       PaymentMethod: string[];
    }

    const [PaymentMethod, setPaymentMethod] = useState<PaymentMethodData | null>(null);

    useEffect(() => {
        fetch(`${API_URL}/api/enums`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json() as Promise<PaymentMethodData>;
            })
            .then(data => {
                setPaymentMethod(data);
            })
            .catch(error => {
                console.error('Error fetching membership data:', error);
            });
    }, []);

    const paymentIcons = [
        // Add more if needed
        { value: 'Credit Card', icon: <FaRegCreditCard size={20} /> },
        { value: 'Apple Pay', icon: <FaApple size={20} /> },
        { value: 'Google Pay', icon:  <FaGoogle size={17}  />},
        { value: 'PayPal', icon: <FaPaypal size={20} /> },
        { value: 'AliPay', icon: <FaAlipay size={20} />}
    ];
    
    const searchParams = useSearchParams();
    const name = searchParams.get("selectedPlanName");
    const price = searchParams.get("selectedPlanPrice")
    const duration = searchParams.get("selectedPlanDuration")

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<String | null>(null);

    const handlePaymentMethodChange = (method:String) => {
        setSelectedPaymentMethod(method);
    };

    const submit = async () => {
        setLoading(true);
        try {
          const token = Cookie.get('token'); 
          console.log(token);
          
          const response = await fetch(`${API_URL}/buy_membership`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
                membership_type: name,
                duration: duration,
                mode_of_payment: selectedPaymentMethod,
            }),
          });
    
            const purchaseResponse= await response.json();
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

        return ( 
            <main> 
                <div className="w-full min-h-screen bg-background">

                <header className="justify-around items-center pt-10 flex-grow">
                    <p className="text-center text-4xl font-semibold pb-6 font-serif"> Payment Details</p>
                </header>

                <div className=" flex justify-center mt-4">
                    <div className="w-fit flex bg-white drop-shadow-sharp rounded-md p-4 ">
                        <p className="text-lg">Selected Plan: &nbsp; </p>
                        <p className="font-semibold text-lg text-green-800">{name} - {price}</p>
                        <p className="font-semibold text-lg text-green-800">{duration}</p>
                    </div>  
                </div>

                <div className='flex justify-center items-center gap-8 m-10'>
                    {PaymentMethod && PaymentMethod.PaymentMethod.map(type => (
                        <Button className={`bg-green-800 hover:bg-green-600 ${selectedPaymentMethod === type ? 'bg-green-600' : ''}`} key={type} onClick={() => handlePaymentMethodChange(type)}>
                            {paymentIcons.find(icon => icon.value === type)?.icon}
                            &nbsp;
                            {type}
                        </Button>
                    ))}
                </div>

                <div className="flex justify-center items-center mt-6">
                    {selectedPaymentMethod == "Credit Card" ? 
                    <CreditCardForm/> :
                        ( selectedPaymentMethod !== null ? 
                                <div>
                                    <Button loading={loading} loaderProps={{ type: 'dots' }} onClick={submit} className="bg-green-600 hover:bg-green-700" >Continue</Button>
                                </div>
                            :
                            null
                        )
                    
                    }
                </div>
                
            </div>  
        </main>
     );
        
}


function CreditCardForm() {

    const form = useForm({
        initialValues: { name: "", cardNo: "", date: "", cvv: ""},
        validate: {
            name: (value) => (value.length !== 0 ? null : "Enter name on card"),
            cardNo: (value) => {
                const isValid = number(value, {maxLength: 16}).isValid;
                return isValid ? null : "Enter a valid card number";
            },
             date: (value) => { 
                const expiration = expirationDate(value);
                if (!expiration.isValid) {
                    return 'Invalid expiration date';
                }
                else
                    return null;
            },
            cvv: (value) => {
                const isValid = cvv(value, 3).isValid;
                return isValid ? null : "Invalid security code (CVV must be a 3-digit number)";
            },
        },
    });

    return (
       
        <form className="flex flex-col gap-6">
                <TextInput
                    label="Name"
                    required
                    type="Name"
                    size="md"
                    className="text-white w-full "
                    placeholder="Name on card"
                    {...form.getInputProps("name")}
                />

                <TextInput
                    label="Card Number"
                    required
                    type="Card Number"
                    size="md"
                    className="text-white w-full "
                    placeholder="Card number"
                    {...form.getInputProps("cardNo")}

                />
            
                <div className="flex gap-3">
                    <TextInput
                        label="Card expiry"
                        required
                        type="text"
                        size="md"
                        className="text-white w-fit "
                        placeholder="MM/YY"
                        {...form.getInputProps("date")}
                    />
                    <TextInput
                        label="CVV"
                        required
                        type="CVV"
                        size="md"
                        className="text-white w-fit "
                        placeholder="CVV"
                        {...form.getInputProps("cvv")}
                    />
                </div>
            
              
            {form.isValid() && (
                <div className="flex justify-center mt-6">
                     <Link href={"/thankyou"}>
                        <Button color="#2EAE69">Continue</Button>
                    </Link>
                </div>
            )}
          </form>
    );
}