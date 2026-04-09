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
  Server,
  Wifi,
} from 'lucide-react';

interface HostDashboardProps {
  onStatusChange?: (status: HostStatus) => void;
}

// Color based on percentage threshold
const getUsageColor = (val: number) => {
  if (val >= 85) return 'text-red-400';
  if (val >= 65) return 'text-yellow-400';
  return 'text-emerald-400';
};

const getTempColor = (val: number, isCPU: boolean) => {
  const limit = isCPU ? 85 : 80;
  if (val >= limit) return 'text-red-400';
  if (val >= limit * 0.8) return 'text-yellow-400';
  return 'text-emerald-400';
};

// Custom gauge bar with colored gradient
const UsageBar: React.FC<{ value: number; label: string; sublabel?: string }> = ({ value, label, sublabel }) => {
  const color =
    value >= 85 ? 'from-red-500 to-red-400' :
    value >= 65 ? 'from-yellow-500 to-yellow-400' :
                  'from-cyan-500 to-emerald-400';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-mono font-medium ${getUsageColor(value)}`}>{value.toFixed(1)}%{sublabel ? ` — ${sublabel}` : ''}</span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
};

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
    updateData();

    return () => {
      clearInterval(interval);
      dashboard.destroy();
    };
  }, [dashboard, onStatusChange]);

  const handleToggleOnline = (isOnline: boolean) => {
    if (isOnline) dashboard.goOnline();
    else dashboard.goOffline();
  };

  const handleStartTask = () => {
    try {
      dashboard.startTask({ type: 'AI Model Training', estimatedDuration: 120, creditsEarned: 150 });
    } catch (error) {
      console.error('Failed to start task:', error);
    }
  };

  const getEligibilityStyle = (eligibility: HostStatus['eligibility']) => {
    switch (eligibility) {
      case 'high_tier': return 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300';
      case 'standard':  return 'border-yellow-400/40 bg-yellow-400/10 text-yellow-300';
      case 'ineligible':return 'border-red-400/40 bg-red-400/10 text-red-300';
      default:          return 'border-border/40 bg-muted/30 text-muted-foreground';
    }
  };

  const getNetworkIcon = (networkStatus: HostStatus['networkStatus']) => {
    switch (networkStatus) {
      case 'ethernet': return <Globe className="h-4 w-4 text-cyan-400" />;
      case 'wifi':     return <Wifi  className="h-4 w-4 text-yellow-400" />;
      case 'offline':  return <XCircle className="h-4 w-4 text-red-400" />;
      default:         return <Globe  className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatUptime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
  };

  const fmt = (n: number) => n.toFixed(2);

  return (
    <div className="w-full max-w-7xl space-y-6">

      {/* ── Command Header ──────────────────────────────────────── */}
      <Card className="glass-card border-border/40">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Server className="h-5 w-5 text-cyan-400" />
                Earning Command Center
              </CardTitle>
              <CardDescription className="mt-1">
                Real-time monitoring of hardware health and credit accumulation
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Availability</span>
              <Switch
                checked={status.isOnline}
                onCheckedChange={handleToggleOnline}
                className="data-[state=checked]:bg-cyan-500"
              />
              <Badge
                variant={status.isOnline ? 'default' : 'secondary'}
                className={status.isOnline
                  ? 'bg-cyan-400/15 text-cyan-300 border-cyan-400/40 animate-glow-pulse'
                  : 'bg-muted text-muted-foreground border-border/40'}
              >
                {status.isOnline ? (
                  <><span className="pulse-dot mr-1.5" style={{ width: 6, height: 6 }} /> Online</>
                ) : 'Offline'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-2 mb-5">
              {alerts.map((alert, i) => (
                <Alert key={i} className="border-red-400/40 bg-red-400/8">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">{alert}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* KPI tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Network */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/40 bg-muted/20 gap-2">
              {getNetworkIcon(status.networkStatus)}
              <div className="text-xs text-muted-foreground capitalize">{status.networkStatus}</div>
              <Badge className={`text-xs ${getEligibilityStyle(status.eligibility)}`}>
                {status.eligibility.replace('_', ' ')}
              </Badge>
            </div>

            {/* Session Earnings */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5">
              <DollarSign className="h-5 w-5 text-cyan-400 mb-1" />
              <div className="text-2xl font-bold font-mono text-cyan-300">{fmt(status.sessionEarnings)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Session Earnings</div>
            </div>

            {/* Total Earnings */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5">
              <TrendingUp className="h-5 w-5 text-emerald-400 mb-1" />
              <div className="text-2xl font-bold font-mono text-emerald-300">{fmt(status.totalEarnings)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Total Earnings</div>
            </div>

            {/* Uptime */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-violet-400/20 bg-violet-400/5">
              <Clock className="h-5 w-5 text-violet-400 mb-1" />
              <div className="text-2xl font-bold font-mono text-violet-300">{formatUptime(status.uptime)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Detail Tabs ─────────────────────────────────────────── */}
      <Tabs defaultValue="resources" className="w-full">
        <TabsList className="glass-card border-border/40 p-1 gap-1 rounded-xl w-full grid grid-cols-4">
          {[
            { value: 'resources',  label: 'Resources'       },
            { value: 'current',    label: 'Current Task'    },
            { value: 'history',    label: 'Session History' },
            { value: 'simulation', label: 'Simulation'      },
          ].map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-lg data-[state=active]:bg-cyan-400 data-[state=active]:text-navy-900
                         data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Resources */}
        <TabsContent value="resources" className="space-y-4 mt-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* CPU */}
            <Card className="glass-card border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Cpu className="h-4 w-4 text-cyan-400" /> CPU Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <UsageBar value={metrics.cpu.usage} label="Usage" />
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-0.5">Temp</div>
                    <div className={`font-mono font-medium ${getTempColor(metrics.cpu.temperature, true)}`}>
                      {metrics.cpu.temperature.toFixed(1)}°C
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-0.5">Freq</div>
                    <div className="font-mono font-medium">{metrics.cpu.frequency.toFixed(2)} GHz</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-0.5">Cores</div>
                    <div className="font-mono font-medium">{metrics.cpu.cores}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GPU */}
            <Card className="glass-card border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Zap className="h-4 w-4 text-violet-400" /> GPU Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <UsageBar value={metrics.gpu.usage} label="Usage" />
                <UsageBar
                  value={(metrics.gpu.vramUsed / metrics.gpu.vram) * 100}
                  label="VRAM"
                  sublabel={`${metrics.gpu.vramUsed.toFixed(0)} / ${metrics.gpu.vram} MB`}
                />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-0.5">Temp</div>
                    <div className={`font-mono font-medium ${getTempColor(metrics.gpu.temperature, false)}`}>
                      {metrics.gpu.temperature.toFixed(1)}°C
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 overflow-hidden">
                    <div className="text-xs text-muted-foreground mb-0.5">Model</div>
                    <div className="font-mono text-xs font-medium truncate">{metrics.gpu.name}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System */}
            <Card className="glass-card border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <HardDrive className="h-4 w-4 text-emerald-400" /> System Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <UsageBar
                  value={(metrics.system.ramUsage / metrics.system.ramTotal) * 100}
                  label="RAM"
                  sublabel={`${metrics.system.ramUsage.toFixed(1)} / ${metrics.system.ramTotal} GB`}
                />
                <UsageBar
                  value={(metrics.system.diskUsage / metrics.system.diskTotal) * 100}
                  label="Disk"
                  sublabel={`${metrics.system.diskUsage} / ${metrics.system.diskTotal} GB`}
                />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-0.5">Fan Speed</div>
                    <div className="font-mono font-medium flex items-center gap-1">
                      <Wind className="h-3 w-3" />{metrics.system.fanSpeed} RPM
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-0.5">Latency</div>
                    <div className="font-mono font-medium">{metrics.system.networkLatency.toFixed(0)} ms</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network */}
            <Card className="glass-card border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Activity className="h-4 w-4 text-blue-400" /> Network Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-muted/20">
                  {getNetworkIcon(status.networkStatus)}
                  <div>
                    <div className="font-medium capitalize text-sm">{status.networkStatus}</div>
                    <div className="text-xs text-muted-foreground">
                      {status.networkStatus === 'ethernet' ? 'High-speed, low latency' :
                       status.networkStatus === 'wifi'     ? 'Wireless connection'     : 'No connection'}
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border text-sm ${getEligibilityStyle(status.eligibility)}`}>
                  <div className="font-semibold mb-0.5">Task Eligibility</div>
                  <div className="text-xs opacity-80">
                    {status.eligibility === 'high_tier'  ? 'Eligible for all task tiers'       :
                     status.eligibility === 'standard'   ? 'Eligible for standard tasks only'  :
                                                           'Not eligible for tasks'}
                  </div>
                </div>

                {status.currentTask && (
                  <div className="p-3 rounded-xl border border-cyan-400/30 bg-cyan-400/8 text-sm">
                    <div className="font-semibold text-cyan-300 mb-0.5">Currently Processing</div>
                    <div className="text-xs text-cyan-400/70">{status.currentTask}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Current Task */}
        <TabsContent value="current" className="space-y-4 mt-4 animate-fade-in">
          {currentSession ? (
            <Card className="glass-card border-border/40">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-cyan-400" />
                    {currentSession.type}
                  </CardTitle>
                  <Badge className={currentSession.status === 'running'
                    ? 'bg-cyan-400/15 text-cyan-300 border-cyan-400/40'
                    : 'bg-muted text-muted-foreground border-border/40'}>
                    {currentSession.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-mono text-cyan-400">{currentSession.progress.toFixed(1)}%</span>
                  </div>
                  <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-700"
                      style={{ width: `${currentSession.progress}%` }}
                    />
                    <div className="absolute inset-0 shimmer-bar opacity-30" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Started',         val: currentSession.startTime.toLocaleString() },
                    { label: 'Duration',        val: `${currentSession.estimatedDuration} min` },
                    { label: 'Credits Earned',  val: `${fmt(currentSession.creditsEarned)} cr` },
                  ].map(({ label, val }) => (
                    <div key={label} className="p-3 rounded-xl bg-muted/20 border border-border/40">
                      <div className="text-xs text-muted-foreground mb-1">{label}</div>
                      <div className="font-mono text-sm font-medium">{val}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'CPU',  val: `${currentSession.resourceUsage.cpu.usage.toFixed(1)}%` },
                    { label: 'GPU',  val: `${currentSession.resourceUsage.gpu.usage.toFixed(1)}%` },
                    { label: 'RAM',  val: `${currentSession.resourceUsage.system.ramUsage.toFixed(1)} GB` },
                  ].map(({ label, val }) => (
                    <div key={label} className="p-3 rounded-xl bg-muted/20 border border-border/40">
                      <div className="text-xs text-muted-foreground mb-1">{label}</div>
                      <div className="font-mono text-sm font-medium text-cyan-300">{val}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card border-border/40">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center gap-4">
                <Square className="h-12 w-12 text-muted-foreground/40" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">No Active Task</h3>
                  <p className="text-sm text-muted-foreground">Start a task to begin earning credits</p>
                </div>
                <Button
                  onClick={handleStartTask}
                  disabled={!status.isOnline}
                  className="bg-cyan-400 hover:bg-cyan-300 text-navy-900 font-semibold shadow-glow-cyan"
                >
                  <Play className="h-4 w-4 mr-2" /> Start Sample Task
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Session History */}
        <TabsContent value="history" className="space-y-3 mt-4 animate-fade-in">
          {sessionHistory.length === 0 ? (
            <Card className="glass-card border-border/40">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center gap-3">
                <Clock className="h-12 w-12 text-muted-foreground/40" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">No Session History</h3>
                  <p className="text-sm text-muted-foreground">Completed tasks will appear here</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            sessionHistory.map((session) => (
              <Card key={session.id} className="glass-card border-border/40 card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {session.status === 'completed'
                        ? <CheckCircle className="h-4 w-4 text-emerald-400" />
                        : <XCircle    className="h-4 w-4 text-red-400" />}
                      <div>
                        <div className="font-medium text-sm">{session.type}</div>
                        <div className="text-xs text-muted-foreground">{session.startTime.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-emerald-300">{fmt(session.creditsEarned)} cr</div>
                      <Badge
                        className={`text-xs mt-1 ${session.status === 'completed'
                          ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30'
                          : 'bg-red-400/10 text-red-300 border-red-400/30'}`}
                      >
                        {session.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Simulation */}
        <TabsContent value="simulation" className="mt-4 animate-fade-in">
          <Card className="glass-card border-border/40">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Network Simulation</CardTitle>
              <CardDescription>Simulate different network conditions and system states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: 'Switch to Ethernet', type: 'ethernet', icon: Globe,       color: 'hover:border-cyan-400/60 hover:text-cyan-400'    },
                  { label: 'Switch to WiFi',     type: 'wifi',     icon: Wifi,        color: 'hover:border-yellow-400/60 hover:text-yellow-400' },
                  { label: 'Go Offline',         type: 'offline',  icon: XCircle,     color: 'hover:border-red-400/60 hover:text-red-400'       },
                ] as const}
                  .map(({ label, type, icon: Icon, color }) => (
                  <Button
                    key={type}
                    variant="outline"
                    className={`w-full border-border/40 transition-all ${color}`}
                    onClick={() => dashboard.simulateNetworkChange(type)}
                  >
                    <Icon className="h-4 w-4 mr-2" /> {label}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full border-border/40 hover:border-orange-400/60 hover:text-orange-400 transition-all"
                onClick={() => dashboard.simulateHighLoad()}
              >
                <Thermometer className="h-4 w-4 mr-2" /> Simulate High Load
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
