"use client"
import React, { useState } from 'react';

export default function Statistics() {
    
    const [, setMemberData] = useState<{name:String, date:String, email:String, type:String, action:String}[]>([]);
    const elements = [
        { weeks: '12', basic: '10', standard: '3', premium: '3', revenue: '538' },
        { weeks: '12', basic: '2', standard: '8', premium: '1',  revenue:'238' },
        { weeks: '12', basic: '2', standard: '8', premium: '1',  revenue:'238' },
        { weeks: '12', basic: '2', standard: '8', premium: '1',  revenue:'238' },
        { weeks: '12', basic: '2', standard: '8', premium: '1',  revenue:'238' },
      ]
    
    return ( 
        <main className="w-screen h-screen">
            <div className="w-full h-full">
               
                <div className="h-full m-8 drop-shadow-xl rounded-md bg-gray-100 py-4 px-20">

                    <p className='flex justify-center text-green-800 font-bold text-xl mb-4'>Weekly Revenue (Predicted upto 1 year)</p>

                    <table className="h-1/2 min-w-full flex-shrink bg-white rounded-md">
                            <thead className="text-sm font-semibold shad-text-gray-500 dark:shad-text-gray-400">
                                <tr className="border-b text-lg text-green-900 ">
                                    <th className="px-4 py-3 text-center">Weeks</th>
                                    <th className="px-4 py-3 text-center">Basic</th>
                                    <th className="px-4 py-3 text-center">Standard</th>
                                    <th className="px-4 py-3 text-center">Premium</th>
                                    <th className="px-4 py-3 text-center">Weekly Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="shad-text-gray-500 dark:shad-text-gray-400 text-sm">
                                {elements && elements.map((element) => (
                                        <tr  className="border-b hover:shad-bg-gray-100 dark:hover:shad-bg-gray-800" key={element.weeks}>
                                            <td className="px-4 py-3 text-center">{element.weeks}</td>
                                            <td className="px-4 py-3 text-center">{element.basic}</td>
                                            <td className="px-4 py-3 text-center">{element.standard}</td>
                                            <td className="px-4 py-3 text-center">{element.premium}</td>
                                            <td className="px-8 py-3 text-center">{element.revenue}</td>
                                        </tr>
                                    ))}
                            </tbody>
                           
                       
                        </table> 
                       


                </div>
            </div>
        </main>

    );
}

