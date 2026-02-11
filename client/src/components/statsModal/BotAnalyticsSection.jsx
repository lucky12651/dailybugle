import React from "react";
import { Cpu, ShieldCheck, Ghost, List } from "lucide-react";

const BotAnalyticsSection = ({ botChartData }) => {
  if (!botChartData) return null;

  const total = botChartData?.totals?.total || 0;
  const human = botChartData?.totals?.human || 0;
  const bot = botChartData?.totals?.bot || 0;

  const humanPct = total ? Math.round((human / total) * 100) : 0;
  const botPct = total ? Math.round((bot / total) * 100) : 0;

  const Card = ({ title, subtitle, icon: Icon, color, children }) => (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 bg-${color}-600/10 rounded-lg`}>
            <Icon className={`text-${color}-500`} size={20} />
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            {title}
          </h4>
        </div>
        <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
          Live
        </span>
      </div>
      {subtitle && (
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-6 ml-10">
          {subtitle}
        </p>
      )}
      <div className="flex-1 flex flex-col justify-center">
        {children}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Human vs Bot */}
      <Card title="Traffic Type" icon={Cpu} color="blue">
        <div className="flex justify-center mb-6">
          {total > 0 ? (
            <div className="w-full max-w-[160px] aspect-square">
              <canvas id="trafficTypeChart"></canvas>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-zinc-600 border border-dashed border-zinc-800 rounded-xl w-full">
              No traffic data
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{human.toLocaleString()}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Human</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{bot.toLocaleString()}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Bot</p>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-green-500">{humanPct}% Human</span>
              <span className="text-red-500">{botPct}% Bot</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-green-500 transition-all duration-1000" 
                style={{ width: `${humanPct}%` }}
              />
              <div 
                className="h-full bg-red-500 transition-all duration-1000" 
                style={{ width: `${botPct}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Bot Categories */}
      <Card title="Bot Categories" subtitle="Automated traffic classification" icon={ShieldCheck} color="purple">
        <div className="flex justify-center">
          {botChartData.botCategories?.data?.length > 0 ? (
            <div className="w-full max-w-[160px] aspect-square">
              <canvas id="botCategoryChart"></canvas>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-zinc-600 border border-dashed border-zinc-800 rounded-xl w-full">
              No bot categories
            </div>
          )}
        </div>
      </Card>

      {/* Top Bots */}
      <Card title="Top Bots" subtitle="Most active automated agents" icon={Ghost} color="orange">
        <div className="flex justify-center">
          {botChartData.botNames?.data?.length > 0 ? (
            <div className="w-full max-w-[160px] aspect-square">
              <canvas id="botNameChart"></canvas>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-zinc-600 border border-dashed border-zinc-800 rounded-xl w-full">
              No bot name data
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BotAnalyticsSection;
