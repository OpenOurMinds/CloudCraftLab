import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditSystem, CreditWallet, Transaction } from '@/lib/credit-system';
import { Wallet, ArrowUpRight, ArrowDownLeft, ArrowRight, History, TrendingUp, DollarSign } from 'lucide-react';

interface CreditWalletProps {
  onTransaction?: (transaction: Transaction) => void;
}

export const CreditWalletComponent: React.FC<CreditWalletProps> = ({ onTransaction }) => {
  const [creditSystem] = useState(() => new CreditSystem());
  const [wallet, setWallet] = useState<CreditWallet>(creditSystem.getWallet());
  const [transferAmount, setTransferAmount] = useState('');
  const [transferAddress, setTransferAddress] = useState('');
  const [cashOutAmount, setCashOutAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'bank' | 'crypto'>('paypal');

  useEffect(() => {
    const interval = setInterval(() => {
      setWallet(creditSystem.getWallet());
    }, 1000);

    return () => clearInterval(interval);
  }, [creditSystem]);

  const handleTransfer = () => {
    if (!transferAmount || !transferAddress) return;
    
    try {
      const transaction = creditSystem.transferCredits(
        parseFloat(transferAmount),
        transferAddress,
        'Peer transfer'
      );
      onTransaction?.(transaction);
      setTransferAmount('');
      setTransferAddress('');
    } catch (error) {
      console.error('Transfer failed:', error);
    }
  };

  const handleCashOut = () => {
    if (!cashOutAmount) return;
    
    try {
      const transaction = creditSystem.cashOutCredits(
        parseFloat(cashOutAmount),
        paymentMethod
      );
      onTransaction?.(transaction);
      setCashOutAmount('');
    } catch (error) {
      console.error('Cash out failed:', error);
    }
  };

  const simulateEarnings = () => {
    const transaction = creditSystem.earnCredits(
      Math.floor(Math.random() * 50) + 10,
      'Completed AI training task',
      'TASK-' + Math.random().toString(36).substr(2, 9)
    );
    onTransaction?.(transaction);
  };

  const simulateSpending = () => {
    const amount = Math.floor(Math.random() * 30) + 5;
    if (wallet.balance >= amount) {
      const transaction = creditSystem.spendCredits(
        amount,
        'Purchased compute time',
        'TASK-' + Math.random().toString(36).substr(2, 9)
      );
      onTransaction?.(transaction);
    }
  };

  const formatCredits = (amount: number) => {
    return amount.toLocaleString();
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'earned':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'spent':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'transferred':
        return <ArrowRight className="h-4 w-4 text-blue-500" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'earned':
        return 'text-green-600';
      case 'spent':
        return 'text-red-600';
      case 'transferred':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const stats = creditSystem.getEarningsStats();

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Credit Wallet
        </CardTitle>
        <CardDescription>
          Manage your compute credits and track earnings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Overview */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{formatCredits(wallet.balance)}</div>
              <div className="text-sm text-muted-foreground">Current Balance</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{formatCredits(stats.totalEarned)}</div>
              <div className="text-sm text-muted-foreground">Total Earned</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <ArrowUpRight className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{formatCredits(stats.totalSpent)}</div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Wallet className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{formatCredits(stats.netEarnings)}</div>
              <div className="text-sm text-muted-foreground">Net Earnings</div>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Address */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Wallet Address</div>
              <div className="font-mono text-sm">{wallet.address}</div>
            </div>
            <Badge variant="outline">Active</Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={simulateEarnings} variant="outline">
            Simulate Earnings
          </Button>
          <Button onClick={simulateSpending} variant="outline">
            Simulate Spending
          </Button>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
            <TabsTrigger value="cashout">Cash Out</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-lg font-medium flex items-center gap-2">
                <History className="h-4 w-4" />
                Recent Transactions
              </h4>
              {wallet.transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions yet
                </div>
              ) : (
                <div className="space-y-2">
                  {wallet.transactions.slice(0, 10).map((transaction) => (
                    <Card key={transaction.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <div className="font-medium">{transaction.description}</div>
                              <div className="text-sm text-muted-foreground">
                                {transaction.timestamp.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-medium ${getTransactionColor(transaction.type)}`}>
                              {transaction.amount > 0 ? '+' : ''}{formatCredits(transaction.amount)}
                            </div>
                            <Badge 
                              variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="transfer" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-amount">Amount</Label>
                <Input
                  id="transfer-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transfer-address">Recipient Address</Label>
                <Input
                  id="transfer-address"
                  placeholder="Enter wallet address"
                  value={transferAddress}
                  onChange={(e) => setTransferAddress(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleTransfer}
                disabled={!transferAmount || !transferAddress}
                className="w-full"
              >
                Transfer Credits
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="cashout" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cashout-amount">Amount</Label>
                <Input
                  id="cashout-amount"
                  type="number"
                  placeholder="Enter amount to cash out"
                  value={cashOutAmount}
                  onChange={(e) => setCashOutAmount(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">
                  Cash out fee: 5% ({cashOutAmount ? Math.floor(parseFloat(cashOutAmount) * 0.05) : 0} credits)
                </div>
                {cashOutAmount && (
                  <div className="text-sm font-medium">
                    Total: {formatCredits(Math.floor(parseFloat(cashOutAmount) * 1.05))} credits
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleCashOut}
                disabled={!cashOutAmount || parseFloat(cashOutAmount) > wallet.balance}
                className="w-full"
              >
                Cash Out Credits
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
