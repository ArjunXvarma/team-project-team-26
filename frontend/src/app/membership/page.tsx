"use client"
import React, { useState, useRef  } from 'react';
import { Button } from "@mantine/core";

export default function Home(){
    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

    const membershipPlans = [
      { id: 1, name: 'Basic', price: '£2/month', features: ['Access to basic features is included'] },
      { id: 2, name: 'Standard', price: '£10/month', features: ['Access to some of the features is included'] },
      { id: 3, name: 'Premium', price: '£20/month', features: ['Access to premium features is included'] }
    ];
  
    const handleSelectPlan = (planId:number) => {
        if (selectedPlan === planId) {
            setSelectedPlan(null); 
        } else {
            setSelectedPlan(planId); 
        }
      };
  
    
    return (
        <main className="w-screen h-screen bg-primary"> 
            <div className="w-full h-full">

                <header className="justify-around items-center pt-10 flex-grow">
                    <h1 className="text-center text-4xl font-semibold pb-6 font-serif text-white "> Membership</h1>
                    <h1 className="text-center text-lg text-white font-serif ">“Every journey begins with a single step”</h1>
                </header>

                <h1 className="text-2xl text-center text-white font-serif m-12">Choose your membership plan </h1>

                <div className="flex justify-center mt-10 gap-2">
                {membershipPlans.map(plan => (
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
                
            </div>
        </main>
    )
}