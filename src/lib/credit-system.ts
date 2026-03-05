export interface CreditWallet {
  address: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastTransaction: Date;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'earned' | 'spent' | 'transferred';
  amount: number;
  description: string;
  timestamp: Date;
  taskId?: string;
  fromAddress?: string;
  toAddress?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface CreditRate {
  perComputeHour: number;
  perGBData: number;
  reputationMultiplier: number;
  networkQualityMultiplier: number;
}

export class CreditSystem {
  private wallet: CreditWallet;
  private rates: CreditRate;
  private storageKey = 'cloudcraft-credits';

  constructor() {
    this.rates = {
      perComputeHour: 10,
      perGBData: 0.5,
      reputationMultiplier: 1.0,
      networkQualityMultiplier: 1.0
    };

    this.wallet = this.loadWallet();
  }

  private loadWallet(): CreditWallet {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        return {
          ...data,
          lastTransaction: new Date(data.lastTransaction),
          transactions: data.transactions.map((t: any) => ({
            ...t,
            timestamp: new Date(t.timestamp)
          }))
        };
      }
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }

    return this.createNewWallet();
  }

  private createNewWallet(): CreditWallet {
    return {
      address: this.generateAddress(),
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      lastTransaction: new Date(),
      transactions: []
    };
  }

  private generateAddress(): string {
    return 'CC-' + Math.random().toString(36).substr(2, 9).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
  }

  private saveWallet(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.wallet));
    } catch (error) {
      console.error('Failed to save wallet:', error);
    }
  }

  earnCredits(amount: number, description: string, taskId?: string): Transaction {
    const transaction: Transaction = {
      id: this.generateTransactionId(),
      type: 'earned',
      amount,
      description,
      timestamp: new Date(),
      taskId,
      status: 'completed'
    };

    this.wallet.transactions.unshift(transaction);
    this.wallet.balance += amount;
    this.wallet.totalEarned += amount;
    this.wallet.lastTransaction = transaction.timestamp;

    this.saveWallet();
    return transaction;
  }

  spendCredits(amount: number, description: string, taskId?: string): Transaction {
    if (this.wallet.balance < amount) {
      throw new Error('Insufficient credits');
    }

    const transaction: Transaction = {
      id: this.generateTransactionId(),
      type: 'spent',
      amount: -amount,
      description,
      timestamp: new Date(),
      taskId,
      status: 'completed'
    };

    this.wallet.transactions.unshift(transaction);
    this.wallet.balance -= amount;
    this.wallet.totalSpent += amount;
    this.wallet.lastTransaction = transaction.timestamp;

    this.saveWallet();
    return transaction;
  }

  transferCredits(amount: number, toAddress: string, description: string): Transaction {
    if (this.wallet.balance < amount) {
      throw new Error('Insufficient credits');
    }

    const transaction: Transaction = {
      id: this.generateTransactionId(),
      type: 'transferred',
      amount: -amount,
      description: `Transfer to ${toAddress}: ${description}`,
      timestamp: new Date(),
      toAddress,
      status: 'pending'
    };

    this.wallet.transactions.unshift(transaction);
    this.wallet.balance -= amount;
    this.wallet.totalSpent += amount;
    this.wallet.lastTransaction = transaction.timestamp;

    this.saveWallet();
    
    // Simulate network transfer
    setTimeout(() => {
      transaction.status = 'completed';
      this.saveWallet();
    }, 2000);

    return transaction;
  }

  calculateEarnings(computeHours: number, dataGB: number, reputationScore: number, networkMultiplier: number): number {
    const baseEarnings = (computeHours * this.rates.perComputeHour) + (dataGB * this.rates.perGBData);
    const reputationBonus = reputationScore * this.rates.reputationMultiplier;
    const networkBonus = networkMultiplier * this.rates.networkQualityMultiplier;
    
    return Math.round(baseEarnings * reputationBonus * networkBonus);
  }

  calculateCost(computeHours: number, dataGB: number): number {
    const baseCost = (computeHours * this.rates.perComputeHour) + (dataGB * this.rates.perGBData);
    
    // Add 10% platform fee
    return Math.round(baseCost * 1.1);
  }

  private generateTransactionId(): string {
    return 'TXN-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }

  getWallet(): CreditWallet {
    return { ...this.wallet };
  }

  getBalance(): number {
    return this.wallet.balance;
  }

  getTransactionHistory(limit?: number): Transaction[] {
    return limit ? this.wallet.transactions.slice(0, limit) : [...this.wallet.transactions];
  }

  getEarningsStats(): { totalEarned: number; totalSpent: number; netEarnings: number } {
    return {
      totalEarned: this.wallet.totalEarned,
      totalSpent: this.wallet.totalSpent,
      netEarnings: this.wallet.totalEarned - this.wallet.totalSpent
    };
  }

  cashOutCredits(amount: number, paymentMethod: 'paypal' | 'bank' | 'crypto'): Transaction {
    if (this.wallet.balance < amount) {
      throw new Error('Insufficient credits for cash out');
    }

    const fee = Math.round(amount * 0.05); // 5% cash out fee
    const totalAmount = amount + fee;

    if (this.wallet.balance < totalAmount) {
      throw new Error('Insufficient credits including cash out fee');
    }

    const transaction: Transaction = {
      id: this.generateTransactionId(),
      type: 'spent',
      amount: -totalAmount,
      description: `Cash out ${amount} credits via ${paymentMethod} (5% fee: ${fee} credits)`,
      timestamp: new Date(),
      status: 'pending'
    };

    this.wallet.transactions.unshift(transaction);
    this.wallet.balance -= totalAmount;
    this.wallet.totalSpent += totalAmount;
    this.wallet.lastTransaction = transaction.timestamp;

    this.saveWallet();

    // Simulate processing
    setTimeout(() => {
      transaction.status = 'completed';
      this.saveWallet();
    }, 5000);

    return transaction;
  }

  updateRates(newRates: Partial<CreditRate>): void {
    this.rates = { ...this.rates, ...newRates };
  }

  getRates(): CreditRate {
    return { ...this.rates };
  }
}
