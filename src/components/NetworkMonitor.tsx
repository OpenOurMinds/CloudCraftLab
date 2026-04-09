import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NetworkStabilityMonitor, NetworkStatus } from '@/lib/network-monitor';
import { Activity, CheckSquare, XSquare, Zap } from 'lucide-react';

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

  const isEligible = monitor.isEligibleForTasks();

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Brutalist Button Controls */}
      <div className="flex gap-2">
        <Button
          onClick={startMonitoring}
          disabled={isMonitoring}
          className="bauhaus-button flex-1"
        >
          {isMonitoring ? 'DIAGNOSTIC ACTIVE' : 'INITIALIZE'}
        </Button>
        <Button
          onClick={stopMonitoring}
          disabled={!isMonitoring}
          className="bauhaus-button-outline"
        >
          HALT
        </Button>
      </div>

      {/* Primary Status Block */}
      <div className="grid grid-cols-2 gap-0 border-2 border-black divide-x-2 divide-black">
        <div className="p-4 flex flex-col items-center justify-center bg-gray-50">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Latency</span>
          <span className="text-3xl font-mono font-black">{status.latency}<span className="text-base text-gray-400">ms</span></span>
        </div>
        <div className="p-4 flex flex-col items-center justify-center bg-gray-50">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Loss</span>
          <span className="text-3xl font-mono font-black">{(status.packetLoss * 100).toFixed(1)}<span className="text-base text-gray-400">%</span></span>
        </div>
      </div>

      {/* Stability String */}
      <div className="border-2 border-black flex items-center p-3 font-mono font-bold bg-white">
        <Activity className="w-5 h-5 mr-3 shrink-0" />
        <div className="flex-1">STABILITY</div>
        <div className={`px-2 py-1 uppercase text-xs border-2 border-black ${status.stability === 'stable' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}>
          {status.stability}
        </div>
      </div>

      {/* Eligibility Box */}
      <div className={`mt-auto border-4 p-4 ${isEligible ? 'border-black bg-black text-white' : 'border-gray-300 bg-gray-100 text-black'}`}>
        <div className="flex items-center gap-3">
          {isEligible ? <CheckSquare className="w-8 h-8 shrink-0" /> : <XSquare className="w-8 h-8 shrink-0 text-gray-500" />}
          <div>
            <div className="font-black uppercase text-lg leading-tight tracking-tight">
              {isEligible ? 'ELIGIBLE BLOCK' : 'INELIGIBLE'}
            </div>
            <div className="font-mono text-xs opacity-70 mt-1">
              Minimum 100ms Ping Required
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
