import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { NetworkStabilityMonitor, NetworkStatus } from '@/lib/network-monitor';
import { Wifi, Ethernet, Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface NetworkMonitorProps {
  onStatusChange?: (status: NetworkStatus) => void;
}

export const NetworkMonitor: React.FC<NetworkMonitorProps> = ({ onStatusChange }) => {
  const [monitor] = useState(() => new NetworkStabilityMonitor());
  const [status, setStatus] = useState<NetworkStatus>(monitor.getStatus());
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        const newStatus = monitor.getStatus();
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isMonitoring, monitor, onStatusChange]);

  const startMonitoring = async () => {
    await monitor.startMonitoring();
    setIsMonitoring(true);
  };

  const stopMonitoring = () => {
    monitor.stopMonitoring();
    setIsMonitoring(false);
  };

  const getConnectionIcon = () => {
    switch (status.connectionType) {
      case 'ethernet':
        return <Ethernet className="h-4 w-4" />;
      case 'wifi':
        return <Wifi className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status.stability) {
      case 'stable':
        return 'bg-green-500';
      case 'unstable':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (status.stability) {
      case 'stable':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unstable':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const isEligible = monitor.isEligibleForTasks();
  const performanceMultiplier = monitor.getPerformanceMultiplier();

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Network Stability Monitor
        </CardTitle>
        <CardDescription>
          Monitor your network connection quality for task eligibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={startMonitoring} 
            disabled={isMonitoring}
            variant={isMonitoring ? "secondary" : "default"}
          >
            {isMonitoring ? "Monitoring..." : "Start Monitoring"}
          </Button>
          <Button 
            onClick={stopMonitoring} 
            disabled={!isMonitoring}
            variant="outline"
          >
            Stop
          </Button>
        </div>

        {/* Connection Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Connection Type:</span>
              <div className="flex items-center gap-1">
                {getConnectionIcon()}
                <Badge variant={status.connectionType === 'ethernet' ? 'default' : 'secondary'}>
                  {status.connectionType.toUpperCase()}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                <Badge variant={status.stability === 'stable' ? 'default' : 'destructive'}>
                  {status.stability.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Latency:</span>
              <span className="text-sm">{status.latency}ms</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Packet Loss:</span>
              <span className="text-sm">{(status.packetLoss * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Signal Quality</span>
              <span>{Math.max(0, 100 - status.latency)}%</span>
            </div>
            <Progress value={Math.max(0, 100 - status.latency)} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Connection Stability</span>
              <span>{Math.max(0, 100 - status.packetLoss * 100)}%</span>
            </div>
            <Progress value={Math.max(0, 100 - status.packetLoss * 100)} className="h-2" />
          </div>
        </div>

        {/* Uptime and Performance */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <div className="text-sm text-muted-foreground">Uptime</div>
            <div className="text-lg font-semibold">{formatUptime(status.uptime)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Performance Multiplier</div>
            <div className="text-lg font-semibold">{performanceMultiplier.toFixed(2)}x</div>
          </div>
        </div>

        {/* Task Eligibility */}
        <div className={`p-4 rounded-lg border-2 ${
          isEligible 
            ? 'border-green-200 bg-green-50' 
            : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center gap-2">
            {isEligible ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <div>
              <div className="font-medium">
                {isEligible ? 'Eligible for Tasks' : 'Not Eligible for Tasks'}
              </div>
              <div className="text-sm text-muted-foreground">
                {isEligible 
                  ? 'Your connection meets all requirements for task execution'
                  : 'Improve your connection quality to become eligible'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Requirements Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div><strong>Requirements:</strong></div>
          <div>• Ethernet connection required</div>
          <div>• Latency under 100ms</div>
          <div>• Packet loss under 5%</div>
          <div>• Stable connection maintained</div>
        </div>
      </CardContent>
    </Card>
  );
};
