"use client"
import React from 'react';
import { useState, useEffect } from 'react';

export default function BarChart() {

  const [data, setData] = useState([
    { day: 'Mon', distance: 10 },
    { day: 'Tue', distance: 15 },
    { day: 'Wed', distance: 20 },
    { day: 'Thur', distance: 18 },
    { day: 'Fri', distance: 25 },
    { day: 'Sat', distance: 30 },
    { day: 'Sun', distance: 28 },
  ]);

  return (

    <div className="flex self-center ml-16 mt-10 items-end">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="mr-6">{item.distance} km</div>
          <div className="h-32 w-10 bg-primary mr-6" style={{ height: `${item.distance * 5}px` }}></div>
          <div className='mr-6'>{item.day}</div>
        </div>
      ))}
    </div>

  );
}