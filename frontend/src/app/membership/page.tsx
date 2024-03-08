"use client"
import React, { useState } from 'react';
import { FaArrowRight } from "react-icons/fa";
import { Button } from "@mantine/core";
import Link from "next/link";
import { Select } from '@mantine/core';

export default function Home(){

    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
    const [selectedPlanType, setSelectedPlanType] = useState<String | null>('Monthly');

    const handlePlanTypeChange = (value: String | null) => {
        setSelectedPlanType(value);
    };

    const membershipPlansM = [
      { id: 1, name: 'Basic', price: '£8/month', features: ['Access to basic features is included'] },
      { id: 2, name: 'Standard', price: '£15/month', features: ['Access to some of the features is included'] },
      { id: 3, name: 'Premium', price: '£22/month', features: ['Access to premium features is included'] }
    ];
    const membershipPlansY = [
        { id: 1, name: 'Basic', price: '£80/year', features: ['Access to basic features is included'] },
        { id: 2, name: 'Standard', price: '£120/year', features: ['Access to some of the features is included'] },
        { id: 3, name: 'Premium', price: '£180/year', features: ['Access to premium features is included'] }
      ];
    
    const selectedMembershipPlans = selectedPlanType === 'Monthly' ? membershipPlansM : membershipPlansY;

    const handleSelectPlan = (planId:number) => {
        if (selectedPlan === planId) {
            setSelectedPlan(null); 
        } else {
            setSelectedPlan(planId); 
        }
      };
      
    
    return (
        <main className="md:w-screen md:h-screen sm:w-full sm:h-full bg-primary"> 
            <div className="w-full h-full  bg-primary">

                <header className="justify-around items-center pt-10 flex-grow">
                    <h1 className="text-center text-4xl font-semibold pb-6 font-serif text-white "> Membership</h1>
                    <h1 className="text-center text-lg text-white font-serif ">“Every journey begins with a single step”</h1>
                </header>

                <h1 className="text-2xl text-center text-white font-serif mt-12 mb-6">Choose your membership plan </h1>
                <div className='flex justify-center'>
                    <Select
                        placeholder="Pick type"
                        data={['Monthly', 'Yearly']}
                        className='w-fit'
                        defaultValue="Monthly"
                        onChange={handlePlanTypeChange}
                        allowDeselect={false}
                    />
                </div>  

                <div className="flex justify-center mt-10 gap-2 flex-wrap">
                {selectedMembershipPlans.map(plan => (
                <div key={plan.id} className={`flex flex-col items-center rounded-xl p-6 w-72 h-96 ${selectedPlan === plan.id ? 'bg-membership' : 'bg-white'}`}>
                        <h2 className="text-2xl font-serif mt-2">{plan.name}</h2>
                        <p className="text-xl font-bold mt-4 mb-4">{plan.price}</p>
                        <div className="flex flex-col text-center">
                            {plan.features.map((feature, index) => (
                                <h1 key={index} className="mb-2">{feature}</h1>
                            ))}
                        </div>
                        {selectedPlan === plan.id ? (
                            <Button onClick={() => handleSelectPlan(plan.id)} className="text-white px-4 py-2 rounded mt-4" variant="filled" color="gray" radius="sm">Cancel</Button>
                        ) : (
                            <Button onClick={() => handleSelectPlan(plan.id)} className="text-white px-4 py-2 rounded mt-4" variant="filled" color="#2EAE69" radius="sm">Select</Button>
                        )}
                    </div>
                ))}
            </div>

                <div>
                    {selectedPlan !== null && (
                        <div className="flex justify-center mt-10">
                            <Link href={{ pathname: '/payment', query: { 
                                    selectedPlanName: selectedMembershipPlans.find(plan => plan.id === selectedPlan)?.name,
                                    selectedPlanPrice: selectedMembershipPlans.find(plan => plan.id === selectedPlan)?.price
                                }}}>
                                <Button className="text-white px-4 py-2 rounded" variant="filled" color="#2EAE69" radius="sm"> Continue &nbsp; <FaArrowRight/></Button>
                            </Link>
                        </div>
                    )};
                </div>
            </div>
        </main>
    )
}