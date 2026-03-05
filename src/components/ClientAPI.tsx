import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientAPI, TaskSubmission, TaskStatus, TaskResult, MockHost } from '@/lib/client-api';
import { 
  Server, 
  Globe, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity, 
  TrendingUp,
  DollarSign,
  Play,
  Download,
  Upload,
  MapPin,
  Zap,
  HardDrive,
  Cpu,
  RefreshCw,
  Star
} from 'lucide-react';

export const ClientAPIComponent: React.FC = () => {
  const [api] = useState(() => new ClientAPI());
  const [tasks, setTasks] = useState<TaskStatus[]>([]);
  const [results, setResults] = useState<TaskResult[]>([]);
  const [hosts, setHosts] = useState<MockHost[]>([]);
  const [networkStats, setNetworkStats] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<TaskStatus | null>(null);
  const [selectedResult, setSelectedResult] = useState<TaskResult | null>(null);

  // Form state
  const [formData, setFormData] = useState<TaskSubmission>({
    containerImage: 'tensorflow/tensorflow:latest-gpu',
    datasetLink: 'https://example.com/dataset.zip',
    minPerformanceScore: 70,
    maxCreditSpend: 100,
    requirements: {
      cpuCores: 4,
      gpuVRAM: 4000,
      ramGB: 8,
      duration: 60
    },
    priority: 'standard',
    encrypted: true
  });

  useEffect(() => {
    const loadData = async () => {
      const [allTasks, allHosts, stats] = await Promise.all([
        api.getAllTasks(),
        api.getAvailableHosts(),
        api.getNetworkStats()
      ]);
      
      setTasks(allTasks);
      setHosts(allHosts);
      setNetworkStats(stats);
    };

    loadData();
    
    const interval = setInterval(loadData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [api]);

  const handleSubmitTask = async () => {
    try {
      const result = await api.submitTask(formData);
      console.log('Task submitted:', result);
      
      // Refresh tasks
      const updatedTasks = await api.getAllTasks();
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Failed to submit task:', error);
    }
  };

  const handleViewResults = async (taskId: string) => {
    try {
      const result = await api.getTaskResults(taskId);
      setSelectedResult(result);
    } catch (error) {
      console.error('Failed to get results:', error);
    }
  };

  const handleSimulateNetworkChange = () => {
    api.simulateNetworkChange();
    
    // Refresh data
    setTimeout(async () => {
      const [updatedHosts, updatedStats] = await Promise.all([
        api.getAvailableHosts(),
        api.getNetworkStats()
      ]);
      setHosts(updatedHosts);
      setNetworkStats(updatedStats);
    }, 1000);
  };

  const handleSimulateHostToggle = (hostId: string) => {
    const host = hosts.find(h => h.id === hostId);
    if (host) {
      api.simulateHostStatusChange(hostId, !host.isOnline);
      
      // Refresh hosts
      setTimeout(async () => {
        const updatedHosts = await api.getAvailableHosts();
        setHosts(updatedHosts);
      }, 500);
    }
  };

  const getStatusIcon = (status: TaskStatus['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: TaskSubmission['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="w-full max-w-7xl space-y-6">
      {/* Network Overview */}
      {networkStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Network Overview
            </CardTitle>
            <CardDescription>
              Global distribution of computing resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 border rounded-lg">
                <Server className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{networkStats.totalHosts}</div>
                <div className="text-sm text-muted-foreground">Total Hosts</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{networkStats.onlineHosts}</div>
                <div className="text-sm text-muted-foreground">Online Hosts</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{networkStats.averagePerformance.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Avg Performance</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold">{networkStats.networkDistribution.ethernet}</div>
                <div className="text-sm text-muted-foreground">Ethernet Hosts</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Geographic Distribution: {Object.entries(networkStats.geographicDistribution)
                  .map(([country, count]) => `${country}: ${count}`)
                  .join(', ')}
              </div>
              <Button variant="outline" size="sm" onClick={handleSimulateNetworkChange}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Simulate Network Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="submit" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="submit">Submit Task</TabsTrigger>
          <TabsTrigger value="status">Task Status</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="hosts">Available Hosts</TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Submit New Task
              </CardTitle>
              <CardDescription>
                Configure and submit a computing task to the network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="containerImage">Container Image</Label>
                    <Input
                      id="containerImage"
                      value={formData.containerImage}
                      onChange={(e) => setFormData({...formData, containerImage: e.target.value})}
                      placeholder="tensorflow/tensorflow:latest-gpu"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="datasetLink">Dataset Link</Label>
                    <Input
                      id="datasetLink"
                      value={formData.datasetLink}
                      onChange={(e) => setFormData({...formData, datasetLink: e.target.value})}
                      placeholder="https://example.com/dataset.zip"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxCreditSpend">Max Credit Spend</Label>
                    <Input
                      id="maxCreditSpend"
                      type="number"
                      value={formData.maxCreditSpend}
                      onChange={(e) => setFormData({...formData, maxCreditSpend: parseInt(e.target.value)})}
                      placeholder="100"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="minPerformanceScore">Min Performance Score</Label>
                    <Input
                      id="minPerformanceScore"
                      type="number"
                      value={formData.minPerformanceScore}
                      onChange={(e) => setFormData({...formData, minPerformanceScore: parseInt(e.target.value)})}
                      placeholder="70"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cpuCores">CPU Cores</Label>
                      <Input
                        id="cpuCores"
                        type="number"
                        value={formData.requirements.cpuCores}
                        onChange={(e) => setFormData({
                          ...formData, 
                          requirements: {...formData.requirements, cpuCores: parseInt(e.target.value)}
                        })}
                        placeholder="4"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gpuVRAM">GPU VRAM (MB)</Label>
                      <Input
                        id="gpuVRAM"
                        type="number"
                        value={formData.requirements.gpuVRAM}
                        onChange={(e) => setFormData({
                          ...formData, 
                          requirements: {...formData.requirements, gpuVRAM: parseInt(e.target.value)}
                        })}
                        placeholder="4000"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: any) => setFormData({...formData, priority: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSubmitTask} className="w-full md:w-auto">
                  <Play className="h-4 w-4 mr-2" />
                  Submit Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Tasks Submitted</h3>
                  <p className="text-muted-foreground">
                    Submit your first task to see its status here
                  </p>
                </CardContent>
              </Card>
            ) : (
              tasks.map((task) => (
                <Card key={task.taskId}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(task.status)}
                        <div>
                          <div className="font-medium">{task.taskId}</div>
                          <div className="text-sm text-muted-foreground">
                            {task.assignedHosts.length} hosts assigned
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {task.creditsSpent} credits spent
                        </Badge>
                        {task.status === 'completed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewResults(task.taskId)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Results
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span>{task.totalProgress.toFixed(1)}%</span>
                      </div>
                      <Progress value={task.totalProgress} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      {task.assignedHosts.slice(0, 4).map((host, index) => (
                        <div key={host.hostId} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            host.status === 'completed' ? 'bg-green-500' :
                            host.status === 'running' ? 'bg-blue-500' :
                            host.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                          }`} />
                          <span>{host.hostIp}</span>
                          <span className="text-muted-foreground">({host.progress.toFixed(0)}%)</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {selectedResult ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Results for {selectedResult.taskId}</CardTitle>
                  <Button variant="outline" onClick={() => setSelectedResult(null)}>
                    Back to List
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Cost</div>
                    <div className="text-lg font-bold">{selectedResult.totalCost} credits</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Completion Time</div>
                    <div className="text-lg font-bold">{selectedResult.completionTime.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Output Data</h4>
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(JSON.parse(selectedResult.results.outputData), null, 2)}
                  </pre>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Host Results</h4>
                  {selectedResult.results.hostResults.map((hostResult, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{hostResult.hostId}</span>
                        <Badge variant={hostResult.success ? 'default' : 'destructive'}>
                          {hostResult.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Execution time: {formatDuration(hostResult.executionTime)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Download className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Results Selected</h3>
                <p className="text-muted-foreground">
                  Select a completed task to view its results
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="hosts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hosts.map((host) => (
              <Card key={host.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        host.isOnline ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium">{host.id}</span>
                    </div>
                    <Badge variant={host.isOnline ? 'default' : 'secondary'}>
                      {host.isOnline ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span>{host.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      <span>{host.ip}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" />
                      <span>Score: {host.performanceScore}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Zap className="h-3 w-3" />
                      <span>{host.networkType}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3" />
                      <span>{host.reputation.toFixed(1)} ⭐</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-3">
                    {host.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-3"
                    onClick={() => handleSimulateHostToggle(host.id)}
                  >
                    {host.isOnline ? 'Take Offline' : 'Bring Online'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
