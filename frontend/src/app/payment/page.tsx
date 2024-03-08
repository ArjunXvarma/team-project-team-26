"use client"
import React, { useState } from 'react';
import { useSearchParams} from 'next/navigation';
import { useForm } from "@mantine/form";
import { TextInput, Button } from "@mantine/core";
import Link from "next/link";
import { number, expirationDate, cvv } from 'card-validator';
import { error } from 'console';



export default function Payment() {
     
    const searchParams = useSearchParams();
    const name = searchParams.get("selectedPlanName");
    const price = searchParams.get("selectedPlanPrice")

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<String | null>(null);

    const handlePaymentMethodChange = (method:String) => {
        setSelectedPaymentMethod(method);
    };

    const paymentMethods = [
        { label: 'Credit Card', value: 'creditCard' },
        { label: 'Apple Pay', value: 'applePay' },
        { label: 'Google Pay', value: 'googlePay' },
        { label: 'PayPal', value: 'paypal' },
        { label: 'Alipay', value: 'alipay' }
    ];
    

      
        return ( 
        <main className="w-screen h-screen bg-primary">
            <div className="w-full h-full">

                <header className="justify-around items-center pt-10 flex-grow">
                    <h1 className="text-center text-4xl font-semibold pb-6 font-serif text-white "> Payment Details</h1>
                </header>

                <div className=" flex justify-center mt-4">
                    <div className="w-fit flex bg-white  rounded-md p-4 ">
                        <h1 className="text-lg">Selected Plan: &nbsp; </h1>
                        <h1 className="font-semibold text-lg">{name} - {price}</h1>
                    </div>  
                </div>

                <div className='flex justify-center items-center text-white gap-10 m-10'>
                    {paymentMethods.map(method => (
                        <label key={method.value}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={method.value}
                                checked={selectedPaymentMethod === method.value}
                                onChange={() => handlePaymentMethodChange(method.value)}
                            />
                            {method.label}
                        </label>
                    ))}
                </div>

                <div className="flex justify-center items-center mt-6">
                    {selectedPaymentMethod === 'creditCard' ? 
                    <CreditCardForm/> :
                        ( selectedPaymentMethod !== null ? 
                                <div>
                                    <Link href={"/thankyou"}>
                                        <Button color="#2EAE69">Continue</Button>
                                    </Link>
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