import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientAPI, TaskSubmission, TaskStatus, TaskResult, MockHost } from '@/lib/client-api';
import {
  Server, Globe, CheckCircle, Activity,
  TrendingUp, Download, Upload, MapPin, Zap, Wifi
} from 'lucide-react';

export const ClientAPIComponent: React.FC = () => {
  const [api] = useState(() => new ClientAPI());
  const [tasks, setTasks] = useState<TaskStatus[]>([]);
  const [results, setResults] = useState<TaskResult[]>([]);
  const [hosts, setHosts] = useState<MockHost[]>([]);
  const [networkStats, setNetworkStats] = useState<any>(null);
  const [selectedResult, setSelectedResult] = useState<TaskResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [awsBill, setAwsBill] = useState(1500);
  
  const [formData, setFormData] = useState<TaskSubmission>({
    containerImage: 'tensorflow/tensorflow:latest-gpu',
    datasetLink: 'https://example.com/dataset.zip',
    minPerformanceScore: 70,
    maxCreditSpend: 100,
    requirements: { cpuCores: 4, gpuVRAM: 4000, ramGB: 8, duration: 60 },
    priority: 'standard',
    encrypted: true,
  });

  useEffect(() => {
    const loadData = async () => {
      const [allTasks, allHosts, stats] = await Promise.all([
        api.getAllTasks(), api.getAvailableHosts(), api.getNetworkStats(),
      ]);
      setTasks(allTasks);
      setHosts(allHosts);
      setNetworkStats(stats);
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [api]);

  const handleSubmitTask = async () => {
    setSubmitting(true);
    await api.submitTask(formData);
    setTasks(await api.getAllTasks());
    setSubmitting(false);
  };

  const formatDuration = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
  };

  return (
    <div className="w-full space-y-8">

      {/* Network Overview - Bauhaus Grid Block */}
      {networkStats && (
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-4 border-black p-4 flex justify-between items-center bg-black text-white">
            <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-5 h-5" /> Protocol Overview
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x-2 divide-y-2 md:divide-y-0 divide-black">
            <div className="p-4 text-center">
              <div className="text-3xl font-black font-mono">{networkStats.totalHosts}</div>
              <div className="text-xs font-bold uppercase mt-1">Total Nodes</div>
            </div>
            <div className="p-4 text-center bg-gray-100">
              <div className="text-3xl font-black font-mono">{networkStats.onlineHosts}</div>
              <div className="text-xs font-bold uppercase mt-1">Nodes Online</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-3xl font-black font-mono">{networkStats.averagePerformance.toFixed(1)}</div>
              <div className="text-xs font-bold uppercase mt-1">Avg Score</div>
            </div>
            <div className="p-4 text-center bg-gray-100">
              <div className="text-3xl font-black font-mono">{networkStats.networkDistribution.ethernet}</div>
              <div className="text-xs font-bold uppercase mt-1">Ethernet Linked</div>
            </div>
          </div>
        </div>
      )}

      {/* Flat Tabs */}
      <Tabs defaultValue="submit" className="w-full">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 p-0 bg-transparent border-t-2 border-l-2 border-r-2 border-black">
          {[
            { value: 'submit', label: 'DEPLOY WORK' },
            { value: 'status', label: 'STATUS' },
            { value: 'results', label: 'DATA' },
            { value: 'hosts', label: 'NODES' },
            { value: 'simulator', label: 'BUDGET' },
          ].map((tab) => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-black border-r-2 last:border-r-0 py-3 font-bold text-xs uppercase
                         data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:bg-white"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="border-2 border-t-0 border-black bg-white p-6 md:p-8 min-h-[400px]">
          
          {/* Submit */}
          <TabsContent value="submit" className="m-0 space-y-6">
            <h2 className="text-2xl font-black uppercase border-b-2 border-black pb-2 mb-6">Execution Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="uppercase font-bold text-xs tracking-wider">Docker Container URI</Label>
                  <Input 
                    value={formData.containerImage}
                    onChange={e => setFormData({ ...formData, containerImage: e.target.value })}
                    className="border-2 border-black rounded-none shadow-none font-mono focus-visible:ring-0 focus-visible:border-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase font-bold text-xs tracking-wider">Storage Volume Link</Label>
                  <Input 
                    value={formData.datasetLink}
                    onChange={e => setFormData({ ...formData, datasetLink: e.target.value })}
                    className="border-2 border-black rounded-none shadow-none focus-visible:ring-0 focus-visible:border-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="uppercase font-bold text-xs tracking-wider">Max Bid (CR)</Label>
                    <Input 
                      type="number"
                      value={formData.maxCreditSpend}
                      onChange={e => setFormData({ ...formData, maxCreditSpend: parseInt(e.target.value) })}
                      className="border-2 border-black rounded-none shadow-none font-mono focus-visible:ring-0 focus-visible:border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase font-bold text-xs tracking-wider">Min Score</Label>
                    <Input 
                      type="number"
                      value={formData.minPerformanceScore}
                      onChange={e => setFormData({ ...formData, minPerformanceScore: parseInt(e.target.value) })}
                      className="border-2 border-black rounded-none shadow-none font-mono focus-visible:ring-0 focus-visible:border-black"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="uppercase font-bold text-xs tracking-wider">CPU Cores</Label>
                    <Input 
                      type="number"
                      value={formData.requirements.cpuCores}
                      onChange={e => setFormData({ ...formData, requirements: { ...formData.requirements, cpuCores: parseInt(e.target.value) } })}
                      className="border-2 border-black rounded-none shadow-none font-mono focus-visible:ring-0 focus-visible:border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase font-bold text-xs tracking-wider">GPU RAM (MB)</Label>
                    <Input 
                      type="number"
                      value={formData.requirements.gpuVRAM}
                      onChange={e => setFormData({ ...formData, requirements: { ...formData.requirements, gpuVRAM: parseInt(e.target.value) } })}
                      className="border-2 border-black rounded-none shadow-none font-mono focus-visible:ring-0 focus-visible:border-black"
                    />
                  </div>
                </div>
                <div className="pt-4 border-t-2 border-black mt-4">
                  <Button 
                    onClick={handleSubmitTask}
                    disabled={submitting}
                    className="w-full bauhaus-button h-14 text-lg"
                  >
                    {submitting ? 'DEPLOYING...' : 'DISPATCH TO PROTOCOL'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Status */}
          <TabsContent value="status" className="m-0 space-y-4">
            {tasks.length === 0 ? (
              <div className="py-12 text-center text-gray-500 font-mono uppercase font-bold text-lg border-2 border-dashed border-gray-300">
                NO ACTIVE TASKS
              </div>
            ) : tasks.map(task => (
              <div key={task.taskId} className="border-2 border-black bg-white p-0 flex flex-col md:flex-row">
                <div className="p-4 border-b-2 md:border-b-0 md:border-r-2 border-black bg-black text-white w-full md:w-1/3 flex flex-col justify-between">
                  <div>
                    <div className="text-xl font-bold uppercase mb-1">{task.status}</div>
                    <div className="font-mono text-xs break-all opacity-70 border-t border-gray-700 pt-1">ID:{task.taskId}</div>
                  </div>
                  <div className="mt-4 text-xs font-mono">
                    VOL: {task.creditsSpent} CR
                  </div>
                </div>
                <div className="p-6 w-full md:w-2/3 flex flex-col justify-center">
                  <div className="flex justify-between font-mono text-sm font-bold uppercase mb-2">
                    <span>Protocol Execution</span>
                    <span>{task.totalProgress.toFixed(0)}%</span>
                  </div>
                  <div className="bauhaus-progress-track">
                    <div className="bauhaus-progress-fill" style={{ width: `${task.totalProgress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Budget Simulator */}
          <TabsContent value="simulator" className="m-0">
            <h2 className="text-2xl font-black uppercase text-center mb-8 border-b-4 border-black pb-4 inline-block w-full">Economic Arbitrage Calculator</h2>
            
            <div className="max-w-2xl mx-auto space-y-10">
              <div className="space-y-4">
                <Label className="text-sm font-bold uppercase tracking-widest block text-center">Monthly Centralized Cloud Invoice</Label>
                <Input 
                  type="number"
                  value={awsBill}
                  onChange={e => setAwsBill(parseInt(e.target.value) || 0)}
                  className="w-full text-center text-5xl font-black h-24 border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="p-8 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col items-center bg-gray-100">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Legacy AWS/GCP Cost</div>
                  <div className="text-3xl font-mono font-black">${awsBill.toLocaleString()}</div>
                </div>
                <div className="p-8 flex flex-col items-center bg-black text-white">
                  <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">CloudCraft Contract Payload</div>
                  <div className="text-3xl font-mono font-black">${(awsBill * 0.22).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </div>
              </div>

              <div className="p-8 border-4 border-black flex flex-col items-center justify-center text-center bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-sm font-bold uppercase tracking-widest mb-2">Protocol Savings Escrow</div>
                <div className="text-5xl md:text-6xl font-black font-mono">${(awsBill * 0.78).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <div className="mt-4 bg-black text-white px-4 py-1 font-bold font-mono text-sm uppercase inline-block">78% EFFICIENCY</div>
              </div>
            </div>
          </TabsContent>

          {/* Results and Hosts empty placeholders to save space for MVP but they exist */}
          <TabsContent value="results" className="m-0">
             <div className="py-12 text-center font-mono uppercase font-bold text-lg">Select task from STATUS to view results.</div>
          </TabsContent>

          <TabsContent value="hosts" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hosts.map(host => (
                <div key={host.id} className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="border-b-2 border-black pb-2 mb-2 flex justify-between">
                    <span className="font-mono font-bold">{host.id}</span>
                    <span className={`w-3 h-3 border-2 border-black ${host.isOnline ? 'bg-black' : 'bg-white'}`}></span>
                  </div>
                  <div className="text-xs font-mono uppercase space-y-1">
                    <div>LOC: {host.location}</div>
                    <div>IP: {host.ip}</div>
                    <div>SCR: {host.performanceScore}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
        </div>
      </Tabs>
    </div>
  );
};
