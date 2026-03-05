import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HostDashboard, HostStatus, ResourceMetrics, TaskSession } from '@/lib/host-dashboard';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Zap, 
  Thermometer, 
  Wind, 
  Globe, 
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Square,
  TrendingUp,
  Server
} from 'lucide-react';

interface HostDashboardProps {
  onStatusChange?: (status: HostStatus) => void;
}

export const HostDashboardComponent: React.FC<HostDashboardProps> = ({ onStatusChange }) => {
  const [dashboard] = useState(() => new HostDashboard());
  const [status, setStatus] = useState<HostStatus>(dashboard.getStatus());
  const [metrics, setMetrics] = useState<ResourceMetrics>(dashboard.getMetrics());
  const [currentSession, setCurrentSession] = useState<TaskSession | null>(dashboard.getCurrentSession());
  const [sessionHistory, setSessionHistory] = useState<TaskSession[]>(dashboard.getSessionHistory());
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const updateData = () => {
      setStatus(dashboard.getStatus());
      setMetrics(dashboard.getMetrics());
      setCurrentSession(dashboard.getCurrentSession());
      setSessionHistory(dashboard.getSessionHistory());
      setAlerts(dashboard.getNetworkAlerts());
      onStatusChange?.(dashboard.getStatus());
    };

    const interval = setInterval(updateData, 1000);
    updateData(); // Initial update

    return () => {
      clearInterval(interval);
      dashboard.destroy();
    };
  }, [dashboard, onStatusChange]);

  const handleToggleOnline = (isOnline: boolean) => {
    if (isOnline) {
      dashboard.goOnline();
    } else {
      dashboard.goOffline();
    }
  };

  const handleStartTask = () => {
    try {
      dashboard.startTask({
        type: 'AI Model Training',
        estimatedDuration: 120, // 2 hours
        creditsEarned: 150
      });
    } catch (error) {
      console.error('Failed to start task:', error);
    }
  };

  const getEligibilityColor = (eligibility: HostStatus['eligibility']) => {
    switch (eligibility) {
      case 'high_tier':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'standard':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ineligible':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNetworkIcon = (networkStatus: HostStatus['networkStatus']) => {
    switch (networkStatus) {
      case 'ethernet':
        return <Globe className="h-4 w-4 text-green-500" />;
      case 'wifi':
        return <Globe className="h-4 w-4 text-yellow-500" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Globe className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatCurrency = (credits: number) => {
    return credits.toFixed(2);
  };

  return (
    <div className="w-full max-w-7xl space-y-6">
      {/* Header Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Earning Command Center
              </CardTitle>
              <CardDescription>
                Real-time monitoring of hardware health and credit accumulation
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Availability:</span>
                <Switch
                  checked={status.isOnline}
                  onCheckedChange={handleToggleOnline}
                />
                <Badge variant={status.isOnline ? "default" : "secondary"}>
                  {status.isOnline ? "Online" : "Offline"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Network Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-2 mb-4">
              {alerts.map((alert, index) => (
                <Alert key={index} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{alert}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getNetworkIcon(status.networkStatus)}
                <span className="text-sm font-medium">Network</span>
              </div>
              <Badge className={getEligibilityColor(status.eligibility)}>
                {status.eligibility.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-lg font-bold">{formatCurrency(status.sessionEarnings)}</div>
              <div className="text-sm text-muted-foreground">Session Earnings</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-lg font-bold">{formatCurrency(status.totalEarnings)}</div>
              <div className="text-sm text-muted-foreground">Total Earnings</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-lg font-bold">{formatUptime(status.uptime)}</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="resources" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="current">Current Task</TabsTrigger>
          <TabsTrigger value="history">Session History</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CPU Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  CPU Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usage</span>
                    <span>{metrics.cpu.usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.cpu.usage} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Temperature</div>
                    <div className="flex items-center gap-1">
                      <Thermometer className="h-3 w-3" />
                      <span className="font-medium">{metrics.cpu.temperature.toFixed(1)}°C</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Frequency</div>
                    <div className="font-medium">{metrics.cpu.frequency.toFixed(2)} GHz</div>
                  </div>
                </div>
                
                <div className="text-sm">
                  <div className="text-muted-foreground">Cores</div>
                  <div className="font-medium">{metrics.cpu.cores} cores</div>
                </div>
              </CardContent>
            </Card>

            {/* GPU Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  GPU Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usage</span>
                    <span>{metrics.gpu.usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.gpu.usage} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>VRAM Usage</span>
                    <span>{metrics.gpu.vramUsed.toFixed(0)}MB / {metrics.gpu.vram}MB</span>
                  </div>
                  <Progress value={(metrics.gpu.vramUsed / metrics.gpu.vram) * 100} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Temperature</div>
                    <div className="flex items-center gap-1">
                      <Thermometer className="h-3 w-3" />
                      <span className="font-medium">{metrics.gpu.temperature.toFixed(1)}°C</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Model</div>
                    <div className="font-medium text-xs">{metrics.gpu.name}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  System Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>RAM Usage</span>
                    <span>{metrics.system.ramUsage.toFixed(1)}GB / {metrics.system.ramTotal}GB</span>
                  </div>
                  <Progress value={(metrics.system.ramUsage / metrics.system.ramTotal) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Disk Usage</span>
                    <span>{metrics.system.diskUsage}GB / {metrics.system.diskTotal}GB</span>
                  </div>
                  <Progress value={(metrics.system.diskUsage / metrics.system.diskTotal) * 100} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Fan Speed</div>
                    <div className="flex items-center gap-1">
                      <Wind className="h-3 w-3" />
                      <span className="font-medium">{metrics.system.fanSpeed} RPM</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Network Latency</div>
                    <div className="font-medium">{metrics.system.networkLatency.toFixed(0)}ms</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Network Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {getNetworkIcon(status.networkStatus)}
                  <div>
                    <div className="font-medium capitalize">{status.networkStatus}</div>
                    <div className="text-sm text-muted-foreground">
                      {status.networkStatus === 'ethernet' ? 'High-speed connection' : 
                       status.networkStatus === 'wifi' ? 'Wireless connection' : 'No connection'}
                    </div>
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg border ${getEligibilityColor(status.eligibility)}`}>
                  <div className="font-medium">Task Eligibility</div>
                  <div className="text-sm">
                    {status.eligibility === 'high_tier' ? 'Eligible for all task tiers' :
                     status.eligibility === 'standard' ? 'Eligible for standard tasks only' :
                     'Not eligible for tasks'}
                  </div>
                </div>
                
                {status.currentTask && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-blue-800">Currently Processing</div>
                    <div className="text-sm text-blue-600">{status.currentTask}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="current" className="space-y-4">
          {currentSession ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    {currentSession.type}
                  </CardTitle>
                  <Badge variant={currentSession.status === 'running' ? 'default' : 'secondary'}>
                    {currentSession.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{currentSession.progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={currentSession.progress} className="h-3" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Started</div>
                    <div className="font-medium">{currentSession.startTime.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Duration</div>
                    <div className="font-medium">{currentSession.estimatedDuration} minutes</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Credits Earned</div>
                    <div className="font-medium">{formatCurrency(currentSession.creditsEarned)}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">CPU Usage</div>
                    <div className="font-medium">{currentSession.resourceUsage.cpu.usage.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">GPU Usage</div>
                    <div className="font-medium">{currentSession.resourceUsage.gpu.usage.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">RAM Usage</div>
                    <div className="font-medium">{currentSession.resourceUsage.system.ramUsage.toFixed(1)}GB</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Square className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Active Task</h3>
                <p className="text-muted-foreground mb-4">
                  Start a task to begin earning credits
                </p>
                <Button onClick={handleStartTask} disabled={!status.isOnline}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Sample Task
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {sessionHistory.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Session History</h3>
                <p className="text-muted-foreground">
                  Completed tasks will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {sessionHistory.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {session.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium">{session.type}</div>
                          <div className="text-sm text-muted-foreground">
                            {session.startTime.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(session.creditsEarned)} credits</div>
                        <Badge variant={session.status === 'completed' ? 'default' : 'destructive'}>
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="simulation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Simulation</CardTitle>
              <CardDescription>
                Simulate different network conditions and system states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => dashboard.simulateNetworkChange('ethernet')}
                  className="w-full"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Switch to Ethernet
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => dashboard.simulateNetworkChange('wifi')}
                  className="w-full"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Switch to WiFi
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => dashboard.simulateNetworkChange('offline')}
                  className="w-full"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Go Offline
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => dashboard.simulateHighLoad()}
                className="w-full"
              >
                <Thermometer className="h-4 w-4 mr-2" />
                Simulate High Load
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
