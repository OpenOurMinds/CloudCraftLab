export interface TaskSubmission {
  containerImage: string;
  datasetLink: string;
  minPerformanceScore: number;
  maxCreditSpend: number;
  requirements: {
    cpuCores?: number;
    gpuVRAM?: number;
    ramGB?: number;
    duration?: number;
  };
  priority: 'low' | 'standard' | 'high';
  encrypted: boolean;
}

export interface TaskStatus {
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  assignedHosts: HostAssignment[];
  totalProgress: number;
  estimatedCompletion: Date;
  creditsSpent: number;
}

export interface HostAssignment {
  hostId: string;
  hostIp: string;
  performanceScore: number;
  status: 'assigned' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  creditsEarned: number;
}

export interface TaskResult {
  taskId: string;
  results: {
    outputData: string;
    metadata: Record<string, any>;
    hostResults: Array<{
      hostId: string;
      partialResult: string;
      executionTime: number;
      success: boolean;
    }>;
  };
  totalCost: number;
  completionTime: Date;
}

export interface MockHost {
  id: string;
  ip: string;
  location: string;
  performanceScore: number;
  networkType: 'ethernet' | 'wifi';
  isOnline: boolean;
  currentTasks: string[];
  reputation: number;
  specialties: string[];
}

export class ClientAPI {
  private tasks: Map<string, TaskStatus> = new Map();
  private results: Map<string, TaskResult> = new Map();
  private mockHosts: MockHost[] = [];
  private taskIdCounter = 1000;

  constructor() {
    this.initializeMockHosts();
  }

  private initializeMockHosts(): void {
    this.mockHosts = [
      {
        id: 'host-001',
        ip: '192.168.1.101',
        location: 'Seoul, South Korea',
        performanceScore: 85,
        networkType: 'ethernet',
        isOnline: true,
        currentTasks: [],
        reputation: 4.8,
        specialties: ['ai_training', 'rendering']
      },
      {
        id: 'host-002',
        ip: '10.0.0.45',
        location: 'Tokyo, Japan',
        performanceScore: 92,
        networkType: 'ethernet',
        isOnline: true,
        currentTasks: [],
        reputation: 4.9,
        specialties: ['ai_training', 'scientific']
      },
      {
        id: 'host-003',
        ip: '172.16.0.22',
        location: 'Singapore',
        performanceScore: 78,
        networkType: 'wifi',
        isOnline: true,
        currentTasks: [],
        reputation: 4.5,
        specialties: ['data_processing', 'web_scraping']
      },
      {
        id: 'host-004',
        ip: '203.0.113.15',
        location: 'Sydney, Australia',
        performanceScore: 88,
        networkType: 'ethernet',
        isOnline: true,
        currentTasks: [],
        reputation: 4.7,
        specialties: ['rendering', 'ai_training']
      },
      {
        id: 'host-005',
        ip: '198.51.100.8',
        location: 'Mumbai, India',
        performanceScore: 73,
        networkType: 'wifi',
        isOnline: false,
        currentTasks: [],
        reputation: 4.3,
        specialties: ['data_processing']
      },
      {
        id: 'host-006',
        ip: '192.0.2.55',
        location: 'Hong Kong',
        performanceScore: 95,
        networkType: 'ethernet',
        isOnline: true,
        currentTasks: [],
        reputation: 5.0,
        specialties: ['ai_training', 'scientific', 'rendering']
      },
      {
        id: 'host-007',
        ip: '10.1.0.33',
        location: 'Bangkok, Thailand',
        performanceScore: 68,
        networkType: 'wifi',
        isOnline: true,
        currentTasks: [],
        reputation: 4.2,
        specialties: ['web_scraping', 'data_processing']
      },
      {
        id: 'host-008',
        ip: '172.20.0.18',
        location: 'Taipei, Taiwan',
        performanceScore: 90,
        networkType: 'ethernet',
        isOnline: true,
        currentTasks: [],
        reputation: 4.8,
        specialties: ['ai_training', 'rendering']
      }
    ];
  }

  public async submitTask(submission: TaskSubmission): Promise<{ taskId: string; estimatedCost: number }> {
    const taskId = `task-${this.taskIdCounter++}`;
    
    // Find suitable hosts
    const suitableHosts = this.findSuitableHosts(submission);
    
    if (suitableHosts.length === 0) {
      throw new Error('No suitable hosts available for this task');
    }

    // Calculate estimated cost
    const estimatedCost = this.calculateCost(submission, suitableHosts.length);

    // Create task status
    const taskStatus: TaskStatus = {
      taskId,
      status: 'pending',
      progress: 0,
      assignedHosts: suitableHosts.map(host => ({
        hostId: host.id,
        hostIp: host.ip,
        performanceScore: host.performanceScore,
        status: 'assigned',
        progress: 0,
        startTime: new Date(),
        creditsEarned: 0
      })),
      totalProgress: 0,
      estimatedCompletion: new Date(Date.now() + (submission.requirements.duration || 60) * 60 * 1000),
      creditsSpent: 0
    };

    this.tasks.set(taskId, taskStatus);

    // Simulate task execution
    this.simulateTaskExecution(taskId, submission);

    return { taskId, estimatedCost };
  }

  private findSuitableHosts(submission: TaskSubmission): MockHost[] {
    return this.mockHosts.filter(host => {
      if (!host.isOnline) return false;
      if (host.performanceScore < submission.minPerformanceScore) return false;
      if (submission.requirements.cpuCores && host.performanceScore < submission.requirements.cpuCores * 10) return false;
      if (submission.requirements.gpuVRAM && host.performanceScore < 80) return false;
      if (submission.requirements.ramGB && host.performanceScore < submission.requirements.ramGB * 5) return false;
      return true;
    }).sort((a, b) => b.performanceScore - a.performanceScore);
  }

  private calculateCost(submission: TaskSubmission, hostCount: number): number {
    const baseCost = 10; // Base cost per task
    const performanceMultiplier = submission.minPerformanceScore / 50;
    const durationMultiplier = (submission.requirements.duration || 60) / 60;
    const hostMultiplier = hostCount;
    
    return Math.round(baseCost * performanceMultiplier * durationMultiplier * hostMultiplier);
  }

  private simulateTaskExecution(taskId: string, submission: TaskSubmission): void {
    const taskStatus = this.tasks.get(taskId);
    if (!taskStatus) return;

    // Start execution after a short delay
    setTimeout(() => {
      taskStatus.status = 'running';
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        const updatedTask = this.tasks.get(taskId);
        if (!updatedTask) {
          clearInterval(progressInterval);
          return;
        }

        // Update each host's progress
        updatedTask.assignedHosts.forEach(host => {
          if (host.status === 'assigned') {
            host.status = 'running';
          }
          
          if (host.status === 'running') {
            const progressIncrement = Math.random() * 15 + 5; // 5-20% progress per update
            host.progress = Math.min(100, host.progress + progressIncrement);
            
            if (host.progress >= 100) {
              host.status = 'completed';
              host.creditsEarned = Math.round(submission.maxCreditSpend / updatedTask.assignedHosts.length);
            }
          }
        });

        // Calculate total progress
        const totalProgress = updatedTask.assignedHosts.reduce((sum, host) => sum + host.progress, 0) / updatedTask.assignedHosts.length;
        updatedTask.totalProgress = totalProgress;
        updatedTask.progress = totalProgress;

        // Calculate credits spent
        const completedHosts = updatedTask.assignedHosts.filter(h => h.status === 'completed');
        updatedTask.creditsSpent = completedHosts.reduce((sum, host) => sum + host.creditsEarned, 0);

        // Check if task is complete
        if (updatedTask.assignedHosts.every(host => host.status === 'completed')) {
          updatedTask.status = 'completed';
          updatedTask.progress = 100;
          clearInterval(progressInterval);
          this.generateTaskResult(taskId, submission);
        }

        // Simulate random failures
        if (Math.random() < 0.02) { // 2% chance of failure per update
          const randomHost = updatedTask.assignedHosts.find(h => h.status === 'running');
          if (randomHost) {
            randomHost.status = 'failed';
          }
        }

      }, 2000); // Update every 2 seconds
    }, 3000); // Start after 3 seconds
  }

  private generateTaskResult(taskId: string, submission: TaskSubmission): void {
    const taskStatus = this.tasks.get(taskId);
    if (!taskStatus) return;

    const result: TaskResult = {
      taskId,
      results: {
        outputData: this.generateMockOutput(submission),
        metadata: {
          containerImage: submission.containerImage,
          datasetSize: '2.5GB',
          processingTime: taskStatus.assignedHosts.reduce((sum, host) => sum + (Date.now() - host.startTime.getTime()), 0),
          successRate: taskStatus.assignedHosts.filter(h => h.status === 'completed').length / taskStatus.assignedHosts.length
        },
        hostResults: taskStatus.assignedHosts.map(host => ({
          hostId: host.hostId,
          partialResult: `Partial result from ${host.hostIp}`,
          executionTime: Date.now() - host.startTime.getTime(),
          success: host.status === 'completed'
        }))
      },
      totalCost: taskStatus.creditsSpent,
      completionTime: new Date()
    };

    this.results.set(taskId, result);
  }

  private generateMockOutput(submission: TaskSubmission): string {
    if (submission.containerImage.includes('tensorflow')) {
      return JSON.stringify({
        modelAccuracy: 0.94,
        trainingLoss: 0.12,
        validationLoss: 0.15,
        epochs: 100,
        samplesProcessed: 50000
      });
    } else if (submission.containerImage.includes('blender')) {
      return JSON.stringify({
        framesRendered: 1200,
        resolution: '1920x1080',
        renderTime: '45min',
        outputSize: '2.1GB'
      });
    } else {
      return JSON.stringify({
        recordsProcessed: 100000,
        errors: 0,
        outputFormat: 'parquet',
        compressionRatio: 0.65
      });
    }
  }

  public async getTaskStatus(taskId: string): Promise<TaskStatus | null> {
    return this.tasks.get(taskId) || null;
  }

  public async getTaskResults(taskId: string): Promise<TaskResult | null> {
    return this.results.get(taskId) || null;
  }

  public async getAllTasks(): Promise<TaskStatus[]> {
    return Array.from(this.tasks.values());
  }

  public async getAvailableHosts(): Promise<MockHost[]> {
    return this.mockHosts.filter(host => host.isOnline);
  }

  public async getNetworkStats(): Promise<{
    totalHosts: number;
    onlineHosts: number;
    averagePerformance: number;
    networkDistribution: { ethernet: number; wifi: number };
    geographicDistribution: Record<string, number>;
  }> {
    const onlineHosts = this.mockHosts.filter(host => host.isOnline);
    const averagePerformance = onlineHosts.reduce((sum, host) => sum + host.performanceScore, 0) / onlineHosts.length;
    
    const networkDistribution = onlineHosts.reduce(
      (acc, host) => {
        acc[host.networkType]++;
        return acc;
      },
      { ethernet: 0, wifi: 0 }
    );

    const geographicDistribution = onlineHosts.reduce(
      (acc, host) => {
        const country = host.location.split(', ').pop() || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalHosts: this.mockHosts.length,
      onlineHosts: onlineHosts.length,
      averagePerformance,
      networkDistribution,
      geographicDistribution
    };
  }

  // Simulation methods
  public simulateHostStatusChange(hostId: string, isOnline: boolean): void {
    const host = this.mockHosts.find(h => h.id === hostId);
    if (host) {
      host.isOnline = isOnline;
    }
  }

  public simulateNetworkChange(): void {
    this.mockHosts.forEach(host => {
      if (Math.random() < 0.1) { // 10% chance to change network
        host.networkType = Math.random() < 0.7 ? 'ethernet' : 'wifi';
      }
    });
  }

  public getMockHosts(): MockHost[] {
    return [...this.mockHosts];
  }
}
