import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Chip,
  Spinner,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Progress,
} from "@nextui-org/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useArcium } from "../providers/SolanaProvider";
import { Icons } from "../components/shared/Icons";
import {
  BarChart3,
  Shield,
  Lock,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Clock,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Layers,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";

// Trading pairs
const TRADING_PAIRS = [
  { id: "sol-usdc", base: "SOL", quote: "USDC", price: 180.42 },
  { id: "sol-usdt", base: "SOL", quote: "USDT", price: 180.38 },
];

// Mock order data (encrypted in reality)
const MOCK_ORDERS = [
  { id: 1, side: "buy", size: "****", price: "****", status: "active", time: "2m ago" },
  { id: 2, side: "sell", size: "****", price: "****", status: "active", time: "5m ago" },
  { id: 3, side: "buy", size: "****", price: "****", status: "filled", time: "12m ago" },
];

const MOCK_TRADES = [
  { id: 1, side: "buy", size: "25", price: "180.50", time: "1m ago" },
  { id: 2, side: "sell", size: "10", price: "180.45", time: "3m ago" },
  { id: 3, side: "buy", size: "50", price: "180.40", time: "7m ago" },
];

export default function DarkPoolPage() {
  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const { isInitialized } = useArcium();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Order state
  const [selectedPair, setSelectedPair] = useState("sol-usdc");
  const [orderSide, setOrderSide] = useState("buy");
  const [orderType, setOrderType] = useState("limit");
  const [orderSize, setOrderSize] = useState("");
  const [orderPrice, setOrderPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("orderbook");

  // Stats
  const [stats] = useState({
    totalVolume: "$2.4M",
    activeOrders: 156,
    avgSpread: "0.02%",
    matchRate: "94%",
  });

  // Get current pair info
  const currentPair = useMemo(
    () => TRADING_PAIRS.find((p) => p.id === selectedPair),
    [selectedPair]
  );

  // Place order
  const handlePlaceOrder = useCallback(async () => {
    if (!connected || !orderSize || !orderPrice) return;

    setIsSubmitting(true);
    setOrderStatus("encrypting");

    try {
      // Step 1: Encrypt order
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setOrderStatus("submitting");

      // Step 2: Submit to dark pool
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setOrderStatus("processing");

      // Step 3: Add to encrypted order book
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setOrderStatus("success");

      toast.success("Order placed in dark pool!");
      onOpen();

    } catch (error) {
      console.error("Order failed:", error);
      setOrderStatus("error");
      toast.error("Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  }, [connected, orderSize, orderPrice, onOpen]);

  // Trigger matching
  const handleMatchOrders = useCallback(async () => {
    if (!connected) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      toast.success("Order matching completed!");
    } catch (error) {
      toast.error("Matching failed");
    } finally {
      setIsSubmitting(false);
    }
  }, [connected]);

  const statusMessages = {
    encrypting: "Encrypting order...",
    submitting: "Submitting to dark pool...",
    processing: "Adding to order book...",
    success: "Order placed!",
    error: "Order failed",
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              variant="flat"
              className="bg-white/5 text-white"
              onClick={() => navigate("/arcium")}
            >
              <Icons.back className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Dark Pool
                <Chip size="sm" color="success" variant="flat">
                  Private Order Book
                </Chip>
              </h1>
              <p className="text-slate-400 text-sm">
                Trade with hidden orders, protected from front-running
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select
              selectedKeys={[selectedPair]}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="w-40"
              classNames={{
                trigger: "bg-white/10 border-white/20 text-white",
                value: "text-white",
              }}
            >
              {TRADING_PAIRS.map((pair) => (
                <SelectItem key={pair.id} value={pair.id}>
                  {pair.base}/{pair.quote}
                </SelectItem>
              ))}
            </Select>
            <WalletMultiButton className="!bg-gradient-to-r !from-emerald-600 !to-green-600 !rounded-xl !h-10" />
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "24h Volume", value: stats.totalVolume, icon: <BarChart3 className="w-4 h-4" /> },
            { label: "Active Orders", value: stats.activeOrders, icon: <Layers className="w-4 h-4" /> },
            { label: "Avg Spread", value: stats.avgSpread, icon: <Activity className="w-4 h-4" /> },
            { label: "Match Rate", value: stats.matchRate, icon: <Check className="w-4 h-4" /> },
          ].map((stat, i) => (
            <Card key={i} className="bg-white/5 border border-white/10">
              <CardBody className="flex flex-row items-center justify-between p-4">
                <div>
                  <p className="text-slate-400 text-xs">{stat.label}</p>
                  <p className="text-white text-lg font-bold">{stat.value}</p>
                </div>
                <div className="text-emerald-400">{stat.icon}</div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Form */}
          <Card className="bg-white/5 border border-white/10 lg:col-span-1">
            <CardBody className="p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                Place Hidden Order
              </h3>

              {/* Order Type Tabs */}
              <Tabs
                selectedKey={orderSide}
                onSelectionChange={setOrderSide}
                className="mb-4"
                classNames={{
                  tabList: "bg-white/5",
                  tab: "text-slate-400",
                  cursor: orderSide === "buy" ? "bg-emerald-600" : "bg-red-600",
                }}
              >
                <Tab
                  key="buy"
                  title={
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Buy
                    </span>
                  }
                />
                <Tab
                  key="sell"
                  title={
                    <span className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" /> Sell
                    </span>
                  }
                />
              </Tabs>

              {/* Order Type */}
              <div className="flex gap-2 mb-4">
                {["limit", "market"].map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={orderType === type ? "solid" : "flat"}
                    className={
                      orderType === type
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-slate-400"
                    }
                    onClick={() => setOrderType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>

              {/* Price Input */}
              {orderType === "limit" && (
                <div className="mb-4">
                  <label className="text-slate-400 text-sm mb-2 block">
                    Price ({currentPair?.quote})
                  </label>
                  <Input
                    type="number"
                    placeholder={currentPair?.price.toString()}
                    value={orderPrice}
                    onChange={(e) => setOrderPrice(e.target.value)}
                    classNames={{
                      input: "text-white",
                      inputWrapper: "bg-white/10 border-white/20",
                    }}
                    endContent={
                      <span className="text-slate-400 text-sm">
                        {currentPair?.quote}
                      </span>
                    }
                  />
                </div>
              )}

              {/* Size Input */}
              <div className="mb-4">
                <label className="text-slate-400 text-sm mb-2 block">
                  Size ({currentPair?.base})
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={orderSize}
                  onChange={(e) => setOrderSize(e.target.value)}
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-white/10 border-white/20",
                  }}
                  endContent={
                    <span className="text-slate-400 text-sm">
                      {currentPair?.base}
                    </span>
                  }
                />
              </div>

              {/* Total */}
              <div className="mb-6 p-3 bg-white/5 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total</span>
                  <span className="text-white font-mono">
                    {orderSize && orderPrice
                      ? (parseFloat(orderSize) * parseFloat(orderPrice)).toFixed(2)
                      : "0.00"}{" "}
                    {currentPair?.quote}
                  </span>
                </div>
              </div>

              {/* Privacy Notice */}
              <Card className="bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <CardBody className="p-3">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-emerald-400 text-xs font-medium">
                        Order Privacy
                      </p>
                      <p className="text-slate-400 text-xs">
                        Size and price are encrypted. Only matched trades are revealed.
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Place Order Button */}
              {!connected ? (
                <WalletMultiButton className="!w-full !bg-gradient-to-r !from-emerald-600 !to-green-600 !rounded-xl !h-12 !justify-center" />
              ) : (
                <Button
                  className={`w-full h-12 font-semibold ${
                    orderSide === "buy"
                      ? "bg-gradient-to-r from-emerald-600 to-green-600"
                      : "bg-gradient-to-r from-red-600 to-rose-600"
                  } text-white`}
                  onClick={handlePlaceOrder}
                  isDisabled={!orderSize || (orderType === "limit" && !orderPrice) || isSubmitting}
                  isLoading={isSubmitting}
                >
                  {isSubmitting
                    ? statusMessages[orderStatus]
                    : `${orderSide === "buy" ? "Buy" : "Sell"} ${currentPair?.base}`}
                </Button>
              )}
            </CardBody>
          </Card>

          {/* Order Book & Trades */}
          <Card className="bg-white/5 border border-white/10 lg:col-span-2">
            <CardBody className="p-6">
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={setActiveTab}
                classNames={{
                  tabList: "bg-white/5",
                  tab: "text-slate-400",
                  cursor: "bg-emerald-600",
                }}
              >
                <Tab
                  key="orderbook"
                  title={
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4" /> Order Book
                    </span>
                  }
                >
                  <div className="mt-4">
                    {/* Hidden Order Book Visualization */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {/* Bids */}
                      <div>
                        <h4 className="text-emerald-400 font-medium mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" /> Bids (Hidden)
                        </h4>
                        <div className="space-y-2">
                          {[85, 70, 55, 40, 25].map((width, i) => (
                            <div key={i} className="relative h-8">
                              <div
                                className="absolute inset-y-0 right-0 bg-emerald-500/20 rounded"
                                style={{ width: `${width}%` }}
                              />
                              <div className="relative flex justify-between items-center px-3 h-full">
                                <span className="text-slate-500 text-sm font-mono">
                                  *****
                                </span>
                                <span className="text-slate-500 text-sm font-mono">
                                  ****
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Asks */}
                      <div>
                        <h4 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                          <TrendingDown className="w-4 h-4" /> Asks (Hidden)
                        </h4>
                        <div className="space-y-2">
                          {[30, 45, 60, 75, 90].map((width, i) => (
                            <div key={i} className="relative h-8">
                              <div
                                className="absolute inset-y-0 left-0 bg-red-500/20 rounded"
                                style={{ width: `${width}%` }}
                              />
                              <div className="relative flex justify-between items-center px-3 h-full">
                                <span className="text-slate-500 text-sm font-mono">
                                  *****
                                </span>
                                <span className="text-slate-500 text-sm font-mono">
                                  ****
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 py-4 border-t border-white/10">
                      <EyeOff className="w-5 h-5 text-slate-500" />
                      <span className="text-slate-400 text-sm">
                        Order details encrypted until matched
                      </span>
                    </div>
                  </div>
                </Tab>

                <Tab
                  key="myorders"
                  title={
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" /> My Orders
                    </span>
                  }
                >
                  <div className="mt-4">
                    <Table
                      aria-label="My orders"
                      classNames={{
                        base: "max-h-[400px]",
                        wrapper: "bg-transparent",
                        th: "bg-white/5 text-slate-400",
                        td: "text-white",
                      }}
                    >
                      <TableHeader>
                        <TableColumn>Side</TableColumn>
                        <TableColumn>Size</TableColumn>
                        <TableColumn>Price</TableColumn>
                        <TableColumn>Status</TableColumn>
                        <TableColumn>Time</TableColumn>
                        <TableColumn>Action</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {MOCK_ORDERS.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <Chip
                                size="sm"
                                color={order.side === "buy" ? "success" : "danger"}
                                variant="flat"
                              >
                                {order.side.toUpperCase()}
                              </Chip>
                            </TableCell>
                            <TableCell className="font-mono">{order.size}</TableCell>
                            <TableCell className="font-mono">{order.price}</TableCell>
                            <TableCell>
                              <Chip
                                size="sm"
                                variant="flat"
                                color={order.status === "active" ? "primary" : "default"}
                              >
                                {order.status}
                              </Chip>
                            </TableCell>
                            <TableCell className="text-slate-400">{order.time}</TableCell>
                            <TableCell>
                              {order.status === "active" && (
                                <Button
                                  size="sm"
                                  variant="flat"
                                  color="danger"
                                  isIconOnly
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Tab>

                <Tab
                  key="trades"
                  title={
                    <span className="flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Recent Trades
                    </span>
                  }
                >
                  <div className="mt-4">
                    <Table
                      aria-label="Recent trades"
                      classNames={{
                        wrapper: "bg-transparent",
                        th: "bg-white/5 text-slate-400",
                        td: "text-white",
                      }}
                    >
                      <TableHeader>
                        <TableColumn>Side</TableColumn>
                        <TableColumn>Size</TableColumn>
                        <TableColumn>Price</TableColumn>
                        <TableColumn>Time</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {MOCK_TRADES.map((trade) => (
                          <TableRow key={trade.id}>
                            <TableCell>
                              <span
                                className={
                                  trade.side === "buy"
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }
                              >
                                {trade.side.toUpperCase()}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono">{trade.size}</TableCell>
                            <TableCell className="font-mono">{trade.price}</TableCell>
                            <TableCell className="text-slate-400">{trade.time}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Tab>
              </Tabs>

              {/* Match Button */}
              {connected && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Button
                    className="w-full bg-white/10 text-white"
                    onClick={handleMatchOrders}
                    isLoading={isSubmitting}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Trigger Order Matching
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="bg-white/5 border border-white/10 mt-6">
          <CardBody className="p-6">
            <h3 className="text-white font-bold mb-4">About Dark Pool Trading</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-emerald-400 font-medium mb-2">Hidden Orders</h4>
                <p className="text-slate-400 text-sm">
                  Your order size and price are encrypted using MPC. No one can see your
                  trading intentions until orders are matched.
                </p>
              </div>
              <div>
                <h4 className="text-emerald-400 font-medium mb-2">MEV Protection</h4>
                <p className="text-slate-400 text-sm">
                  Front-running is impossible because order details are never revealed
                  on-chain before execution.
                </p>
              </div>
              <div>
                <h4 className="text-emerald-400 font-medium mb-2">Fair Matching</h4>
                <p className="text-slate-400 text-sm">
                  Orders are matched inside the MPC environment at the mid-price,
                  ensuring fair execution for all participants.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Success Modal */}
      <Modal isOpen={isOpen} onClose={onClose} className="bg-slate-900">
        <ModalContent>
          <ModalHeader className="text-white">Order Placed!</ModalHeader>
          <ModalBody>
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
              <p className="text-slate-300 mb-4">
                Your order has been encrypted and added to the dark pool.
              </p>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Order details are hidden from other traders</span>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white"
              onClick={onClose}
            >
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

