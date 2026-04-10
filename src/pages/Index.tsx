import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Server, Shield, Box, Zap, Settings, Activity, Cpu, CreditCard, Network, AlertTriangle
} from 'lucide-react';
import { NetworkMonitor } from '../components/NetworkMonitor';
import { HostDashboard } from '../components/HostDashboard';
import { TaskMarketplace } from '../components/TaskMarketplace';
import { ClientAPIComponent } from '../components/ClientAPI';
import { NetworkStatus } from '../lib/network-monitor';

interface SetupStep {
  title: string;
  description: string;
  icon: React.ElementType;
  isComplete: boolean;
  status: 'pending' | 'active' | 'completed' | 'error';
}

const Index: React.FC = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  
  // Logic based on state rather than node require
  const isSetupComplete = networkStatus?.stability === 'stable' && networkStatus?.latency < 100;

  const getSystemStatus = () => {
    if (!networkStatus) return { label: 'PENDING', bg: 'bg-bauhaus-gray', border: 'border-black' };
    if (networkStatus.stability === 'critical') return { label: 'OFFLINE', bg: 'bg-black text-white', border: 'border-black' };
    if (networkStatus.stability === 'unstable') return { label: 'UNSTABLE', bg: 'bg-white', border: 'border-black' };
    return { label: 'ONLINE', bg: 'bg-black text-white', border: 'border-black' };
  };

  const currentStatus = getSystemStatus();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      
      {/* Brutalist Header */}
      <header className="border-b-4 border-black bg-white">
        <div className="container mx-auto px-4 py-8 flex items-end justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-black flex items-center justify-center border-4 border-black">
              <Box className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">CloudCraft</h1>
              <span className="font-mono text-sm font-bold tracking-widest bg-black text-white px-2 py-0.5 mt-1 inline-block">
                PROTOCOL_V1.0
              </span>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground mb-1">System Status</span>
            <div className={`border-2 font-mono font-bold px-3 py-1 text-sm ${currentStatus.bg} ${currentStatus.border}`}>
              {currentStatus.label}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="setup" className="w-full space-y-8">
          
          {/* Rigid Tab Row */}
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 p-0 bg-transparent gap-2 h-auto">
            {['Setup', 'Host', 'Tasks', 'Client'].map((tab) => (
              <TabsTrigger 
                key={tab}
                value={tab.toLowerCase()} 
                className="border-2 border-black bg-white rounded-none py-3 font-bold uppercase tracking-wider 
                           data-[state=active]:bg-black data-[state=active]:text-white 
                           data-[state=inactive]:hover:bg-muted"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-8 m-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Network Monitor */}
              <div className="lg:col-span-1 border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-xl font-black uppercase mb-6 border-b-2 border-black pb-2">Network Diagnostics</h2>
                <NetworkMonitor onStatusChange={setNetworkStatus} />
              </div>

              {/* Right Column: Setup Steps Grid */}
              <div className="lg:col-span-2 space-y-6">
                <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-black uppercase">Initialization Sequence</h2>
                      <p className="text-sm font-mono mt-1 font-bold">STEPS REQUIRED: 4</p>
                    </div>
                    {isSetupComplete ? (
                      <span className="bauhaus-badge-inverted">READY</span>
                    ) : (
                      <span className="bauhaus-badge">INCOMPLETE</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { num: 1, title: 'Network',  stat: networkStatus ? 'Verified' : 'Pending', icon: Activity },
                      { num: 2, title: 'Hardware', stat: 'Awaiting Benchmark', icon: Cpu },
                      { num: 3, title: 'Wallet',   stat: 'Unlinked', icon: CreditCard },
                      { num: 4, title: 'Identity', stat: 'Unverified', icon: Shield },
                    ].map((step) => (
                      <div key={step.num} className="border-2 border-black p-4 bg-white flex items-start gap-4">
                        <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold font-mono text-sm shrink-0">
                          {step.num}
                        </div>
                        <div>
                          <h3 className="font-bold uppercase text-sm">{step.title}</h3>
                          <span className="text-xs font-mono">{step.stat}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Panel */}
                <div className="bg-black text-white border-2 border-black p-6">
                  <h3 className="uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                    <Server className="w-5 h-5" /> Node Operator Protocol
                  </h3>
                  <p className="font-mono text-sm opacity-90 leading-relaxed max-w-2xl">
                    By initializing this node, you commit computing resources to the decentralized infrastructure loop. Resources are executed securely in isolated containers. Payouts occur per executed block.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Other Tabs Content */}
          <TabsContent value="host" className="m-0 focus:outline-none">
            <HostDashboard />
          </TabsContent>

          <TabsContent value="tasks" className="m-0 focus:outline-none">
            <TaskMarketplace />
          </TabsContent>

          <TabsContent value="client" className="m-0 focus:outline-none">
            <ClientAPIComponent />
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
};

export default Index;
