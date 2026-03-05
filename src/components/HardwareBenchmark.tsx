import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HardwareBenchmarkSuite, HardwareInfo, PerformanceScore } from '@/lib/hardware-benchmark';
import { Cpu, HardDrive, MemoryStick, Zap, Trophy, Target } from 'lucide-react';

interface HardwareBenchmarkProps {
  onComplete?: (results: { hardware: HardwareInfo; performance: PerformanceScore }) => void;
}

export const HardwareBenchmark: React.FC<HardwareBenchmarkProps> = ({ onComplete }) => {
  const [benchmark] = useState(() => new HardwareBenchmarkSuite());
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null);
  const [performanceScore, setPerformanceScore] = useState<PerformanceScore | null>(null);
  const [quickScore, setQuickScore] = useState<number | null>(null);

  const runFullBenchmark = async () => {
    setIsRunning(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const results = await benchmark.runFullBenchmark();
      setHardwareInfo(results.hardware);
      setPerformanceScore(results.performance);
      setProgress(100);
      onComplete?.(results);
    } catch (error) {
      console.error('Benchmark failed:', error);
    } finally {
      clearInterval(progressInterval);
      setIsRunning(false);
    }
  };

  const runQuickBenchmark = async () => {
    setIsRunning(true);
    try {
      const score = await benchmark.runQuickBenchmark();
      setQuickScore(score);
    } catch (error) {
      console.error('Quick benchmark failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getTierColor = (tier: PerformanceScore['tier']) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-500';
      case 'high': return 'bg-blue-500';
      case 'standard': return 'bg-green-500';
      case 'basic': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTierIcon = (tier: PerformanceScore['tier']) => {
    switch (tier) {
      case 'enterprise': return <Trophy className="h-4 w-4" />;
      case 'high': return <Zap className="h-4 w-4" />;
      case 'standard': return <Target className="h-4 w-4" />;
      case 'basic': return <Target className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Hardware Benchmark Suite
        </CardTitle>
        <CardDescription>
          Analyze your system capabilities and determine suitable tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Benchmark Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={runFullBenchmark} 
            disabled={isRunning}
            variant={isRunning ? "secondary" : "default"}
          >
            {isRunning ? "Running Benchmark..." : "Run Full Benchmark"}
          </Button>
          <Button 
            onClick={runQuickBenchmark} 
            disabled={isRunning}
            variant="outline"
          >
            Quick Test
          </Button>
        </div>

        {/* Progress */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Benchmark Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Quick Score */}
        {quickScore !== null && !performanceScore && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{quickScore}</div>
              <div className="text-sm text-muted-foreground">Quick Performance Score</div>
            </div>
          </div>
        )}

        {/* Results */}
        {performanceScore && hardwareInfo && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="hardware">Hardware</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="tasks">Suitable Tasks</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getTierIcon(performanceScore.tier)}
                    <Badge variant="default" className={getTierColor(performanceScore.tier)}>
                      {performanceScore.tier.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold">{performanceScore.overall}</div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">CPU</span>
                      <span className="text-sm font-medium">{performanceScore.cpu}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">GPU</span>
                      <span className="text-sm font-medium">{performanceScore.gpu}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">RAM</span>
                      <span className="text-sm font-medium">{performanceScore.ram}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Storage</span>
                      <span className="text-sm font-medium">{performanceScore.storage}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hardware" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      CPU
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Cores:</span>
                      <span className="text-sm font-medium">{hardwareInfo.cpu.cores}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Model:</span>
                      <span className="text-sm font-medium">{hardwareInfo.cpu.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Architecture:</span>
                      <span className="text-sm font-medium">{hardwareInfo.cpu.architecture}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      GPU
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Available:</span>
                      <Badge variant={hardwareInfo.gpu.available ? "default" : "secondary"}>
                        {hardwareInfo.gpu.available ? "Yes" : "No"}
                      </Badge>
                    </div>
                    {hardwareInfo.gpu.available && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm">Model:</span>
                          <span className="text-sm font-medium">{hardwareInfo.gpu.model || "Unknown"}</span>
                        </div>
                        {hardwareInfo.gpu.vram && (
                          <div className="flex justify-between">
                            <span className="text-sm">VRAM:</span>
                            <span className="text-sm font-medium">{formatBytes(hardwareInfo.gpu.vram * 1024 * 1024)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MemoryStick className="h-4 w-4" />
                      RAM
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total:</span>
                      <span className="text-sm font-medium">{formatBytes(hardwareInfo.ram.total * 1024 * 1024)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Available:</span>
                      <span className="text-sm font-medium">{formatBytes(hardwareInfo.ram.available * 1024 * 1024)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HardDrive className="h-4 w-4" />
                      Storage
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total:</span>
                      <span className="text-sm font-medium">{formatBytes(hardwareInfo.storage.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Available:</span>
                      <span className="text-sm font-medium">{formatBytes(hardwareInfo.storage.available)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="space-y-4">
                {[
                  { name: 'CPU', score: performanceScore.cpu, icon: Cpu },
                  { name: 'GPU', score: performanceScore.gpu, icon: Zap },
                  { name: 'RAM', score: performanceScore.ram, icon: MemoryStick },
                  { name: 'Storage', score: performanceScore.storage, icon: HardDrive }
                ].map(({ name, score, icon: Icon }) => (
                  <div key={name} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{name}</span>
                      <span className="text-sm text-muted-foreground">({score}/100)</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <div>
                <h4 className="text-lg font-medium mb-3">Recommended Tasks</h4>
                <div className="grid grid-cols-2 gap-2">
                  {performanceScore.suitableTasks.map((task, index) => (
                    <Badge key={index} variant="secondary" className="justify-center">
                      {task}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
