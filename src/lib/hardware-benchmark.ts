export interface HardwareInfo {
  cpu: {
    cores: number;
    model: string;
    architecture: string;
    speed: number;
  };
  gpu: {
    available: boolean;
    model?: string;
    vram?: number;
    cores?: number;
  };
  ram: {
    total: number;
    available: number;
    speed: number;
  };
  storage: {
    total: number;
    available: number;
  };
}

export interface PerformanceScore {
  overall: number;
  cpu: number;
  gpu: number;
  ram: number;
  storage: number;
  tier: 'basic' | 'standard' | 'high' | 'enterprise';
  suitableTasks: string[];
}

export class HardwareBenchmarkSuite {
  private hardwareInfo: HardwareInfo | null = null;
  private performanceScore: PerformanceScore | null = null;

  async runFullBenchmark(): Promise<{ hardware: HardwareInfo; performance: PerformanceScore }> {
    this.hardwareInfo = await this.detectHardware();
    this.performanceScore = await this.calculatePerformanceScore(this.hardwareInfo);
    
    return {
      hardware: this.hardwareInfo,
      performance: this.performanceScore
    };
  }

  private async detectHardware(): Promise<HardwareInfo> {
    const hardwareInfo: HardwareInfo = {
      cpu: {
        cores: navigator.hardwareConcurrency || 4,
        model: 'Unknown',
        architecture: 'x64',
        speed: 0
      },
      gpu: {
        available: false,
        model: undefined,
        vram: undefined,
        cores: undefined
      },
      ram: {
        total: 0,
        available: 0,
        speed: 0
      },
      storage: {
        total: 0,
        available: 0
      }
    };

    // Get GPU info
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        hardwareInfo.gpu.available = true;
        hardwareInfo.gpu.model = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }

    // Estimate RAM (limited in browser)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      hardwareInfo.ram.total = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      hardwareInfo.ram.available = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
    }

    // Storage quota estimation
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      hardwareInfo.storage.total = Math.round((estimate.quota || 0) / 1024 / 1024);
      hardwareInfo.storage.available = Math.round((estimate.quota || 0) / 1024 / 1024);
    }

    return hardwareInfo;
  }

  private async calculatePerformanceScore(hardware: HardwareInfo): Promise<PerformanceScore> {
    const cpuScore = this.calculateCPUScore(hardware.cpu);
    const gpuScore = this.calculateGPUScore(hardware.gpu);
    const ramScore = this.calculateRAMScore(hardware.ram);
    const storageScore = this.calculateStorageScore(hardware.storage);

    const overall = Math.round((cpuScore * 0.3 + gpuScore * 0.4 + ramScore * 0.2 + storageScore * 0.1));

    const tier = this.determineTier(overall);
    const suitableTasks = this.getSuitableTasks(tier, cpuScore, gpuScore);

    return {
      overall,
      cpu: cpuScore,
      gpu: gpuScore,
      ram: ramScore,
      storage: storageScore,
      tier,
      suitableTasks
    };
  }

  private calculateCPUScore(cpu: HardwareInfo['cpu']): number {
    let score = 0;
    
    // Base score for cores
    score += Math.min(cpu.cores * 10, 100);
    
    // Bonus for higher clock speeds (if available)
    if (cpu.speed > 0) {
      score += Math.min(cpu.speed / 100, 50);
    }
    
    return Math.min(Math.round(score), 100);
  }

  private calculateGPUScore(gpu: HardwareInfo['gpu']): number {
    if (!gpu.available) return 0;
    
    let score = 20; // Base score for having GPU
    
    // VRAM scoring
    if (gpu.vram) {
      if (gpu.vram >= 12000) score += 60; // High-end
      else if (gpu.vram >= 8000) score += 40; // Mid-range
      else if (gpu.vram >= 4000) score += 20; // Entry-level
    }
    
    // GPU cores scoring
    if (gpu.cores) {
      score += Math.min(gpu.cores / 100, 20);
    }
    
    return Math.min(Math.round(score), 100);
  }

  private calculateRAMScore(ram: HardwareInfo['ram']): number {
    if (ram.total <= 0) return 0;
    
    if (ram.total >= 32000) return 100; // 32GB+
    if (ram.total >= 16000) return 80;  // 16GB
    if (ram.total >= 8000) return 60;   // 8GB
    if (ram.total >= 4000) return 40;   // 4GB
    if (ram.total >= 2000) return 20;   // 2GB
    return 10;
  }

  private calculateStorageScore(storage: HardwareInfo['storage']): number {
    if (storage.total <= 0) return 0;
    
    const gb = storage.total / 1024 / 1024 / 1024;
    
    if (gb >= 1000) return 100; // 1TB+
    if (gb >= 500) return 80;   // 500GB
    if (gb >= 250) return 60;   // 250GB
    if (gb >= 100) return 40;   // 100GB
    return 20;
  }

  private determineTier(overall: number): PerformanceScore['tier'] {
    if (overall >= 80) return 'enterprise';
    if (overall >= 60) return 'high';
    if (overall >= 40) return 'standard';
    return 'basic';
  }

  private getSuitableTasks(tier: PerformanceScore['tier'], cpuScore: number, gpuScore: number): string[] {
    const tasks: string[] = [];
    
    switch (tier) {
      case 'enterprise':
        tasks.push(
          'AI Model Training',
          '3D Rendering',
          'Scientific Computing',
          'Video Encoding',
          'Blockchain Mining',
          'Data Analytics'
        );
        break;
      case 'high':
        tasks.push(
          'Machine Learning Inference',
          'Video Processing',
          'Game Server Hosting',
          'Complex Simulations'
        );
        break;
      case 'standard':
        tasks.push(
          'Web Scraping',
          'Data Processing',
          'Light Computing Tasks',
          'API Services'
        );
        break;
      case 'basic':
        tasks.push(
          'Simple Data Entry',
          'Basic Web Tasks',
          'Light Processing'
        );
        break;
    }
    
    // GPU-specific tasks
    if (gpuScore >= 60) {
      tasks.push('GPU Accelerated Computing');
    }
    
    // CPU-specific tasks
    if (cpuScore >= 70) {
      tasks.push('CPU Intensive Calculations');
    }
    
    return [...new Set(tasks)];
  }

  getHardwareInfo(): HardwareInfo | null {
    return this.hardwareInfo;
  }

  getPerformanceScore(): PerformanceScore | null {
    return this.performanceScore;
  }

  async runQuickBenchmark(): Promise<number> {
    const startTime = performance.now();
    
    // CPU benchmark - simple calculation
    const iterations = 10000000;
    let result = 0;
    for (let i = 0; i < iterations; i++) {
      result += Math.sqrt(i) * Math.sin(i);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Score based on performance (lower time = higher score)
    const score = Math.max(0, Math.min(100, 100 - (duration / 100)));
    
    return Math.round(score);
  }
}
