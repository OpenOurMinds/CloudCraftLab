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
import { Cloud, Server, Wallet, Activity, Cpu, ArrowRight, CheckCircle, Play, Trophy, Monitor, Globe } from 'lucide-react';
import { NetworkStatus } from '@/lib/network-monitor';
import { HardwareInfo, PerformanceScore } from '@/lib/hardware-benchmark';
import { Transaction } from '@/lib/credit-system';
import { ComputeTask, TaskExecution } from '@/lib/task-execution';
import { ReputationMetrics } from '@/lib/reputation-system';
import { HostStatus } from '@/lib/host-dashboard';

const Index = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [hardwareResults, setHardwareResults] = useState<{ hardware: HardwareInfo; performance: PerformanceScore } | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const handleNetworkStatusChange = (status: NetworkStatus) => {
    setNetworkStatus(status);
    checkSetupCompletion(status, hardwareResults);
  };

  const handleHardwareComplete = (results: { hardware: HardwareInfo; performance: PerformanceScore }) => {
    setHardwareResults(results);
    checkSetupCompletion(networkStatus, results);
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

  const checkSetupCompletion = (network: NetworkStatus | null, hardware: { hardware: HardwareInfo; performance: PerformanceScore } | null) => {
    const networkEligible = network ? new (require('@/lib/network-monitor').NetworkStabilityMonitor)().isEligibleForTasks() : false;
    const hardwareComplete = hardware !== null;
    setIsSetupComplete(networkEligible && hardwareComplete);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto py-16 text-center">
        <div className="flex items-center justify-center mb-4">
          <Cloud className="h-12 w-12 text-blue-500 mr-3" />
          <h1 className="text-5xl font-extrabold tracking-tight text-gradient-primary">
            CloudCraft Lab
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
          Transform your idle computing power into valuable credits. Join the decentralized marketplace for secure, containerized task execution.
        </p>
        <div className="flex items-center justify-center gap-4 mb-8">
          <Badge variant="default" className="text-sm px-3 py-1">
            <Server className="h-4 w-4 mr-1" />
            Docker Containers
          </Badge>
          <Badge variant="default" className="text-sm px-3 py-1">
            <Activity className="h-4 w-4 mr-1" />
            Network Monitoring
          </Badge>
          <Badge variant="default" className="text-sm px-3 py-1">
            <Wallet className="h-4 w-4 mr-1" />
            Credit System
          </Badge>
        </div>
        {isSetupComplete && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg inline-flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Your node is ready to earn credits!</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto pb-24">
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="hardware">Hardware</TabsTrigger>
            <TabsTrigger value="marketplace">Tasks</TabsTrigger>
            <TabsTrigger value="reputation">Reputation</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="host">Host</TabsTrigger>
            <TabsTrigger value="client">Client</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Get Started in 7 Steps</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Set up your node to start earning credits by contributing your computing power to the decentralized network.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>1. Network Check</CardTitle>
                  <CardDescription>
                    Verify your Ethernet connection meets stability requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const tabsList = document.querySelector('[role="tablist"]');
                      const networkTab = tabsList?.querySelector('[value="network"]') as HTMLElement;
                      networkTab?.click();
                    }}
                  >
                    Check Network <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <Cpu className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>2. Hardware Test</CardTitle>
                  <CardDescription>
                    Benchmark your system to determine suitable tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const tabsList = document.querySelector('[role="tablist"]');
                      const hardwareTab = tabsList?.querySelector('[value="hardware"]') as HTMLElement;
                      hardwareTab?.click();
                    }}
                  >
                    Run Benchmark <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <Play className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>3. Task Marketplace</CardTitle>
                  <CardDescription>
                    Browse and execute computing tasks for credits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const tabsList = document.querySelector('[role="tablist"]');
                      const marketplaceTab = tabsList?.querySelector('[value="marketplace"]') as HTMLElement;
                      marketplaceTab?.click();
                    }}
                  >
                    Browse Tasks <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                    <Trophy className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle>5. Reputation</CardTitle>
                  <CardDescription>
                    Build your reputation for better rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const tabsList = document.querySelector('[role="tablist"]');
                      const reputationTab = tabsList?.querySelector('[value="reputation"]') as HTMLElement;
                      reputationTab?.click();
                    }}
                  >
                    View Reputation <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader className="p-3">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                    <Monitor className="h-5 w-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-sm">7. Host</CardTitle>
                  <CardDescription className="text-xs">
                    Monitor your earning dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const tabsList = document.querySelector('[role="tablist"]');
                      const hostTab = tabsList?.querySelector('[value="host"]') as HTMLElement;
                      hostTab?.click();
                    }}
                  >
                    Host <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader className="p-3">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100">
                    <Globe className="h-5 w-5 text-cyan-600" />
                  </div>
                  <CardTitle className="text-sm">8. Client</CardTitle>
                  <CardDescription className="text-xs">
                    Submit tasks to the network
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const tabsList = document.querySelector('[role="tablist"]');
                      const clientTab = tabsList?.querySelector('[value="client"]') as HTMLElement;
                      clientTab?.click();
                    }}
                  >
                    Client <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Setup Status</CardTitle>
                <CardDescription>
                  Track your progress toward becoming an active node
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-8 gap-1">
                  <div className="text-center p-2 border rounded">
                    <Activity className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                    <div className="text-xs font-medium">Net</div>
                    <Badge variant={networkStatus?.stability === 'stable' ? 'default' : 'secondary'} className="text-xs px-1">
                      {networkStatus ? networkStatus.stability.slice(0, 2).toUpperCase() : 'NT'}
                    </Badge>
                  </div>
                  <div className="text-center p-2 border rounded">
                    <Cpu className="h-4 w-4 mx-auto mb-1 text-green-500" />
                    <div className="text-xs font-medium">HW</div>
                    <Badge variant={hardwareResults ? 'default' : 'secondary'} className="text-xs px-1">
                      {hardwareResults ? hardwareResults.performance.overall : 'NT'}
                    </Badge>
                  </div>
                  <div className="text-center p-2 border rounded">
                    <Play className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                    <div className="text-xs font-medium">Task</div>
                    <Badge variant={isSetupComplete ? 'default' : 'secondary'} className="text-xs px-1">
                      {isSetupComplete ? 'RDY' : 'PND'}
                    </Badge>
                  </div>
                  <div className="text-center p-2 border rounded">
                    <Trophy className="h-4 w-4 mx-auto mb-1 text-red-500" />
                    <div className="text-xs font-medium">Rep</div>
                    <Badge variant="secondary" className="text-xs px-1">
                      NEW
                    </Badge>
                  </div>
                  <div className="text-center p-2 border rounded">
                    <Wallet className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                    <div className="text-xs font-medium">Wal</div>
                    <Badge variant="secondary" className="text-xs px-1">
                      ACT
                    </Badge>
                  </div>
                  <div className="text-center p-2 border rounded">
                    <Monitor className="h-4 w-4 mx-auto mb-1 text-indigo-500" />
                    <div className="text-xs font-medium">Host</div>
                    <Badge variant="secondary" className="text-xs px-1">
                      ON
                    </Badge>
                  </div>
                  <div className="text-center p-2 border rounded">
                    <Globe className="h-4 w-4 mx-auto mb-1 text-cyan-500" />
                    <div className="text-xs font-medium">API</div>
                    <Badge variant="secondary" className="text-xs px-1">
                      RDY
                    </Badge>
                  </div>
                  <div className="text-center p-2 border rounded">
                    <CheckCircle className="h-4 w-4 mx-auto mb-1 text-green-500" />
                    <div className="text-xs font-medium">Sys</div>
                    <Badge variant={isSetupComplete ? 'default' : 'secondary'} className="text-xs px-1">
                      {isSetupComplete ? 'ON' : 'SET'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Network Stability Monitor</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ensure your connection meets the requirements for reliable task execution
              </p>
            </div>
            <div className="flex justify-center">
              <NetworkMonitor onStatusChange={handleNetworkStatusChange} />
            </div>
          </TabsContent>

          <TabsContent value="hardware" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Hardware Benchmark Suite</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Analyze your system capabilities and discover suitable tasks
              </p>
            </div>
            <div className="flex justify-center">
              <HardwareBenchmark onComplete={handleHardwareComplete} />
            </div>
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Task Marketplace</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Browse and execute computing tasks to earn credits
              </p>
            </div>
            <div className="flex justify-center">
              <TaskMarketplace 
                onTaskExecute={handleTaskExecute} 
                onTaskComplete={handleTaskComplete} 
              />
            </div>
          </TabsContent>

          <TabsContent value="reputation" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Reputation System</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Build your reputation and unlock better rewards
              </p>
            </div>
            <div className="flex justify-center">
              <ReputationSystemComponent onReputationChange={handleReputationChange} />
            </div>
          </TabsContent>

          <TabsContent value="host" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Host Dashboard</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Monitor your hardware health and credit accumulation in real-time
              </p>
            </div>
            <HostDashboardComponent onStatusChange={handleHostStatusChange} />
          </TabsContent>

          <TabsContent value="client" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Client API</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Submit tasks and monitor progress across the distributed network
              </p>
            </div>
            <ClientAPIComponent />
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Credit Wallet</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Manage your earnings and track your participation in the network
              </p>
            </div>
            <div className="flex justify-center">
              <CreditWalletComponent onTransaction={handleTransaction} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
