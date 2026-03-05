import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReputationSystem, ReputationMetrics, Badge as ReputationBadge, ReputationEvent } from '@/lib/reputation-system';
import { 
  Trophy, 
  Star, 
  Shield, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Award,
  Target,
  Zap,
  Crown,
  Gem,
  Medal,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react';

interface ReputationSystemProps {
  onReputationChange?: (metrics: ReputationMetrics) => void;
}

export const ReputationSystemComponent: React.FC<ReputationSystemProps> = ({ onReputationChange }) => {
  const [reputationSystem] = useState(() => new ReputationSystem());
  const [metrics, setMetrics] = useState<ReputationMetrics>(reputationSystem.getMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      const newMetrics = reputationSystem.getMetrics();
      setMetrics(newMetrics);
      onReputationChange?.(newMetrics);
    }, 2000);

    return () => clearInterval(interval);
  }, [reputationSystem, onReputationChange]);

  const simulateTaskCompletion = () => {
    const success = Math.random() > 0.1; // 90% success rate
    const completionTime = 30 + Math.random() * 60; // 30-90 minutes
    const expectedTime = 60;
    
    reputationSystem.recordTaskCompletion(success, completionTime, expectedTime);
  };

  const simulateNetworkUptime = () => {
    const uptime = 95 + Math.random() * 5; // 95-100% uptime
    reputationSystem.recordNetworkUptime(uptime);
  };

  const simulateSecurityIncident = () => {
    const severities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    reputationSystem.recordSecurityIncident(severity);
  };

  const exportData = () => {
    const data = reputationSystem.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reputation-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target?.result as string;
          reputationSystem.importData(data);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const resetReputation = () => {
    if (confirm('Are you sure you want to reset your reputation? This cannot be undone.')) {
      reputationSystem.reset();
    }
  };

  const getLevelIcon = (level: ReputationMetrics['level']) => {
    switch (level) {
      case 'bronze':
        return <Medal className="h-6 w-6 text-amber-600" />;
      case 'silver':
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 'gold':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'platinum':
        return <Crown className="h-6 w-6 text-purple-500" />;
      case 'diamond':
        return <Gem className="h-6 w-6 text-blue-500" />;
      default:
        return <Medal className="h-6 w-6 text-gray-400" />;
    }
  };

  const getLevelColor = (level: ReputationMetrics['level']) => {
    switch (level) {
      case 'bronze':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'silver':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'platinum':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'diamond':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBadgeRarityColor = (rarity: ReputationBadge['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800';
      case 'rare':
        return 'bg-blue-100 text-blue-800';
      case 'epic':
        return 'bg-purple-100 text-purple-800';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventIcon = (type: ReputationEvent['type']) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'task_failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'network_downtime':
        return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'security_incident':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'milestone_reached':
        return <Star className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const creditMultiplier = reputationSystem.getCreditMultiplier();
  const taskPriority = reputationSystem.getTaskPriority();

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Reputation System
        </CardTitle>
        <CardDescription>
          Track your performance and earn rewards for reliable task execution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                {getLevelIcon(metrics.level)}
              </div>
              <div className="text-2xl font-bold capitalize">{metrics.level}</div>
              <div className="text-sm text-muted-foreground">Reputation Level</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{metrics.overallScore.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{creditMultiplier.toFixed(1)}x</div>
              <div className="text-sm text-muted-foreground">Credit Multiplier</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{taskPriority}</div>
              <div className="text-sm text-muted-foreground">Task Priority</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Network Uptime</span>
                      <span>{metrics.networkUptime.toFixed(2)}%</span>
                    </div>
                    <Progress value={metrics.networkUptime} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Task Success Rate</span>
                      <span>{metrics.taskSuccessRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.taskSuccessRate} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Reliability Score</span>
                      <span>{metrics.reliabilityScore.toFixed(1)}</span>
                    </div>
                    <Progress value={metrics.reliabilityScore} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Performance Score</span>
                      <span>{metrics.performanceScore.toFixed(1)}</span>
                    </div>
                    <Progress value={metrics.performanceScore} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Security Score</span>
                      <span>{metrics.securityScore.toFixed(1)}</span>
                    </div>
                    <Progress value={metrics.securityScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Level Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`p-4 rounded-lg border ${getLevelColor(metrics.level)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {getLevelIcon(metrics.level)}
                      <span className="font-bold capitalize">{metrics.level} Level</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>• Credit Multiplier: {creditMultiplier}x</div>
                      <div>• Task Priority: {taskPriority}</div>
                      <div>• Overall Score: {metrics.overallScore.toFixed(1)}/100</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Next Level Requirements</h4>
                    <div className="text-sm text-muted-foreground">
                      {metrics.level === 'diamond' ? (
                        'You\'ve reached the highest level!'
                      ) : (
                        `Score ${(metrics.overallScore >= 85 ? 95 : metrics.overallScore >= 70 ? 85 : metrics.overallScore >= 55 ? 70 : 55)} to advance to ${metrics.level === 'bronze' ? 'Silver' : metrics.level === 'silver' ? 'Gold' : metrics.level === 'gold' ? 'Platinum' : 'Diamond'}`
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            <div>
              <h4 className="text-lg font-medium mb-4">Earned Badges ({metrics.badges.length})</h4>
              {metrics.badges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No badges earned yet. Complete tasks to earn badges!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {metrics.badges.map((badge) => (
                    <Card key={badge.id} className="text-center">
                      <CardContent className="p-4">
                        <div className="text-4xl mb-2">{badge.icon}</div>
                        <h5 className="font-medium">{badge.name}</h5>
                        <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                        <Badge className={getBadgeRarityColor(badge.rarity)}>
                          {badge.rarity.toUpperCase()}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-2">
                          Earned {badge.earnedAt.toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div>
              <h4 className="text-lg font-medium mb-4">Recent Activity</h4>
              {metrics.history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No reputation events yet
                </div>
              ) : (
                <div className="space-y-2">
                  {metrics.history.slice(0, 20).map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getEventIcon(event.type)}
                            <div>
                              <div className="font-medium">{event.description}</div>
                              <div className="text-sm text-muted-foreground">
                                {event.timestamp.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className={`font-medium ${event.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {event.impact > 0 ? '+' : ''}{event.impact}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div>
              <h4 className="text-lg font-medium mb-4">Simulate Actions</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button onClick={simulateTaskCompletion} variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Task
                </Button>
                <Button onClick={simulateNetworkUptime} variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Update Uptime
                </Button>
                <Button onClick={simulateSecurityIncident} variant="outline">
                  <XCircle className="h-4 w-4 mr-2" />
                  Security Issue
                </Button>
                <Button onClick={resetReputation} variant="destructive">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-4">Data Management</h4>
              <div className="flex gap-4">
                <Button onClick={exportData} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button onClick={importData} variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
