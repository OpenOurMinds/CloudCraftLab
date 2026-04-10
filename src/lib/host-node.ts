export interface ContainerTask {
  id: string;
  type: string;
  reward: number;
  progress: number;
}

export interface HostMetrics {
  resources: {
    id: string;
    cpuCores: number;
    ramGB: number;
    gpuModel: string;
  };
  usage: {
    cpuPrecent: number;
    ramBytes: number;
    gpuPercent: number;
  };
  earnings: {
    credits: number;
  };
}

export class HostNode {
  start() {}
  stop() {}
  
  getMetrics(): HostMetrics {
    return {
      resources: {
        id: 'NODE-08X9A',
        cpuCores: 16,
        ramGB: 32,
        gpuModel: 'RTX 4090'
      },
      usage: {
        cpuPrecent: Math.random() * 20 + 10,
        ramBytes: 8.4 * 1e9,
        gpuPercent: Math.random() * 40 + 50
      },
      earnings: {
        credits: 324.50
      }
    };
  }

  getActiveTasks(): ContainerTask[] {
    return [
      { id: 'TSK-1A', type: 'AI_TRAIN', reward: 15, progress: 42 },
      { id: 'TSK-2B', type: 'DATA_PROC', reward: 8, progress: 87 }
    ];
  }
}
