import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardBody, Chip, Progress, Spinner } from "@nextui-org/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useArcium } from "../providers/SolanaProvider";
import { Icons } from "../components/shared/Icons";
import { 
  Shield, 
  ArrowLeftRight, 
  BarChart3, 
  Lock, 
  Zap,
  TrendingUp,
  Eye,
  EyeOff,
  Wallet,
  Activity
} from "lucide-react";

export default function ArciumDashboard() {
  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const { isInitialized, initializeArcium } = useArcium();
  const [showBalance, setShowBalance] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    privateBalance: "****",
    totalSwaps: 0,
    activeOrders: 0,
    savedFromMEV: "~$0",
  });

  useEffect(() => {
    if (connected && !isInitialized) {
      initializeArcium();
    }
  }, [connected, isInitialized, initializeArcium]);

  const features = [
    {
      title: "Private Payments",
      description: "Send encrypted payments where amounts stay hidden on-chain",
      icon: <Shield className="w-6 h-6" />,
      color: "from-violet-500 to-purple-600",
      path: "/arcium/payments",
      stats: "100% Private",
    },
    {
      title: "Private Swap",
      description: "Trade tokens with hidden amounts, protected from MEV bots",
      icon: <ArrowLeftRight className="w-6 h-6" />,
      color: "from-cyan-500 to-blue-600",
      path: "/arcium/swap",
      stats: "0% Slippage Risk",
    },
    {
      title: "Dark Pool",
      description: "Place hidden orders in the private order book",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "from-emerald-500 to-green-600",
      path: "/arcium/darkpool",
      stats: "MEV Protected",
    },
  ];

  const securityFeatures = [
    { icon: <Lock className="w-4 h-4" />, text: "MPC Encrypted" },
    { icon: <Zap className="w-4 h-4" />, text: "Solana Speed" },
    { icon: <Shield className="w-4 h-4" />, text: "MEV Protected" },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              variant="flat"
              className="bg-white/5 text-white"
              onClick={() => navigate("/")}
            >
              <Icons.back className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  Arcium
                </span>
                <Chip size="sm" color="secondary" variant="flat">
                  Private DeFi
                </Chip>
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Encrypted computation on Solana
              </p>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center gap-3">
            {connected && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-sm font-medium">
                  {isInitialized ? "MPC Connected" : "Connecting..."}
                </span>
              </div>
            )}
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-cyan-600 !rounded-xl !h-10" />
          </div>
        </div>

        {/* Security Badge */}
        <Card className="bg-white/5 border border-white/10 mb-6">
          <CardBody className="flex flex-row items-center justify-between py-3 px-4">
            <div className="flex items-center gap-4">
              <Shield className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">
                Powered by Arcium Multi-Party Computation
              </span>
            </div>
            <div className="flex items-center gap-4">
              {securityFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-400">
                  {feature.icon}
                  <span className="text-sm">{feature.text}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {!connected ? (
          /* Not Connected State */
          <Card className="bg-white/5 border border-white/10">
            <CardBody className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
                <Wallet className="w-10 h-10 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Connect Your Solana Wallet
              </h2>
              <p className="text-slate-400 text-center max-w-md mb-6">
                Connect your wallet to access private payments, swaps, and dark pool trading
                powered by Arcium's encrypted computation network.
              </p>
              <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-cyan-600 !rounded-xl !px-8 !py-3" />
            </CardBody>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-white/5 border border-white/10">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Private Balance</span>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onClick={() => setShowBalance(!showBalance)}
                    >
                      {showBalance ? (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {showBalance ? stats.privateBalance : "••••••"}
                  </p>
                  <p className="text-xs text-emerald-400 mt-1">Encrypted on-chain</p>
                </CardBody>
              </Card>

              <Card className="bg-white/5 border border-white/10">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Private Swaps</span>
                    <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalSwaps}</p>
                  <p className="text-xs text-slate-400 mt-1">Total executed</p>
                </CardBody>
              </Card>

              <Card className="bg-white/5 border border-white/10">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Active Orders</span>
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.activeOrders}</p>
                  <p className="text-xs text-slate-400 mt-1">In dark pool</p>
                </CardBody>
              </Card>

              <Card className="bg-white/5 border border-white/10">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">MEV Savings</span>
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.savedFromMEV}</p>
                  <p className="text-xs text-emerald-400 mt-1">Protected value</p>
                </CardBody>
              </Card>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  isPressable
                  className="bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 group overflow-hidden"
                  onClick={() => navigate(feature.path)}
                >
                  <CardBody className="p-6 relative">
                    {/* Gradient Overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                    />

                    <div className="relative z-10">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4`}
                      >
                        {feature.icon}
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-slate-400 text-sm mb-4">
                        {feature.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <Chip
                          size="sm"
                          variant="flat"
                          className="bg-white/10 text-white"
                        >
                          {feature.stats}
                        </Chip>
                        <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                          Enter →
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* How It Works */}
            <Card className="bg-white/5 border border-white/10 mt-8">
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-white mb-6">
                  How Arcium Privacy Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    {
                      step: "1",
                      title: "Encrypt",
                      desc: "Your data is encrypted client-side using x25519 key exchange",
                    },
                    {
                      step: "2",
                      title: "Submit",
                      desc: "Encrypted data is sent to Solana and queued for MPC processing",
                    },
                    {
                      step: "3",
                      title: "Compute",
                      desc: "Arcium nodes compute on encrypted data without decryption",
                    },
                    {
                      step: "4",
                      title: "Result",
                      desc: "Only you can decrypt the result with your private key",
                    },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold mx-auto mb-3">
                        {item.step}
                      </div>
                      <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Network Status */}
            <Card className="bg-white/5 border border-white/10 mt-6">
              <CardBody className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-white">Arcium Testnet (Solana Devnet)</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>Cluster: Active</span>
                  <span>|</span>
                  <span>MPC Nodes: 3/3</span>
                  <span>|</span>
                  <span>Latency: ~2s</span>
                </div>
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

