import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskExecutionEngine, ComputeTask, TaskExecution } from '@/lib/task-execution';
import { CreditSystem } from '@/lib/credit-system';
import { 
  Server, 
  Clock, 
  DollarSign, 
  MemoryStick, 
  HardDrive, 
  Zap, 
  Play, 
  Square, 
  Eye,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface TaskMarketplaceProps {
  onTaskExecute?: (task: ComputeTask) => void;
  onTaskComplete?: (execution: TaskExecution) => void;
}

export const TaskMarketplace: React.FC<TaskMarketplaceProps> = ({ 
  onTaskExecute, 
  onTaskComplete 
}) => {
  const [engine] = useState(() => new TaskExecutionEngine());
  const [creditSystem] = useState(() => new CreditSystem());
  const [availableTasks, setAvailableTasks] = useState<ComputeTask[]>([]);
  const [activeExecutions, setActiveExecutions] = useState<TaskExecution[]>([]);
  const [selectedTask, setSelectedTask] = useState<ComputeTask | null>(null);
  const [systemStatus, setSystemStatus] = useState(engine.getSystemStatus());

  useEffect(() => {
    // Load mock tasks
    setAvailableTasks(engine.generateMockTasks());
    
    // Update system status periodically
    const interval = setInterval(() => {
      setSystemStatus(engine.getSystemStatus());
      setActiveExecutions(engine.getActiveExecutions());
    }, 2000);

    return () => clearInterval(interval);
  }, [engine]);

  const executeTask = async (task: ComputeTask) => {
    try {
      onTaskExecute?.(task);
      const execution = await engine.executeTask(task);
      onTaskComplete?.(execution);
      
      // Award credits for successful completion
      if (execution.result?.success) {
        creditSystem.earnCredits(
          task.reward,
          `Completed task: ${task.title}`,
          task.id
        );
      }
    } catch (error) {
      console.error('Task execution failed:', error);
    }
  };

  const cancelExecution = (taskId: string) => {
    engine.cancelExecution(taskId);
  };

  const getTaskTypeIcon = (type: ComputeTask['type']) => {
    switch (type) {
      case 'ai_training':
        return <Zap className="h-4 w-4" />;
      case 'data_processing':
        return <HardDrive className="h-4 w-4" />;
      case 'web_scraping':
        return <Eye className="h-4 w-4" />;
      case 'rendering':
        return <Activity className="h-4 w-4" />;
      case 'scientific':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  const getTaskTypeColor = (type: ComputeTask['type']) => {
    switch (type) {
      case 'ai_training':
        return 'bg-purple-100 text-purple-800';
      case 'data_processing':
        return 'bg-blue-100 text-blue-800';
      case 'web_scraping':
        return 'bg-green-100 text-green-800';
      case 'rendering':
        return 'bg-orange-100 text-orange-800';
      case 'scientific':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: TaskExecution['status']) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const balance = creditSystem.getBalance();

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Task Marketplace
        </CardTitle>
        <CardDescription>
          Browse and execute computing tasks to earn credits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Status */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{systemStatus.activeContainers}</div>
              <div className="text-sm text-muted-foreground">Active Tasks</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Server className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{systemStatus.isDockerAvailable ? 'Ready' : 'Offline'}</div>
              <div className="text-sm text-muted-foreground">Docker Status</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{systemStatus.totalExecutions}</div>
              <div className="text-sm text-muted-foreground">Total Executions</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{balance.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Credit Balance</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">Available Tasks</TabsTrigger>
            <TabsTrigger value="active">Active Executions</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTaskTypeIcon(task.type)}
                        <Badge className={getTaskTypeColor(task.type)}>
                          {task.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <Badge variant="default" className="text-green-600">
                        {task.reward} credits
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <CardDescription>{task.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Requirements */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Server className="h-3 w-3" />
                        <span>{task.requirements.minCpuCores}+ cores</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MemoryStick className="h-3 w-3" />
                        <span>{task.requirements.minRamGB}GB+ RAM</span>
                      </div>
                      {task.requirements.minGpuVRAM && (
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          <span>{task.requirements.minGpuVRAM / 1000}GB+ VRAM</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(task.requirements.estimatedDuration)}</span>
                      </div>
                    </div>

                    {/* Data Transfer */}
                    <div className="flex items-center gap-2 text-sm">
                      <HardDrive className="h-3 w-3" />
                      <span>{task.requirements.dataTransferGB}GB data transfer</span>
                      {task.encrypted && (
                        <Badge variant="secondary" className="text-xs">
                          Encrypted
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => executeTask(task)}
                        disabled={activeExecutions.length >= 3} // Limit concurrent tasks
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Execute Task
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedTask(task)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeExecutions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active executions
              </div>
            ) : (
              activeExecutions.map((execution) => {
                const task = availableTasks.find(t => t.id === execution.taskId);
                if (!task) return null;

                return (
                  <Card key={execution.taskId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(execution.status)}
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {execution.progress.toFixed(0)}%
                          </Badge>
                          {execution.status === 'running' && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => cancelExecution(execution.taskId)}
                            >
                              <Square className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Progress value={execution.progress} className="h-2" />
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">CPU Usage</div>
                          <div className="font-medium">{execution.resourceUsage.cpu.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">RAM Usage</div>
                          <div className="font-medium">{execution.resourceUsage.ram.toFixed(1)}%</div>
                        </div>
                        {execution.resourceUsage.gpu && (
                          <div>
                            <div className="text-muted-foreground">GPU Usage</div>
                            <div className="font-medium">{execution.resourceUsage.gpu.toFixed(1)}%</div>
                          </div>
                        )}
                      </div>

                      {/* Logs */}
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="text-sm font-medium mb-2">Recent Logs</div>
                        <div className="text-xs space-y-1 max-h-20 overflow-y-auto">
                          {execution.logs.slice(-3).map((log, index) => (
                            <div key={index} className="text-muted-foreground">
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {engine.getAllExecutions().filter(e => e.status === 'completed' || e.status === 'failed').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No completed executions yet
              </div>
            ) : (
              engine.getAllExecutions()
                .filter(e => e.status === 'completed' || e.status === 'failed')
                .map((execution) => {
                  const task = availableTasks.find(t => t.id === execution.taskId);
                  if (!task) return null;

                  return (
                    <Card key={execution.taskId}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(execution.status)}
                            <CardTitle className="text-lg">{task.title}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={execution.result?.success ? 'default' : 'destructive'}>
                              {execution.result?.success ? 'Success' : 'Failed'}
                            </Badge>
                            <Badge variant="secondary">
                              {task.reward} credits
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Duration</div>
                            <div className="font-medium">
                              {execution.startTime && execution.endTime && 
                                formatDuration(Math.round((execution.endTime.getTime() - execution.startTime.getTime()) / 60000))
                              }
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Completed</div>
                            <div className="font-medium">
                              {execution.endTime?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
