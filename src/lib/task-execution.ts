export interface ComputeTask {
  id: string;
  type: 'ai_training' | 'data_processing' | 'web_scraping' | 'rendering' | 'scientific';
  title: string;
  description: string;
  requirements: {
    minCpuCores: number;
    minRamGB: number;
    minGpuVRAM?: number;
    estimatedDuration: number; // minutes
    dataTransferGB: number;
  };
  reward: number;
  encrypted: boolean;
  containerImage: string;
  command: string[];
  environment: Record<string, string>;
  inputFiles?: string[];
  outputFiles?: string[];
}

export interface TaskExecution {
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  progress: number;
  logs: string[];
  resourceUsage: {
    cpu: number;
    ram: number;
    gpu?: number;
  };
  result?: {
    outputData: string;
    metrics: Record<string, number>;
    success: boolean;
  };
}

export interface DockerContainer {
  id: string;
  image: string;
  status: 'running' | 'stopped' | 'error';
  ports?: Record<string, string>;
  volumes?: Record<string, string>;
  environment?: Record<string, string>;
  resourceLimits?: {
    memory: string;
    cpu: string;
  };
}

export class TaskExecutionEngine {
  private activeExecutions: Map<string, TaskExecution> = new Map();
  private containers: Map<string, DockerContainer> = new Map();
  private isDockerAvailable = false;

  constructor() {
    this.checkDockerAvailability();
  }

  private async checkDockerAvailability(): Promise<void> {
    try {
      // In a real implementation, this would check if Docker is available
      // For browser demo, we'll simulate Docker availability
      this.isDockerAvailable = true;
    } catch (error) {
      console.error('Docker not available:', error);
      this.isDockerAvailable = false;
    }
  }

  async executeTask(task: ComputeTask): Promise<TaskExecution> {
    if (!this.isDockerAvailable) {
      throw new Error('Docker is not available for task execution');
    }

    const execution: TaskExecution = {
      taskId: task.id,
      status: 'pending',
      progress: 0,
      logs: [`Starting task execution: ${task.title}`],
      resourceUsage: {
        cpu: 0,
        ram: 0,
        gpu: 0
      }
    };

    this.activeExecutions.set(task.id, execution);

    try {
      // Create container
      const container = await this.createContainer(task);
      this.containers.set(task.id, container);

      // Start execution
      execution.status = 'running';
      execution.startTime = new Date();
      execution.logs.push('Container created and started');

      // Simulate task execution
      await this.simulateTaskExecution(task, execution);

      // Complete execution
      execution.status = 'completed';
      execution.endTime = new Date();
      execution.progress = 100;
      execution.logs.push('Task completed successfully');

      // Generate result
      execution.result = {
        outputData: this.generateMockOutput(task),
        metrics: {
          executionTime: execution.endTime.getTime() - execution.startTime.getTime(),
          dataProcessed: Math.random() * 1000,
          accuracy: 0.95 + Math.random() * 0.05
        },
        success: true
      };

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.logs.push(`Task failed: ${error}`);
      execution.result = {
        outputData: '',
        metrics: {},
        success: false
      };
    }

    // Cleanup container
    await this.cleanupContainer(task.id);

    return execution;
  }

  private async createContainer(task: ComputeTask): Promise<DockerContainer> {
    const container: DockerContainer = {
      id: `container-${task.id}`,
      image: task.containerImage,
      status: 'running',
      environment: task.environment,
      resourceLimits: {
        memory: `${task.requirements.minRamGB}g`,
        cpu: `${task.requirements.minCpuCores}`
      }
    };

    // Simulate container creation
    await new Promise(resolve => setTimeout(resolve, 1000));

    return container;
  }

  private async simulateTaskExecution(task: ComputeTask, execution: TaskExecution): Promise<void> {
    const duration = task.requirements.estimatedDuration * 60 * 1000; // Convert to ms
    const steps = 10;
    const stepDuration = duration / steps;

    for (let i = 0; i < steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration / 100)); // Speed up for demo

      execution.progress = ((i + 1) / steps) * 100;
      execution.resourceUsage = {
        cpu: 50 + Math.random() * 50,
        ram: 30 + Math.random() * 40,
        gpu: task.requirements.minGpuVRAM ? Math.random() * 80 : undefined
      };

      execution.logs.push(`Step ${i + 1}/${steps} completed`);
    }
  }

  private generateMockOutput(task: ComputeTask): string {
    switch (task.type) {
      case 'ai_training':
        return JSON.stringify({
          modelAccuracy: 0.95,
          trainingLoss: 0.05,
          validationLoss: 0.08,
          epochs: 100
        });
      case 'data_processing':
        return JSON.stringify({
          recordsProcessed: 10000,
          errors: 0,
          outputSize: '2.5MB'
        });
      case 'web_scraping':
        return JSON.stringify({
          pagesScraped: 500,
          dataPoints: 15000,
          successRate: 0.98
        });
      case 'rendering':
        return JSON.stringify({
          framesRendered: 1200,
          resolution: '1920x1080',
          renderTime: '45min'
        });
      case 'scientific':
        return JSON.stringify({
          simulationSteps: 1000000,
          convergence: true,
          result: 42.195
        });
      default:
        return JSON.stringify({ success: true });
    }
  }

  private async cleanupContainer(taskId: string): Promise<void> {
    const container = this.containers.get(taskId);
    if (container) {
      container.status = 'stopped';
      this.containers.delete(taskId);
    }
  }

  getExecution(taskId: string): TaskExecution | undefined {
    return this.activeExecutions.get(taskId);
  }

  getAllExecutions(): TaskExecution[] {
    return Array.from(this.activeExecutions.values());
  }

  getActiveExecutions(): TaskExecution[] {
    return Array.from(this.activeExecutions.values()).filter(
      exec => exec.status === 'running' || exec.status === 'pending'
    );
  }

  cancelExecution(taskId: string): boolean {
    const execution = this.activeExecutions.get(taskId);
    if (execution && (execution.status === 'pending' || execution.status === 'running')) {
      execution.status = 'cancelled';
      execution.endTime = new Date();
      execution.logs.push('Task cancelled by user');
      this.cleanupContainer(taskId);
      return true;
    }
    return false;
  }

  getSystemStatus(): {
    isDockerAvailable: boolean;
    activeContainers: number;
    totalExecutions: number;
    systemLoad: {
      cpu: number;
      memory: number;
      disk: number;
    };
  } {
    return {
      isDockerAvailable: this.isDockerAvailable,
      activeContainers: this.containers.size,
      totalExecutions: this.activeExecutions.size,
      systemLoad: {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100
      }
    };
  }

  generateMockTasks(): ComputeTask[] {
    return [
      {
        id: 'task-1',
        type: 'ai_training',
        title: 'Image Classification Model Training',
        description: 'Train a CNN model on the CIFAR-10 dataset',
        requirements: {
          minCpuCores: 4,
          minRamGB: 8,
          minGpuVRAM: 4000,
          estimatedDuration: 120,
          dataTransferGB: 2
        },
        reward: 150,
        encrypted: true,
        containerImage: 'tensorflow/tensorflow:latest-gpu',
        command: ['python', 'train_model.py'],
        environment: {
          'EPOCHS': '100',
          'BATCH_SIZE': '32',
          'LEARNING_RATE': '0.001'
        }
      },
      {
        id: 'task-2',
        type: 'data_processing',
        title: 'Large Dataset Processing',
        description: 'Process and clean a 10GB dataset of customer information',
        requirements: {
          minCpuCores: 2,
          minRamGB: 4,
          estimatedDuration: 60,
          dataTransferGB: 10
        },
        reward: 50,
        encrypted: true,
        containerImage: 'python:3.9-slim',
        command: ['python', 'process_data.py'],
        environment: {
          'INPUT_FORMAT': 'csv',
          'OUTPUT_FORMAT': 'parquet'
        }
      },
      {
        id: 'task-3',
        type: 'web_scraping',
        title: 'E-commerce Data Collection',
        description: 'Scrape product information from 1000 e-commerce pages',
        requirements: {
          minCpuCores: 2,
          minRamGB: 2,
          estimatedDuration: 30,
          dataTransferGB: 0.5
        },
        reward: 25,
        encrypted: false,
        containerImage: 'python:3.9-slim',
        command: ['python', 'scraper.py'],
        environment: {
          'MAX_PAGES': '1000',
          'RATE_LIMIT': '1'
        }
      },
      {
        id: 'task-4',
        type: 'rendering',
        title: '3D Animation Rendering',
        description: 'Render 500 frames of 3D animation at 1080p',
        requirements: {
          minCpuCores: 8,
          minRamGB: 16,
          minGpuVRAM: 8000,
          estimatedDuration: 180,
          dataTransferGB: 5
        },
        reward: 200,
        encrypted: true,
        containerImage: 'blender/blender:latest',
        command: ['blender', '-b', '-t', '8', 'scene.blend', '-a'],
        environment: {
          'OUTPUT_FORMAT': 'PNG',
          'RESOLUTION': '1920x1080'
        }
      },
      {
        id: 'task-5',
        type: 'scientific',
        title: 'Molecular Dynamics Simulation',
        description: 'Run molecular dynamics simulation for protein folding',
        requirements: {
          minCpuCores: 16,
          minRamGB: 32,
          minGpuVRAM: 12000,
          estimatedDuration: 240,
          dataTransferGB: 3
        },
        reward: 300,
        encrypted: true,
        containerImage: 'gromacs/gromacs:latest',
        command: ['gmx', 'mdrun', '-deffnm', 'protein'],
        environment: {
          'SIMULATION_TIME': '100ns',
          'TIME_STEP': '2fs'
        }
      }
    ];
  }
}
