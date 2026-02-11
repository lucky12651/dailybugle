import React from "react";
import { Monitor, Smartphone, Globe, Share2 } from "lucide-react";

const DistributionChartsSection = ({
  osChartData,
  deviceChartData,
  countryChartData,
  referrerChartData,
}) => {
  const Card = ({ title, icon: Icon, id, color }) => (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center">
      <div className="flex items-center gap-2 mb-6 self-start w-full">
        <div className={`p-2 rounded-lg bg-${color}-600/10`}>
          <Icon className={`text-${color}-500`} size={20} />
        </div>
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          {title}
        </h4>
      </div>
      <div className="relative w-full aspect-square max-w-[200px] flex items-center justify-center">
        <canvas id={id}></canvas>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {osChartData && (
        <Card title="OS Distribution" icon={Monitor} id="osChart" color="blue" />
      )}
      {deviceChartData && (
        <Card title="Device Distribution" icon={Smartphone} id="deviceChart" color="purple" />
      )}
      {countryChartData && (
        <Card title="Location Distribution" icon={Globe} id="countryChart" color="green" />
      )}
      {referrerChartData && (
        <Card title="Referrer Distribution" icon={Share2} id="referrerChart" color="orange" />
      )}
    </div>
  );
};

export default DistributionChartsSection;