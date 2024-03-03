// src/components/MyDoughnutChart.js
"use client";
import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { lusitana } from "../fonts";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function YourChartComponent() {

let data= [
  {
    label: "Users",
    value: 55,
    color: "rgba(0, 43, 73, 1)",
    cutout: "50%",
  },
  {
    label: "Admins",
    value:15,
    color: "rgba(0, 103, 160, 1)",
    cutout: "50%",
  },
  {
    label: "Requests",
    value: 80,
    color: "rgba(83, 217, 217, 1)",
    cutout: "50%",
  },
]

  const options: any = {
    plugins: {
      responsive: true,
    },
    cutout: data.map((item) => item.cutout),
  };

  const finalData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        data: data.map((item) => Math.round(item.value)),
        backgroundColor: data.map((item) => item.color),
        borderColor: data.map((item) => item.color),
        borderWidth: 1,
        dataVisibility: new Array(data.length).fill(true),
      },
    ],
  };

  return (
    <div className="flex w-full flex-col md:col-span-4">
        <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Recent Revenue
      </h2>
<div className="rounded-xl bg-gray-50 p-4">
      <div className="min-w-0">
        <div className="sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
    <Doughnut data={finalData} options={options} />
    </div>
    <div className="flex items-center pb-2 pt-6">
          <h3 className="ml-2 text-sm text-gray-500 ">🔘 Total Counter</h3>
        </div>
      </div>
      </div>
    </div>
  )
}