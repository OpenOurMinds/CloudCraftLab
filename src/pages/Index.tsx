import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { NetworkMonitor } from '@/components/NetworkMonitor';
import { HardwareBenchmark } from '@/components/HardwareBenchmark';
import { CreditWalletComponent } from '@/components/CreditWallet';
import { TaskMarketplace } from '@/components/TaskMarketplace';
import { ReputationSystemComponent } from '@/components/ReputationSystem';
import { HostDashboardComponent } from '@/components/HostDashboard';
import { ClientAPIComponent } from '@/components/ClientAPI';
import {
  Cloud, Server, Wallet, Activity, Cpu, ArrowRight,
  CheckCircle, Play, Trophy, Monitor, Globe, Zap, Shield, Network
} from 'lucide-react';
import { NetworkStatus } from '@/lib/network-monitor';
import { HardwareInfo, PerformanceScore } from '@/lib/hardware-benchmark';
import { Transaction } from '@/lib/credit-system';
import { ComputeTask, TaskExecution } from '@/lib/task-execution';
import { ReputationMetrics } from '@/lib/reputation-system';
import { HostStatus } from '@/lib/host-dashboard';

const SETUP_STEPS = [
  { id: 'network',     num: 1, label: 'Network Check',      desc: 'Verify Ethernet stability',            icon: Activity,  color: 'text-cyan-400',   bg: 'bg-cyan-400/10',  tab: 'network'     },
  { id: 'hardware',    num: 2, label: 'Hardware Test',       desc: 'Benchmark CPU/GPU capabilities',       icon: Cpu,       color: 'text-violet-400', bg: 'bg-violet-400/10',tab: 'hardware'    },
  { id: 'marketplace', num: 3, label: 'Task Marketplace',  desc: 'Browse tasks for credits',              icon: Play,      color: 'text-emerald-400',bg: 'bg-emerald-400/10',tab: 'marketplace' },
  { id: 'wallet',      num: 4, label: 'Credit Wallet',       desc: 'Manage earnings & transfers',          icon: Wallet,    color: 'text-yellow-400', bg: 'bg-yellow-400/10',tab: 'wallet'      },
  { id: 'reputation',  num: 5, label: 'Reputation',          desc: 'Build tiers for better rewards',       icon: Trophy,    color: 'text-orange-400', bg: 'bg-orange-400/10',tab: 'reputation'  },
  { id: 'host',        num: 6, label: 'Host Dashboard',      desc: 'Monitor your earning command center',  icon: Monitor,   color: 'text-blue-400',   bg: 'bg-blue-400/10',  tab: 'host'        },
  { id: 'client',      num: 7, label: 'Client API',          desc: 'Submit tasks to the network',          icon: Globe,     color: 'text-pink-400',   bg: 'bg-pink-400/10',  tab: 'client'      },
];

const Index = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [hardwareResults, setHardwareResults] = useState<{ hardware: HardwareInfo; performance: PerformanceScore } | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');

  const handleNetworkStatusChange = (status: NetworkStatus) => {
    setNetworkStatus(status);
    // Check eligibility directly from the status object — no require() needed
    const networkEligible = status.stability === 'stable' || status.stability === 'excellent';
    setIsSetupComplete(networkEligible && hardwareResults !== null);
  };

  const handleHardwareComplete = (results: { hardware: HardwareInfo; performance: PerformanceScore }) => {
    setHardwareResults(results);
    const networkEligible = networkStatus
      ? (networkStatus.stability === 'stable' || networkStatus.stability === 'excellent')
      : false;
    setIsSetupComplete(networkEligible && true);
  };

  const handleTransaction = (transaction: Transaction) => {
    console.log('Transaction:', transaction);
  };

  const handleTaskExecute = (task: ComputeTask) => {
    console.log('Task executed:', task.title);
  };

  const handleTaskComplete = (execution: TaskExecution) => {
    console.log('Task completed:', execution.taskId);
  };

  const handleReputationChange = (metrics: ReputationMetrics) => {
    console.log('Reputation updated:', metrics.overallScore);
  };

  const handleHostStatusChange = (status: HostStatus) => {
    console.log('Host status updated:', status.isOnline);
  };

  const navigateTo = (tab: string) => setActiveTab(tab);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Header ─────────────────────────────────────────── */}
      <header className="relative overflow-hidden border-b border-border/50">
        {/* Ambient glow blobs */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-cyan-400/8 blur-3xl" />
          <div className="absolute top-0 right-0 w-[350px] h-[200px] rounded-full bg-violet-500/6 blur-3xl" />
        </div>

        <div className="container mx-auto py-16 text-center relative z-10 animate-fade-in">
          {/* Logo + Title */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="relative animate-glow-pulse rounded-2xl p-3 bg-cyan-400/10 border border-cyan-400/25">
              <Cloud className="h-10 w-10 text-cyan-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gradient-cyan">
              CloudCraft Lab
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Transform idle computing power into valuable credits.
            Join the <span className="text-cyan-400 font-medium">secure, containerized P2P marketplace</span> for distributed task execution.
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {[
              { icon: Server,  label: 'Docker Containers' },
              { icon: Shield,  label: 'End-to-End Encrypted' },
              { icon: Network, label: 'P2P Marketplace' },
              { icon: Zap,     label: 'Real-Time Earnings' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-sm font-medium text-cyan-300"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
            ))}
          </div>

          {/* Node-ready status */}
          {isSetupComplete && (
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl neon-border bg-cyan-400/5 animate-fade-in">
              <span className="pulse-dot" />
              <CheckCircle className="h-5 w-5 text-cyan-400" />
              <span className="text-cyan-300 font-semibold">Your node is ready to earn credits!</span>
            </div>
          )}
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────── */}
      <main className="container mx-auto py-10 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          {/* Tab bar */}
          <TabsList className="flex flex-wrap h-auto gap-1 p-1.5 mb-8 glass-card rounded-2xl border-border/50 w-full">
            {[
              { value: 'setup',       label: 'Setup',      icon: CheckCircle },
              { value: 'network',     label: 'Network',    icon: Activity },
              { value: 'hardware',    label: 'Hardware',   icon: Cpu },
              { value: 'marketplace', label: 'Tasks',      icon: Play },
              { value: 'reputation',  label: 'Reputation', icon: Trophy },
              { value: 'wallet',      label: 'Wallet',     icon: Wallet },
              { value: 'host',        label: 'Host',       icon: Monitor },
              { value: 'client',      label: 'Client',     icon: Globe },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all
                           data-[state=active]:bg-cyan-400 data-[state=active]:text-navy-900
                           data-[state=active]:shadow-glow-cyan data-[state=inactive]:text-muted-foreground
                           data-[state=inactive]:hover:text-foreground flex-1"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Setup Tab ─────────────────────────────────────────── */}
          <TabsContent value="setup" className="space-y-8 animate-slide-up">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold tracking-tight">Get Started in 7 Steps</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Configure your node to start earning credits by contributing computing power to the decentralized network.
              </p>
            </div>

            {/* Step cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {SETUP_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <Card
                    key={step.id}
                    className="glass-card card-hover text-center border-border/40 animate-fade-in"
                    style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                  >
                    <CardHeader className="p-4 pb-2">
                      {/* Step number badge */}
                      <div className="mx-auto mb-3 relative">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${step.bg} border border-current/20`}>
                          <Icon className={`h-5 w-5 ${step.color}`} />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-navy-900 text-[10px] font-bold">
                          {step.num}
                        </span>
                      </div>
                      <CardTitle className="text-sm font-semibold leading-tight">{step.label}</CardTitle>
                      <CardDescription className="text-xs mt-1">{step.desc}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-border/60 hover:border-cyan-400/50 hover:text-cyan-400 transition-all text-xs"
                        onClick={() => navigateTo(step.tab)}
                      >
                        Go <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Status overview */}
            <Card className="glass-card border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  Setup Status
                </CardTitle>
                <CardDescription>Track your progress toward becoming an active node</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {[
                    { icon: Activity, label: 'Net',  active: networkStatus?.stability === 'stable' || networkStatus?.stability === 'excellent', value: networkStatus ? networkStatus.stability.slice(0, 2).toUpperCase() : '—', color: 'text-cyan-400'   },
                    { icon: Cpu,      label: 'HW',   active: !!hardwareResults,  value: hardwareResults ? String(hardwareResults.performance.overall) : '—', color: 'text-violet-400' },
                    { icon: Play,     label: 'Task', active: isSetupComplete,    value: isSetupComplete ? 'RDY' : 'PND', color: 'text-emerald-400' },
                    { icon: Trophy,   label: 'Rep',  active: false,              value: 'NEW', color: 'text-orange-400' },
                    { icon: Wallet,   label: 'Wal',  active: true,               value: 'ACT', color: 'text-yellow-400' },
                    { icon: Monitor,  label: 'Host', active: true,               value: 'ON',  color: 'text-blue-400'   },
                    { icon: Globe,    label: 'API',  active: true,               value: 'RDY', color: 'text-pink-400'   },
                    { icon: CheckCircle, label: 'Sys', active: isSetupComplete,  value: isSetupComplete ? 'ON' : 'SET', color: 'text-cyan-400' },
                  ].map(({ icon: Icon, label, active, value, color }) => (
                    <div
                      key={label}
                      className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                        active
                          ? 'border-cyan-400/30 bg-cyan-400/5'
                          : 'border-border/40 bg-muted/30'
                      }`}
                    >
                      <Icon className={`h-4 w-4 mb-1.5 ${active ? color : 'text-muted-foreground'}`} />
                      <div className="text-[10px] font-medium text-muted-foreground mb-1">{label}</div>
                      <span className={`text-[10px] font-bold font-mono ${active ? color : 'text-muted-foreground'}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Network Tab ──────────────────────────────────────── */}
          <TabsContent value="network" className="space-y-6 animate-slide-up">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Network Stability Monitor</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ensure your connection meets the requirements for reliable task execution
              </p>
            </div>
            <div className="flex justify-center">
              <NetworkMonitor onStatusChange={handleNetworkStatusChange} />
            </div>
          </TabsContent>

          {/* ── Hardware Tab ─────────────────────────────────────── */}
          <TabsContent value="hardware" className="space-y-6 animate-slide-up">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Hardware Benchmark Suite</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Analyze your system capabilities and discover suitable tasks
              </p>
            </div>
            <div className="flex justify-center">
              <HardwareBenchmark onComplete={handleHardwareComplete} />
            </div>
          </TabsContent>

          {/* ── Marketplace Tab ──────────────────────────────────── */}
          <TabsContent value="marketplace" className="space-y-6 animate-slide-up">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Task Marketplace</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Browse and execute computing tasks to earn credits
              </p>
            </div>
            <div className="flex justify-center">
              <TaskMarketplace onTaskExecute={handleTaskExecute} onTaskComplete={handleTaskComplete} />
            </div>
          </TabsContent>

          {/* ── Reputation Tab ───────────────────────────────────── */}
          <TabsContent value="reputation" className="space-y-6 animate-slide-up">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Reputation System</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Build your reputation and unlock better rewards
              </p>
            </div>
            <div className="flex justify-center">
              <ReputationSystemComponent onReputationChange={handleReputationChange} />
            </div>
          </TabsContent>

          {/* ── Wallet Tab ───────────────────────────────────────── */}
          <TabsContent value="wallet" className="space-y-6 animate-slide-up">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Credit Wallet</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Manage your earnings and track your participation in the network
              </p>
            </div>
            <div className="flex justify-center">
              <CreditWalletComponent onTransaction={handleTransaction} />
            </div>
          </TabsContent>

          {/* ── Host Tab ─────────────────────────────────────────── */}
          <TabsContent value="host" className="space-y-6 animate-slide-up">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Host Dashboard</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Monitor your hardware health and credit accumulation in real-time
              </p>
            </div>
            <HostDashboardComponent onStatusChange={handleHostStatusChange} />
          </TabsContent>

          {/* ── Client Tab ───────────────────────────────────────── */}
          <TabsContent value="client" className="space-y-6 animate-slide-up">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Client API</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Submit tasks and monitor progress across the distributed network
              </p>
            </div>
            <ClientAPIComponent />
          </TabsContent>

        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-sm text-muted-foreground">
        <span className="text-cyan-400/70 font-medium">CloudCraft Lab</span>
        {' '}— Decentralized computing for everyone
      </footer>
    </div>
  );
};

export default Index;
