export interface HostStatus {
  isOnline: boolean;
  currentTask: string | null;
  sessionEarnings: number;
  totalEarnings: number;
  uptime: number;
  networkStatus: 'ethernet' | 'wifi' | 'offline';
  eligibility: 'high_tier' | 'standard' | 'ineligible';
}

export interface ResourceMetrics {
  cpu: {
    usage: number;
    temperature: number;
    cores: number;
    frequency: number;
  };
  gpu: {
    usage: number;
    temperature: number;
    vram: number;
    vramUsed: number;
    name: string;
  };
  system: {
    ramUsage: number;
    ramTotal: number;
    diskUsage: number;
    diskTotal: number;
    fanSpeed: number;
    networkLatency: number;
  };
}

export interface TaskSession {
  id: string;
  type: string;
  startTime: Date;
  estimatedDuration: number;
  progress: number;
  creditsEarned: number;
  status: 'running' | 'completed' | 'failed';
  resourceUsage: ResourceMetrics;
}

export class HostDashboard {
  private status: HostStatus;
  private metrics: ResourceMetrics;
  private currentSession: TaskSession | null = null;
  private sessionHistory: TaskSession[] = [];
  private updateInterval?: number;
  private callbacks: Set<(status: HostStatus) => void> = new Set();

  constructor() {
    this.status = {
      isOnline: false,
      currentTask: null,
      sessionEarnings: 0,
      totalEarnings: 0,
      uptime: 0,
      networkStatus: 'ethernet',
      eligibility: 'high_tier'
    };

    this.metrics = this.generateMockMetrics();
    this.startMonitoring();
  }

  private generateMockMetrics(): ResourceMetrics {
    return {
      cpu: {
        usage: 0,
        temperature: 45,
        cores: 8,
        frequency: 3.2
      },
      gpu: {
        usage: 0,
        temperature: 40,
        vram: 8000,
        vramUsed: 0,
        name: 'NVIDIA RTX 3080'
      },
      system: {
        ramUsage: 8,
        ramTotal: 16,
        diskUsage: 250,
        diskTotal: 1000,
        fanSpeed: 1200,
        networkLatency: 12
      }
    };
  }

  private startMonitoring(): void {
    this.updateInterval = window.setInterval(() => {
      this.updateMetrics();
      this.updateStatus();
      this.notifyCallbacks();
    }, 1000);
  }

  private updateMetrics(): void {
    // Simulate realistic resource usage
    const baseLoad = this.currentSession ? 0.3 : 0.1;
    const variation = Math.random() * 0.2 - 0.1;
    
    this.metrics.cpu.usage = Math.max(0, Math.min(100, baseLoad + variation + (this.currentSession ? 0.4 : 0)));
    this.metrics.cpu.temperature = 45 + this.metrics.cpu.usage * 0.4 + Math.random() * 5;
    this.metrics.cpu.frequency = 3.2 + (this.metrics.cpu.usage / 100) * 0.8;

    if (this.metrics.gpu.vram > 0) {
      this.metrics.gpu.usage = this.currentSession ? Math.min(100, baseLoad + variation + 0.5) : 0;
      this.metrics.gpu.temperature = 40 + this.metrics.gpu.usage * 0.3 + Math.random() * 3;
      this.metrics.gpu.vramUsed = this.metrics.gpu.vram * (this.metrics.gpu.usage / 100);
    }

    this.metrics.system.ramUsage = this.metrics.system.ramTotal * (0.5 + this.metrics.cpu.usage / 200);
    this.metrics.system.fanSpeed = 1200 + this.metrics.cpu.temperature * 15 + Math.random() * 200;
    this.metrics.system.networkLatency = 12 + Math.random() * 8;

    // Update session progress
    if (this.currentSession) {
      const elapsed = Date.now() - this.currentSession.startTime.getTime();
      const progress = Math.min(100, (elapsed / (this.currentSession.estimatedDuration * 1000)) * 100);
      this.currentSession.progress = progress;
      this.currentSession.resourceUsage = { ...this.metrics };

      if (progress >= 100) {
        this.completeCurrentSession();
      }
    }
  }

  private updateStatus(): void {
    this.status.uptime += 1000;
    
    // Simulate network changes
    if (Math.random() < 0.001) { // 0.1% chance per second
      this.status.networkStatus = Math.random() < 0.8 ? 'ethernet' : 'wifi';
      this.updateEligibility();
    }

    // Update earnings
    if (this.currentSession && this.currentSession.status === 'running') {
      const creditsPerSecond = this.currentSession.creditsEarned / this.currentSession.estimatedDuration;
      const earnedThisSecond = creditsPerSecond * (1 / 60); // Convert to per-second rate
      this.status.sessionEarnings += earnedThisSecond;
      this.status.totalEarnings += earnedThisSecond;
    }
  }

  private updateEligibility(): void {
    if (this.status.networkStatus === 'ethernet' && this.metrics.cpu.temperature < 85) {
      this.status.eligibility = 'high_tier';
    } else if (this.status.networkStatus === 'wifi' && this.metrics.cpu.temperature < 80) {
      this.status.eligibility = 'standard';
    } else {
      this.status.eligibility = 'ineligible';
    }
  }

  private completeCurrentSession(): void {
    if (this.currentSession) {
      this.currentSession.status = 'completed';
      this.currentSession.progress = 100;
      this.sessionHistory.unshift(this.currentSession);
      this.status.currentTask = null;
      this.currentSession = null;
    }
  }

  public goOnline(): void {
    this.status.isOnline = true;
    this.notifyCallbacks();
  }

  public goOffline(): void {
    this.status.isOnline = false;
    if (this.currentSession) {
      this.currentSession.status = 'failed';
      this.sessionHistory.unshift(this.currentSession);
      this.currentSession = null;
      this.status.currentTask = null;
    }
    this.notifyCallbacks();
  }

  public startTask(taskConfig: {
    type: string;
    estimatedDuration: number;
    creditsEarned: number;
  }): void {
    if (!this.status.isOnline || this.currentSession) {
      throw new Error('Cannot start task: not online or task already running');
    }

    this.currentSession = {
      id: 'task-' + Date.now(),
      type: taskConfig.type,
      startTime: new Date(),
      estimatedDuration: taskConfig.estimatedDuration,
      progress: 0,
      creditsEarned: taskConfig.creditsEarned,
      status: 'running',
      resourceUsage: { ...this.metrics }
    };

    this.status.currentTask = taskConfig.type;
    this.status.sessionEarnings = 0;
    this.notifyCallbacks();
  }

  public getStatus(): HostStatus {
    return { ...this.status };
  }

  public getMetrics(): ResourceMetrics {
    return { ...this.metrics };
  }

  public getCurrentSession(): TaskSession | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  public getSessionHistory(): TaskSession[] {
    return [...this.sessionHistory];
  }

  public onStatusUpdate(callback: (status: HostStatus) => void): void {
    this.callbacks.add(callback);
  }

  public offStatusUpdate(callback: (status: HostStatus) => void): void {
    this.callbacks.delete(callback);
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => callback(this.getStatus()));
  }

  public destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  // Mock network simulation
  public simulateNetworkChange(type: 'ethernet' | 'wifi' | 'offline'): void {
    this.status.networkStatus = type;
    this.updateEligibility();
    this.notifyCallbacks();
  }

  public simulateHighLoad(): void {
    this.metrics.cpu.usage = 85 + Math.random() * 10;
    this.metrics.gpu.usage = 90 + Math.random() * 10;
    this.metrics.cpu.temperature = 80 + Math.random() * 10;
    this.metrics.gpu.temperature = 75 + Math.random() * 10;
    this.updateEligibility();
    this.notifyCallbacks();
  }

  public getNetworkAlerts(): string[] {
    const alerts: string[] = [];
    
    if (this.status.networkStatus !== 'ethernet') {
      alerts.push(`⚠️ Network switched to ${this.status.networkStatus.toUpperCase()} - Ineligible for High-Tier Tasks`);
    }
    
    if (this.metrics.cpu.temperature > 85) {
      alerts.push(`🔥 High CPU temperature: ${this.metrics.cpu.temperature.toFixed(1)}°C`);
    }
    
    if (this.metrics.gpu.temperature > 80) {
      alerts.push(`🔥 High GPU temperature: ${this.metrics.gpu.temperature.toFixed(1)}°C`);
    }
    
    if (this.metrics.system.networkLatency > 50) {
      alerts.push(`🌐 High network latency: ${this.metrics.system.networkLatency.toFixed(0)}ms`);
    }
    
    return alerts;
  }
}
