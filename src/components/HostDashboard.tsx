import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HostNode, ContainerTask, HostMetrics } from '@/lib/host-node';
import { Play, Pause, Activity, Cpu, HardDrive, Network, Server } from 'lucide-react';

export const HostDashboard: React.FC = () => {
  const [node] = useState(() => new HostNode());
  const [metrics, setMetrics] = useState<HostMetrics>(node.getMetrics());
  const [activeTasks, setActiveTasks] = useState<ContainerTask[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setMetrics(node.getMetrics());
        setActiveTasks(node.getActiveTasks());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive, node]);

  const toggleNode = () => {
    if (isActive) node.stop();
    else node.start();
    setIsActive(!isActive);
  };

  const getMetricStyle = (val: number, max: number) => {
    const pct = val / max;
    if (pct > 0.8) return 'bg-black text-white';
    if (pct > 0.6) return 'bg-gray-400 text-black';
    return 'bg-white text-black';
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bauhaus-card p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase flex items-center gap-2">
            <ServerIcon /> Host Dashboard
          </h2>
          <p className="font-mono text-sm mt-1">NODE_ID: {metrics.resources.id.substring(0, 8)}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Credits Earned</span>
            <span className="text-2xl font-mono font-bold">${metrics.earnings.credits.toFixed(2)}</span>
          </div>
          <Button 
            onClick={toggleNode}
            className={`border-2 border-black rounded-none h-12 px-6 font-bold uppercase ${isActive ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900'}`}
          >
            {isActive ? <><Pause className="mr-2 h-4 w-4" /> Go Offline</> : <><Play className="mr-2 h-4 w-4" /> Start Hosting</>}
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hardware Status */}
        <div className="lg:col-span-1 bauhaus-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-2 border-black bg-black text-white p-3">
            <h3 className="font-bold uppercase tracking-wider text-sm">Resource Allocation</h3>
          </div>
          <div className="p-4 flex flex-col gap-6">
            
            {/* CPU */}
            <div>
              <div className="flex justify-between font-mono text-xs font-bold mb-2">
                <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU</span>
                <span>{metrics.usage.cpuPrecent.toFixed(1)}% / {metrics.resources.cpuCores} CORE</span>
              </div>
              <div className="w-full h-8 border-2 border-black relative">
                <div 
                  className={`absolute left-0 top-0 h-full transition-all duration-300 ${getMetricStyle(metrics.usage.cpuPrecent, 100)}`} 
                  style={{ width: `${Math.max(2, metrics.usage.cpuPrecent)}%` }} 
                />
              </div>
            </div>

            {/* GPU */}
            <div>
              <div className="flex justify-between font-mono text-xs font-bold mb-2">
                <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> GPU</span>
                <span>{metrics.usage.gpuPercent.toFixed(1)}% / {metrics.resources.gpuModel}</span>
              </div>
              <div className="w-full h-8 border-2 border-black relative">
                <div 
                  className={`absolute left-0 top-0 h-full transition-all duration-300 ${getMetricStyle(metrics.usage.gpuPercent, 100)}`} 
                  style={{ width: `${Math.max(2, metrics.usage.gpuPercent)}%` }} 
                />
              </div>
            </div>

            {/* RAM */}
            <div>
              <div className="flex justify-between font-mono text-xs font-bold mb-2">
                <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> MEMORY</span>
                <span>{(metrics.usage.ramBytes / 1e9).toFixed(1)} / {metrics.resources.ramGB} GB</span>
              </div>
              <div className="w-full h-8 border-2 border-black flex gap-1 p-1 bg-gray-100">
                {/* Visualizing chunks */}
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className={`flex-1 ${i < (metrics.usage.ramBytes / 1e9 / (metrics.resources.ramGB / 10)) ? 'bg-black' : 'bg-transparent border border-gray-300'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Active Tasks Logic Block */}
        <div className="lg:col-span-2 bauhaus-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-0 flex flex-col">
          <div className="border-b-2 border-black bg-black text-white p-3 flex justify-between items-center">
            <h3 className="font-bold uppercase tracking-wider text-sm">Execution Queue</h3>
            <span className="text-xs font-mono">{activeTasks.length} CONSTAINERS RUNNING</span>
          </div>
          
          <div className="p-4 flex-1 overflow-auto bg-gray-50">
            {activeTasks.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center opacity-30 font-mono text-sm font-bold flex-col gap-2">
                <Box className="w-12 h-12" />
                AWAITING TASKS...
              </div>
            ) : (
              <div className="space-y-4">
                {activeTasks.map(task => (
                  <div key={task.id} className="border-2 border-black bg-white p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-bold uppercase leading-none">{task.type} JOB</div>
                        <div className="font-mono text-xs text-gray-500 mt-1">{task.id}</div>
                      </div>
                      <span className="bauhaus-badge-inverted">{task.reward} CR</span>
                    </div>
                    <div className="w-full h-6 border-2 border-black flex items-center bg-gray-100 relative">
                      <div className="absolute left-0 h-full bg-black transition-all duration-300" style={{ width: `${task.progress}%` }} />
                      <span className="relative z-10 w-full text-center text-[10px] font-bold font-mono mix-blend-difference text-white">
                        {task.progress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const ServerIcon = () => <Server className="w-6 h-6" strokeWidth={3} />;
const Box = ({ className }: { className: string }) => <div className={className} />; // Fallback if lucide box fails
