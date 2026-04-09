import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarketTask, NetworkStats, getMarketTasks, getNetworkStats } from '@/lib/task-market';
import { Server, Activity, DollarSign, Database, BrainCircuit, Box, Play } from 'lucide-react';

export const TaskMarketplace: React.FC = () => {
  const [tasks, setTasks] = useState<MarketTask[]>([]);
  const [stats, setStats] = useState<NetworkStats | null>(null);

  useEffect(() => {
    const loadData = () => {
      setTasks(getMarketTasks());
      setStats(getNetworkStats());
    };
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStartTask = (taskId: string) => {
    console.log('Initiating task:', taskId);
  };

  const getTaskIcon = (type: MarketTask['type']) => {
    switch (type) {
      case 'AI Training': return <BrainCircuit className="w-5 h-5 mx-auto mb-2" />;
      case 'Data Processing': return <Database className="w-5 h-5 mx-auto mb-2" />;
      case 'Video Rendering': return <Play className="w-5 h-5 mx-auto mb-2" />;
      default: return <Box className="w-5 h-5 mx-auto mb-2" />;
    }
  };

  return (
    <div className="space-y-6">

      {/* Stats Block Header */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-2 border-black divide-x-2 divide-y-2 md:divide-y-0 divide-black bg-white">
          <div className="p-6 text-center">
            <Activity className="w-6 h-6 mx-auto mb-2" />
            <div className="text-3xl font-mono font-black">{stats.activeTasks}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">Active Tasks</div>
          </div>
          <div className="p-6 text-center">
            <Server className="w-6 h-6 mx-auto mb-2" />
            <div className="flex items-center justify-center gap-2">
              <span className={`w-3 h-3 ${stats.dockerReady ? 'bg-black' : 'bg-white border-2 border-black'}`}></span>
              <div className="text-2xl font-mono font-black">{stats.dockerReady ? 'READY' : 'OFFLINE'}</div>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">Docker Daemon</div>
          </div>
          <div className="p-6 text-center">
            <Box className="w-6 h-6 mx-auto mb-2" />
            <div className="text-3xl font-mono font-black">{stats.totalExecutions}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">Total Executions</div>
          </div>
          <div className="p-6 text-center bg-gray-50">
            <DollarSign className="w-6 h-6 mx-auto mb-2" />
            <div className="text-3xl font-mono font-black">${stats.creditBalance.toFixed(2)}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">Credit Balance</div>
          </div>
        </div>
      )}

      {/* Task Grid */}
      <h2 className="text-2xl font-black uppercase mb-4 pt-4 border-t-4 border-black">Available Market Tasks</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tasks.map(task => (
          <div key={task.id} className="bauhaus-card flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-start p-4 border-b-2 border-black bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white border-2 border-black flex flex-col items-center justify-center shrink-0">
                  {getTaskIcon(task.type)}
                </div>
                <div>
                  <h3 className="font-bold uppercase text-lg leading-none">{task.name}</h3>
                  <div className="font-mono text-xs text-gray-500 mt-1">ID: {task.id.substring(0,8)}</div>
                </div>
              </div>
              <span className="bauhaus-badge-inverted text-sm px-3 py-1 flex items-center gap-1">
                {task.reward} CR
              </span>
            </div>
            
            <div className="p-4 grid grid-cols-2 gap-4 text-xs font-mono grow">
              <div>
                <span className="font-bold uppercase text-gray-500">TYPE</span>
                <div className="font-bold mt-1">{task.type}</div>
              </div>
              <div>
                <span className="font-bold uppercase text-gray-500">REQUIREMENTS</span>
                <div className="font-bold mt-1">{task.requirements.cpuCores}c / {task.requirements.ramGB}GB / {task.requirements.gpuVRAM}MB VRAM</div>
              </div>
              <div>
                <span className="font-bold uppercase text-gray-500">REQUESTER</span>
                <div className="font-bold mt-1 truncate">{task.requester}</div>
              </div>
              <div>
                <span className="font-bold uppercase text-gray-500">EST. TIME</span>
                <div className="font-bold mt-1">~{(task.estimatedDuration / 60000).toFixed(0)}m</div>
              </div>
            </div>

            <div className="p-4 pt-0 mt-auto">
              {task.status === 'available' ? (
                <Button 
                  onClick={() => handleStartTask(task.id)}
                  className="w-full bauhaus-button h-12 text-sm"
                >
                  <Play className="w-4 h-4 mr-2" /> ACCEPT TASK & STAKE
                </Button>
              ) : (
                <div className="w-full">
                  <div className="flex justify-between text-xs font-bold font-mono mb-2 uppercase">
                    <span>Executing</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="bauhaus-progress-track">
                    <div className="bauhaus-progress-fill transition-all" style={{ width: `${task.progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
           <div className="col-span-2 py-12 px-6 border-2 border-black flex flex-col items-center text-center opacity-50">
             <Box className="w-12 h-12 mb-4" />
             <div className="font-bold font-mono uppercase text-lg">No Tasks Available</div>
             <div className="font-mono text-sm max-w-sm mt-2">The decentralized network currently has no compute demand matching your hardware specifications.</div>
           </div>
        )}
      </div>
    </div>
  );
};
