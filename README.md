# CloudCraft Lab - Decentralized Computing Marketplace

Transform your idle computing power into valuable credits in a secure, containerized P2P marketplace.

## 🚀 Features

### Host Dashboard - "The Earning Command Center"
- **Real-Time Status Monitor**: Live heartbeat indicator showing Ethernet/Wi-Fi status with automatic eligibility alerts
- **Resource Load Monitoring**: Visual gauges for CPU/GPU usage, temperature, and fan speed
- **Earnings & Credit Wallet**: Session earnings counter and complete transaction history
- **Availability Toggle**: Instant Online/Offline switch to reclaim PC performance

### Client API - "The Task Submission Portal"
- **POST /tasks/submit**: Submit container images, datasets, and performance requirements
- **GET /tasks/status**: Real-time progress tracking across distributed hosts
- **GET /tasks/results**: Secure retrieval of compiled results
- **Budget Control**: Set max credit spend to limit task costs

### Mock Network Environment
- **8 Simulated Hosts**: Different IP addresses and geographic locations
  - Seoul, South Korea (192.168.1.101) - 85 score, Ethernet
  - Tokyo, Japan (10.0.0.45) - 92 score, Ethernet  
  - Singapore (172.16.0.22) - 78 score, WiFi
  - Sydney, Australia (203.0.113.15) - 88 score, Ethernet
  - Mumbai, India (198.51.100.8) - 73 score, WiFi (Offline)
  - Hong Kong (192.0.2.55) - 95 score, Ethernet
  - Bangkok, Thailand (10.1.0.33) - 68 score, WiFi
  - Taipei, Taiwan (172.20.0.18) - 90 score, Ethernet

## 🏗️ Architecture

### Technical Infrastructure
1. **Network Stability Monitor**: Ethernet requirement with packet loss detection
2. **Hardware Benchmark Suite**: CPU/GPU/RAM performance scoring
3. **Docker Containerization**: Secure sandbox for task execution
4. **Encrypted Task Framework**: End-to-end workload encryption
5. **Credit Transfer System**: Digital wallet with P2P transfers
6. **Reputation System**: 5-tier levels with multipliers and badges

### Economic Model
- **B1 - Credit Transfer**: Earn credits by hosting, spend on computing
- **B2 - P2P Marketplace**: 5-10% platform fee for facilitation
- **Reputation Multipliers**: Higher tiers earn 1.0x - 2.0x credit bonuses

## 🎯 Getting Started

### For Hosts (Resource Providers)
1. **Network Check**: Verify Ethernet connection stability
2. **Hardware Test**: Benchmark system capabilities  
3. **Go Online**: Toggle availability to start earning
4. **Monitor**: Track earnings and system health in real-time

### For Clients (Task Requesters)
1. **Submit Task**: Configure container image and requirements
2. **Set Budget**: Define maximum credit spend
3. **Monitor Progress**: Track execution across distributed hosts
4. **Retrieve Results**: Download compiled outputs securely

## 🛠️ Development

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management**: React hooks + local storage
- **Icons**: Lucide React
- **Build Tool**: Vite with HMR

### Project Structure
```
src/
├── components/          # React components
│   ├── HostDashboard.tsx    # Host monitoring interface
│   ├── ClientAPI.tsx        # Client task submission
│   ├── NetworkMonitor.tsx   # Network stability checker
│   ├── HardwareBenchmark.tsx # System performance testing
│   ├── TaskMarketplace.tsx  # Task browsing/execution
│   ├── CreditWallet.tsx     # Credit management
│   └── ReputationSystem.tsx # Reputation tracking
├── lib/                # Core business logic
│   ├── host-dashboard.ts     # Host monitoring logic
│   ├── client-api.ts        # Client API simulation
│   ├── network-monitor.ts    # Network stability monitoring
│   ├── hardware-benchmark.ts # Hardware testing
│   ├── task-execution.ts    # Task execution engine
│   ├── credit-system.ts      # Credit management
│   └── reputation-system.ts # Reputation scoring
└── pages/               # Application pages
    └── Index.tsx          # Main dashboard
```

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Application**:
   Navigate to `http://localhost:8080`

## 📊 Mock Data & Simulation

### Network Simulation
- **Dynamic Host Status**: Random online/offline changes
- **Network Type Switching**: Ethernet ↔ WiFi transitions
- **Geographic Distribution**: Global host locations
- **Performance Variations**: Different hardware capabilities

### Task Execution
- **Progress Simulation**: Realistic task completion times
- **Resource Usage**: CPU/GPU load during execution
- **Failure Scenarios**: Random host failures
- **Credit Escrow**: Secure payment handling

## 🔧 Configuration

### Host Requirements
- **Network**: Ethernet connection preferred
- **Hardware**: Minimum performance score of 50
- **Storage**: Sufficient disk space for containers
- **Temperature**: CPU < 85°C, GPU < 80°C

### Client Configuration
- **Container Images**: Docker Hub URLs
- **Datasets**: Publicly accessible links
- **Performance Requirements**: Minimum scores for hosts
- **Budget Controls**: Credit spend limits

## 🎮 Interactive Features

### Host Dashboard
- **Real-time Monitoring**: Live resource usage gauges
- **Network Alerts**: Automatic notifications for status changes
- **Session Tracking**: Current task progress and earnings
- **Simulation Controls**: Test different network conditions

### Client API
- **Task Submission**: Form-based task creation
- **Progress Tracking**: Multi-host progress visualization
- **Results Download**: JSON formatted output data
- **Host Management**: View and control available hosts

### Reputation System
- **5 Tiers**: Bronze → Silver → Gold → Platinum → Diamond
- **Credit Multipliers**: 1.0x to 2.0x based on tier
- **Badge System**: Earn achievements for milestones
- **Performance Metrics**: Success rate, uptime, reliability

## 🔒 Security Features

- **Container Isolation**: Docker sandbox for all tasks
- **Encrypted Workloads**: End-to-end data protection
- **Credit Escrow**: Secure payment holding
- **Host Verification**: Performance and reputation checks

## 📈 Future Enhancements

- **Real Docker Integration**: Actual container execution
- **Blockchain Integration**: Decentralized credit system
- **Mobile App**: Host monitoring on mobile devices
- **Advanced Analytics**: Detailed performance insights
- **API Documentation**: Comprehensive developer docs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for the decentralized computing revolution**
