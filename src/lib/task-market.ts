export interface MarketTask {
  id: string;
  name: string;
  type: string;
  requester: string;
  reward: number;
  status: 'available' | 'running';
  progress: number;
  estimatedDuration: number;
  requirements: {
    cpuCores: number;
    ramGB: number;
    gpuVRAM: number;
  };
}

export interface NetworkStats {
  activeTasks: number;
  dockerReady: boolean;
  totalExecutions: number;
  creditBalance: number;
}

export function getMarketTasks(): MarketTask[] {
  return [
    {
      id: 'AI-782910AA',
      name: 'Stable Diffusion LoRA',
      type: 'AI Training',
      requester: '0x992...fa2',
      reward: 125,
      status: 'available',
      progress: 0,
      estimatedDuration: 1200000,
      requirements: { cpuCores: 8, ramGB: 16, gpuVRAM: 8000 }
    },
    {
      id: 'RND-44B9C1',
      name: 'Blender 4K Frame Render',
      type: 'Video Rendering',
      requester: 'StudioX',
      reward: 45,
      status: 'running',
      progress: 68,
      estimatedDuration: 450000,
      requirements: { cpuCores: 16, ramGB: 32, gpuVRAM: 4000 }
    }
  ];
}

export function getNetworkStats(): NetworkStats {
  return {
    activeTasks: 142,
    dockerReady: true,
    totalExecutions: 89432,
    creditBalance: 1250.50
  };
}
