export interface NetworkStatus {
  isConnected: boolean;
  connectionType: 'ethernet' | 'wifi' | 'unknown';
  latency: number;
  packetLoss: number;
  uptime: number;
  lastCheck: Date;
  stability: 'stable' | 'unstable' | 'critical';
}

export interface NetworkConfig {
  heartbeatServer: string;
  pingInterval: number;
  latencyThreshold: number;
  packetLossThreshold: number;
  stabilityWindow: number;
}

export class NetworkStabilityMonitor {
  private config: NetworkConfig;
  private status: NetworkStatus;
  private pingHistory: number[] = [];
  private packetLossCount = 0;
  private totalPings = 0;
  private intervalId?: number;
  private startTime = Date.now();

  constructor(config: Partial<NetworkConfig> = {}) {
    this.config = {
      heartbeatServer: '8.8.8.8',
      pingInterval: 5000,
      latencyThreshold: 100,
      packetLossThreshold: 0.05,
      stabilityWindow: 10,
      ...config
    };

    this.status = {
      isConnected: false,
      connectionType: 'unknown',
      latency: 0,
      packetLoss: 0,
      uptime: 0,
      lastCheck: new Date(),
      stability: 'critical'
    };
  }

  async startMonitoring(): Promise<void> {
    await this.detectConnectionType();
    await this.performPing();
    
    this.intervalId = setInterval(async () => {
      await this.performPing();
      this.updateStability();
    }, this.config.pingInterval);
  }

  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private async detectConnectionType(): Promise<void> {
    try {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      
      if (connection) {
        this.status.connectionType = connection.type === 'ethernet' ? 'ethernet' : 'wifi';
      } else {
        this.status.connectionType = 'unknown';
      }
    } catch (error) {
      this.status.connectionType = 'unknown';
    }
  }

  private async performPing(): Promise<void> {
    const startTime = performance.now();
    
    try {
      const response = await fetch(`https://${this.config.heartbeatServer}`, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      this.status.isConnected = true;
      this.status.latency = Math.round(latency);
      this.pingHistory.push(latency);
      
      if (this.pingHistory.length > this.config.stabilityWindow) {
        this.pingHistory.shift();
      }
      
      this.totalPings++;
      
    } catch (error) {
      this.status.isConnected = false;
      this.status.latency = 0;
      this.packetLossCount++;
      this.totalPings++;
    }
    
    this.status.packetLoss = this.totalPings > 0 ? this.packetLossCount / this.totalPings : 0;
    this.status.uptime = Date.now() - this.startTime;
    this.status.lastCheck = new Date();
  }

  private updateStability(): void {
    if (!this.status.isConnected) {
      this.status.stability = 'critical';
      return;
    }

    if (this.status.packetLoss > this.config.packetLossThreshold) {
      this.status.stability = 'unstable';
      return;
    }

    if (this.status.latency > this.config.latencyThreshold) {
      this.status.stability = 'unstable';
      return;
    }

    if (this.pingHistory.length >= this.config.stabilityWindow) {
      const avgLatency = this.pingHistory.reduce((a, b) => a + b, 0) / this.pingHistory.length;
      const variance = this.pingHistory.reduce((sum, ping) => sum + Math.pow(ping - avgLatency, 2), 0) / this.pingHistory.length;
      
      if (variance < 25 && avgLatency < this.config.latencyThreshold) {
        this.status.stability = 'stable';
      } else {
        this.status.stability = 'unstable';
      }
    } else {
      this.status.stability = 'unstable';
    }
  }

  getStatus(): NetworkStatus {
    return { ...this.status };
  }

  isEligibleForTasks(): boolean {
    return this.status.isConnected && 
           this.status.connectionType === 'ethernet' &&
           this.status.stability === 'stable' &&
           this.status.packetLoss <= this.config.packetLossThreshold;
  }

  getPerformanceMultiplier(): number {
    if (!this.isEligibleForTasks()) return 0;
    
    const uptimeBonus = Math.min(this.status.uptime / (1000 * 60 * 60 * 24), 2); // Max 2x after 24h
    const stabilityBonus = this.status.stability === 'stable' ? 1.5 : 1;
    const connectionBonus = this.status.connectionType === 'ethernet' ? 1.2 : 1;
    
    return uptimeBonus * stabilityBonus * connectionBonus;
  }
}
