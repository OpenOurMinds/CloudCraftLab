export interface ReputationMetrics {
  overallScore: number;
  networkUptime: number;
  taskSuccessRate: number;
  averageCompletionTime: number;
  reliabilityScore: number;
  performanceScore: number;
  securityScore: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  badges: Badge[];
  history: ReputationEvent[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ReputationEvent {
  id: string;
  type: 'task_completed' | 'task_failed' | 'network_downtime' | 'security_incident' | 'milestone_reached';
  timestamp: Date;
  impact: number;
  description: string;
  metadata?: Record<string, any>;
}

export interface ReputationConfig {
  networkUptimeWeight: number;
  taskSuccessWeight: number;
  completionTimeWeight: number;
  reliabilityWeight: number;
  performanceWeight: number;
  securityWeight: number;
  decayRate: number;
  bonusThresholds: {
    excellent: number;
    good: number;
    average: number;
  };
}

export class ReputationSystem {
  private config: ReputationConfig;
  private metrics: ReputationMetrics;
  private storageKey = 'cloudcraft-reputation';

  constructor(config: Partial<ReputationConfig> = {}) {
    this.config = {
      networkUptimeWeight: 0.25,
      taskSuccessWeight: 0.30,
      completionTimeWeight: 0.15,
      reliabilityWeight: 0.15,
      performanceWeight: 0.10,
      securityWeight: 0.05,
      decayRate: 0.01,
      bonusThresholds: {
        excellent: 90,
        good: 75,
        average: 60
      },
      ...config
    };

    this.metrics = this.loadMetrics();
  }

  private loadMetrics(): ReputationMetrics {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        return {
          ...data,
          history: data.history.map((event: any) => ({
            ...event,
            timestamp: new Date(event.timestamp)
          })),
          badges: data.badges.map((badge: any) => ({
            ...badge,
            earnedAt: new Date(badge.earnedAt)
          }))
        };
      }
    } catch (error) {
      console.error('Failed to load reputation metrics:', error);
    }

    return this.createDefaultMetrics();
  }

  private createDefaultMetrics(): ReputationMetrics {
    return {
      overallScore: 50,
      networkUptime: 0,
      taskSuccessRate: 0,
      averageCompletionTime: 0,
      reliabilityScore: 50,
      performanceScore: 50,
      securityScore: 100,
      level: 'bronze',
      badges: [],
      history: []
    };
  }

  private saveMetrics(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.metrics));
    } catch (error) {
      console.error('Failed to save reputation metrics:', error);
    }
  }

  recordTaskCompletion(success: boolean, completionTime: number, expectedTime: number): void {
    const timePerformance = Math.max(0, Math.min(100, (expectedTime / completionTime) * 100));
    const impact = success ? 10 + (timePerformance > 100 ? 5 : 0) : -15;

    const event: ReputationEvent = {
      id: this.generateEventId(),
      type: success ? 'task_completed' : 'task_failed',
      timestamp: new Date(),
      impact,
      description: success 
        ? `Task completed successfully in ${completionTime}min` 
        : `Task failed after ${completionTime}min`,
      metadata: {
        completionTime,
        expectedTime,
        timePerformance
      }
    };

    this.addEvent(event);
    this.updateTaskMetrics(success, timePerformance);
    this.checkForBadges();
  }

  recordNetworkUptime(uptimePercentage: number): void {
    const previousUptime = this.metrics.networkUptime;
    this.metrics.networkUptime = uptimePercentage;

    if (uptimePercentage > 99) {
      const event: ReputationEvent = {
        id: this.generateEventId(),
        type: 'milestone_reached',
        timestamp: new Date(),
        impact: 5,
        description: `Excellent network uptime: ${uptimePercentage.toFixed(2)}%`,
        metadata: { uptimePercentage }
      };
      this.addEvent(event);
    }

    this.calculateOverallScore();
  }

  recordSecurityIncident(severity: 'low' | 'medium' | 'high'): void {
    const impact = severity === 'low' ? -5 : severity === 'medium' ? -15 : -30;
    
    const event: ReputationEvent = {
      id: this.generateEventId(),
      type: 'security_incident',
      timestamp: new Date(),
      impact,
      description: `Security incident: ${severity} severity`,
      metadata: { severity }
    };

    this.addEvent(event);
    this.metrics.securityScore = Math.max(0, this.metrics.securityScore + impact);
    this.calculateOverallScore();
  }

  private updateTaskMetrics(success: boolean, timePerformance: number): void {
    // Update success rate
    const recentTasks = this.metrics.history
      .filter(e => e.type === 'task_completed' || e.type === 'task_failed')
      .slice(-20); // Last 20 tasks
    
    const successfulTasks = recentTasks.filter(e => e.type === 'task_completed').length;
    this.metrics.taskSuccessRate = recentTasks.length > 0 ? (successfulTasks / recentTasks.length) * 100 : 0;

    // Update performance score
    this.metrics.performanceScore = Math.max(0, Math.min(100, 
      this.metrics.performanceScore * 0.9 + timePerformance * 0.1
    ));

    // Update reliability score
    if (success) {
      this.metrics.reliabilityScore = Math.min(100, this.metrics.reliabilityScore + 2);
    } else {
      this.metrics.reliabilityScore = Math.max(0, this.metrics.reliabilityScore - 5);
    }

    // Update average completion time
    const completionTimes = this.metrics.history
      .filter(e => e.type === 'task_completed' && e.metadata?.completionTime)
      .map(e => e.metadata.completionTime);
    
    if (completionTimes.length > 0) {
      this.metrics.averageCompletionTime = completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length;
    }

    this.calculateOverallScore();
  }

  private calculateOverallScore(): void {
    const weightedScore = 
      (this.metrics.networkUptime * this.config.networkUptimeWeight) +
      (this.metrics.taskSuccessRate * this.config.taskSuccessWeight) +
      ((100 - Math.min(100, this.metrics.averageCompletionTime / 10)) * this.config.completionTimeWeight) +
      (this.metrics.reliabilityScore * this.config.reliabilityWeight) +
      (this.metrics.performanceScore * this.config.performanceWeight) +
      (this.metrics.securityScore * this.config.securityWeight);

    // Apply decay
    const decayFactor = Math.pow(1 - this.config.decayRate, this.metrics.history.length / 100);
    this.metrics.overallScore = Math.max(0, Math.min(100, weightedScore * decayFactor));

    this.updateLevel();
  }

  private updateLevel(): void {
    const score = this.metrics.overallScore;
    
    if (score >= 95) {
      this.metrics.level = 'diamond';
    } else if (score >= 85) {
      this.metrics.level = 'platinum';
    } else if (score >= 70) {
      this.metrics.level = 'gold';
    } else if (score >= 55) {
      this.metrics.level = 'silver';
    } else {
      this.metrics.level = 'bronze';
    }
  }

  private checkForBadges(): void {
    const newBadges: Badge[] = [];

    // First task completion
    const completedTasks = this.metrics.history.filter(e => e.type === 'task_completed').length;
    if (completedTasks === 1) {
      newBadges.push({
        id: 'first_task',
        name: 'First Steps',
        description: 'Complete your first task',
        icon: '🎯',
        earnedAt: new Date(),
        rarity: 'common'
      });
    }

    // Task milestones
    if (completedTasks === 10) {
      newBadges.push({
        id: 'ten_tasks',
        name: 'Dedicated Worker',
        description: 'Complete 10 tasks',
        icon: '⭐',
        earnedAt: new Date(),
        rarity: 'common'
      });
    }

    if (completedTasks === 50) {
      newBadges.push({
        id: 'fifty_tasks',
        name: 'Task Master',
        description: 'Complete 50 tasks',
        icon: '🏆',
        earnedAt: new Date(),
        rarity: 'rare'
      });
    }

    // Perfect success rate
    const recentTasks = this.metrics.history
      .filter(e => e.type === 'task_completed' || e.type === 'task_failed')
      .slice(-20);
    
    if (recentTasks.length >= 10 && recentTasks.every(e => e.type === 'task_completed')) {
      const perfectStreak = this.metrics.badges.find(b => b.id === 'perfect_streak');
      if (!perfectStreak) {
        newBadges.push({
          id: 'perfect_streak',
          name: 'Perfect Streak',
          description: 'Complete 10 tasks in a row without failure',
          icon: '💎',
          earnedAt: new Date(),
          rarity: 'epic'
        });
      }
    }

    // Network excellence
    if (this.metrics.networkUptime >= 99.5) {
      const networkExcellence = this.metrics.badges.find(b => b.id === 'network_excellence');
      if (!networkExcellence) {
        newBadges.push({
          id: 'network_excellence',
          name: 'Network Guardian',
          description: 'Maintain 99.5%+ network uptime',
          icon: '🛡️',
          earnedAt: new Date(),
          rarity: 'rare'
        });
      }
    }

    // Add new badges
    newBadges.forEach(badge => {
      if (!this.metrics.badges.find(b => b.id === badge.id)) {
        this.metrics.badges.push(badge);
      }
    });
  }

  private addEvent(event: ReputationEvent): void {
    this.metrics.history.unshift(event);
    
    // Keep only last 100 events
    if (this.metrics.history.length > 100) {
      this.metrics.history = this.metrics.history.slice(0, 100);
    }

    this.saveMetrics();
  }

  private generateEventId(): string {
    return 'event-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
  }

  getMetrics(): ReputationMetrics {
    return { ...this.metrics };
  }

  getCreditMultiplier(): number {
    const levelMultipliers = {
      bronze: 1.0,
      silver: 1.1,
      gold: 1.25,
      platinum: 1.5,
      diamond: 2.0
    };

    return levelMultipliers[this.metrics.level];
  }

  getTaskPriority(): number {
    // Higher reputation gets access to higher priority tasks
    return Math.floor(this.metrics.overallScore / 10);
  }

  getReputationHistory(limit?: number): ReputationEvent[] {
    return limit ? this.metrics.history.slice(0, limit) : [...this.metrics.history];
  }

  exportData(): string {
    return JSON.stringify({
      metrics: this.metrics,
      config: this.config,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  importData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.metrics) {
        this.metrics = {
          ...parsed.metrics,
          history: parsed.metrics.history.map((event: any) => ({
            ...event,
            timestamp: new Date(event.timestamp)
          })),
          badges: parsed.metrics.badges.map((badge: any) => ({
            ...badge,
            earnedAt: new Date(badge.earnedAt)
          }))
        };
        this.saveMetrics();
        return true;
      }
    } catch (error) {
      console.error('Failed to import reputation data:', error);
    }
    return false;
  }

  reset(): void {
    this.metrics = this.createDefaultMetrics();
    this.saveMetrics();
  }
}
