/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Eye, Settings, ChevronDown, Zap } from "lucide-react";
import { TokenSelectionModal } from "./token-selection-modal";
import { WalletModal } from "./wallet-modal";
import { ConnectingModal } from "./connecting-modal";
import { WalletSelectorDropdown } from "./wallet-selector-dropdown";
import { TokenPriceChart } from "./token-price-chart";
import { SlippageSettingsModal } from "./slippage-settings-modal";
import { useLiFi } from "@/hooks/use-lifi";
import { LimitOrderInterface } from "./limit-order-interface";
import { ComingSoonInterface } from "./coming-soon-interface";
import {
  ApeModeActivationModal,
  type ApeModeConfig,
} from "./apemode-activation-modal";
import { ApeModeSwapInterface } from "./apemode-swap-interface";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "./ui/dialog";
import { useToast } from "@/components/ui/use-toast"


interface Token {
  symbol: string;
  name: string;
  address: string;
  chainId: number;
  chainName: string;
  balance?: string;
  usdValue?: string;
  icon?: string;
  decimals?: number;
}

const DEFAULT_FROM_TOKEN: Token = {
  symbol: "ETH",
  name: "Ethereum",
  address: "0x0000000000000000000000000000000000000000",
  chainId: 1,
  chainName: "Ethereum",
  balance: "0.000027",
  usdValue: "$2.33",
};

const DEFAULT_TO_TOKEN: Token = {
  symbol: "USDC",
  name: "USD Coin",
  address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  chainId: 1,
  chainName: "Ethereum",
  balance: "0",
  usdValue: "$0.00",
  decimals: 6,
};

export function SimpleSwapInterface() {
  const { address, isConnected, balance, isConnecting, connectingWallet } =
    useWallet();
  const {
    getQuote,
    executeSwap,
    quote,
    isLoading: isLiFiLoading,
    error: lifiError,
    getSupportedChains,
    getSupportedTokens,
  } = useLiFi();

  const [activeTab, setActiveTab] = useState<"Spot" | "Limit" | "Perp">("Spot");
  const [fromToken, setFromToken] = useState<Token>(DEFAULT_FROM_TOKEN);
  const [toToken, setToToken] = useState<Token>(DEFAULT_TO_TOKEN);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isFromTokenModalOpen, setIsFromTokenModalOpen] = useState(false);
  const [isToTokenModalOpen, setIsToTokenModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [fromWalletAddress, setFromWalletAddress] = useState<
    string | undefined
  >(undefined);
  const [toWalletAddress, setToWalletAddress] = useState<string | undefined>(
    undefined
  );
  const [swapMode, setSwapMode] = useState<"swap" | "bridge">("swap");
  const [swapWalletType, setSwapWalletType] = useState<"from" | "to" | null>(
    null
  );

  // original modal flag
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  const { toast } = useToast()


  // new docked inline chart flag
  const [isChartDocked, setIsChartDocked] = useState(false);

  const [isSlippageModalOpen, setIsSlippageModalOpen] = useState(false);
  const [slippageTolerance, setSlippageTolerance] = useState(0.5);
  const [limitOrders, setLimitOrders] = useState<any[]>([]);
  const [isApeModeModalOpen, setIsApeModeModalOpen] = useState(false);
  const [apeModeConfig, setApeModeConfig] = useState<ApeModeConfig | null>(
    null
  );

  // For Paste Wallet modal
  const [isPasteWalletModalOpen, setIsPasteWalletModalOpen] = useState(false);
  const [walletPasteType, setWalletPasteType] = useState<"from" | "to" | null>(
    null
  );
  const [pastedWalletInput, setPastedWalletInput] = useState("");

  useEffect(() => {
    if (isConnected && address) {
      if (!fromWalletAddress) setFromWalletAddress(address);
      if (!toWalletAddress) setToWalletAddress(address);
    }
  }, [isConnected, address, fromWalletAddress, toWalletAddress]);

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleConnectWallet = () => {
    setIsWalletModalOpen(true);
  };

  const validateSwapAmount = (
    amount: string,
    token: Token
  ): { isValid: boolean; error?: string } => {
    const numAmount = Number.parseFloat(amount);

    if (!amount || numAmount <= 0) {
      return { isValid: false, error: "Please enter a valid amount" };
    }

    if (token.balance && numAmount > Number.parseFloat(token.balance)) {
      return {
        isValid: false,
        error: `Insufficient balance. Available: ${token.balance} ${token.symbol}`,
      };
    }

    const minimumAmounts: { [key: string]: number } = {
      ETH: 0.001,
      USDC: 5,
      USDT: 5,
      DAI: 5,
      BNB: 0.001,
      MATIC: 5,
    };

    const minAmount = minimumAmounts[token.symbol] || 1;
    if (numAmount < minAmount) {
      return {
        isValid: false,
        error: `Minimum amount: ${minAmount} ${token.symbol}`,
      };
    }

    return { isValid: true };
  };

  const handleSwap = async () => {
    if (!isConnected) {
      handleConnectWallet();
      return;
    }

    const validation = validateSwapAmount(fromAmount, fromToken);
    if (!validation.isValid) {
      toast({
  title: "Invalid Amount",
  description: validation.error,
  variant: "destructive",
  duration: 4000,
})

      return;
    }

    if (!fromWalletAddress || !toWalletAddress) {
      toast({
  title: "Wallet Connection Error",
  description: "Please ensure both wallets are connected before swapping.",
  variant: "destructive",
  duration: 4000,
})

      return;
    }

    try {
      console.log("[v0] Initiating swap with LiFi...");

      const fromTokenDecimals =
        fromToken.decimals || (fromToken.symbol === "USDC" ? 6 : 18);
      const fromAmountWei = (
        Number.parseFloat(fromAmount) * Math.pow(10, fromTokenDecimals)
      ).toString();

      const quoteRequest = {
        fromChain: fromToken.chainId,
        toChain: toToken.chainId,
        fromToken: fromToken.address,
        toToken: toToken.address,
        fromAmount: fromAmountWei,
        fromAddress: fromWalletAddress,
        toAddress: toWalletAddress,
        slippage: slippageTolerance,
        order: isBridge ? ("FASTEST" as const) : ("CHEAPEST" as const),
      };

      console.log("[v0] Quote request:", quoteRequest);
      const lifiQuote = await getQuote(quoteRequest);

      if (lifiQuote) {
        console.log("[v0] Quote received:", lifiQuote);

        const toTokenDecimals =
          toToken.decimals || (toToken.symbol === "USDC" ? 6 : 18);
        const toAmountFormatted = (
          Number.parseFloat(lifiQuote.estimate.toAmount) /
          Math.pow(10, toTokenDecimals)
        ).toFixed(6);
        setToAmount(toAmountFormatted);

        let signer = null;
        if (typeof window !== "undefined" && (window as any).ethereum) {
          const w = (window as any).ethereum;
          signer = {
            sendTransaction: async (txRequest: any) => {
              console.log("[v0] Sending transaction:", txRequest);

              try {
                const txHash = await w.request({
                  method: "eth_sendTransaction",
                  params: [
                    {
                      from: fromWalletAddress,
                      to: txRequest.to,
                      data: txRequest.data,
                      value: txRequest.value,
                      gas: txRequest.gasLimit,
                      ...(txRequest.gasPrice && {
                        gasPrice: txRequest.gasPrice,
                      }),
                    },
                  ],
                });

                return {
                  hash: txHash,
                  wait: async () => {
                    console.log(
                      "[v0] Transaction sent, waiting for confirmation..."
                    );
                    let receipt = null;
                    let attempts = 0;
                    const maxAttempts = 60;

                    while (!receipt && attempts < maxAttempts) {
                      try {
                        receipt = await w.request({
                          method: "eth_getTransactionReceipt",
                          params: [txHash],
                        });
                        if (!receipt) {
                          await new Promise((resolve) =>
                            setTimeout(resolve, 5000)
                          );
                          attempts++;
                        }
                      } catch (error) {
                        console.log(
                          "[v0] Waiting for transaction confirmation..."
                        );
                        await new Promise((resolve) =>
                          setTimeout(resolve, 5000)
                        );
                        attempts++;
                      }
                    }

                    return {
                      transactionHash: txHash,
                      status: (receipt as any)?.status || 1,
                    };
                  },
                };
              } catch (error) {
                console.error("[v0] Transaction failed:", error);
                throw error;
              }
            },
          };
        }

        const txHash = await executeSwap(lifiQuote, signer);
        if (txHash) {
          toast({
  title: `${isBridge ? "Bridge" : "Swap"} Successful`,
  description: `Transaction submitted successfully: ${txHash}`,
  variant: "default",
  duration: 5000,
})


          setFromAmount("");
          setToAmount("");
        }
      }
    } catch (error) {
      console.error("[v0] Swap error:", error);
      alert(`${isBridge ? "Bridge" : "Swap"} failed. Please try again.`);
    }
  };

  const handleConnectNewWallet = (type: "from" | "to") => {
    console.log(`[v0] Connect new wallet for ${type}`);
    setSwapWalletType(type);
    setIsWalletModalOpen(true);
  };

  const handlePasteWallet = (type: "from" | "to") => {
    setWalletPasteType(type);
    setPastedWalletInput("");
    setIsPasteWalletModalOpen(true);
  };

  const confirmPasteWallet = () => {
    if (!pastedWalletInput) return;
    if (
      !pastedWalletInput.startsWith("0x") ||
      pastedWalletInput.length !== 42
    ) {
      toast({
  title: "Invalid Address",
  description: "Please enter a valid 0x wallet address.",
  variant: "destructive",
  duration: 4000,
})

      return;
    }

    if (walletPasteType === "from") {
      setFromWalletAddress(pastedWalletInput);
    } else if (walletPasteType === "to") {
      setToWalletAddress(pastedWalletInput);
    }

    setIsPasteWalletModalOpen(false);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handlePercentageClick = (percentage: number) => {
    if (fromToken.balance) {
      const balanceNum = Number.parseFloat(fromToken.balance);
      let amount: number;

      if (percentage === 100) {
        if (fromToken.symbol === "ETH") {
          amount = Math.max(0, balanceNum - 0.002);
        } else {
          amount = balanceNum;
        }
      } else {
        amount = (balanceNum * percentage) / 100;
      }

      const validation = validateSwapAmount(amount.toString(), fromToken);
      if (validation.isValid) {
        setFromAmount(amount.toString());
      } else {
        const minimumAmounts: { [key: string]: number } = {
          ETH: 0.001,
          USDC: 5,
          USDT: 5,
          DAI: 5,
          BNB: 0.001,
          MATIC: 5,
        };
        const minAmount = minimumAmounts[fromToken.symbol] || 1;
        if (balanceNum >= minAmount) {
          setFromAmount(minAmount.toString());
        } else {
          toast({
  title: "Insufficient Balance",
  description: `Minimum swap amount required: ${minAmount} ${fromToken.symbol}`,
  variant: "destructive",
  duration: 4000,
})

        }
      }
    }
  };

  const handlePlaceLimitOrder = async (orderData: any) => {
    try {
      console.log("[v0] Placing limit order:", orderData);

      const newOrder = {
        ...orderData,
        id: Date.now().toString(),
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      setLimitOrders((prev) => [...prev, newOrder]);
      toast({
  title: "Limit Order Placed",
  description: `Order ID: ${newOrder.id}`,
  variant: "default",
  duration: 4000,
})


      setFromAmount("");
    } catch (error) {
      console.error("[v0] Limit order error:", error);
      toast({
  title: "Limit Order Failed",
  description: "Unable to place limit order. Please try again.",
  variant: "destructive",
  duration: 4000,
})

    }
  };

  const handleActivateApeMode = (config: ApeModeConfig) => {
    setApeModeConfig(config);
    console.log("[v0] ApeMode activated with config:", config);
  };

  const handleDeactivateApeMode = () => {
    setApeModeConfig(null);
    console.log("[v0] ApeMode deactivated");
  };

  const handleApeModeSwap = async (amount: string): Promise<void> => {
    if (!isConnected || !fromWalletAddress || !toWalletAddress) {
      throw new Error("Wallet not connected");
    }

    const validation = validateSwapAmount(amount, fromToken);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid amount");
    }

    try {
      const fromTokenDecimals =
        fromToken.decimals || (fromToken.symbol === "USDC" ? 6 : 18);
      const fromAmountWei = (
        Number.parseFloat(amount) * Math.pow(10, fromTokenDecimals)
      ).toString();

      const quoteRequest = {
        fromChain: fromToken.chainId,
        toChain: toToken.chainId,
        fromToken: fromToken.address,
        toToken: toToken.address,
        fromAmount: fromAmountWei,
        fromAddress: fromWalletAddress,
        toAddress: toWalletAddress,
        slippage: slippageTolerance,
        order: isBridge ? ("FASTEST" as const) : ("CHEAPEST" as const),
      };

      const lifiQuote = await getQuote(quoteRequest);
      if (!lifiQuote) {
        throw new Error("No quote available");
      }

      let signer = null;
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const w = (window as any).ethereum;
        signer = {
          sendTransaction: async (txRequest: any) => {
            const txHash = await w.request({
              method: "eth_sendTransaction",
              params: [
                {
                  from: fromWalletAddress,
                  to: txRequest.to,
                  data: txRequest.data,
                  value: txRequest.value,
                  gas: txRequest.gasLimit,
                  ...(txRequest.gasPrice && { gasPrice: txRequest.gasPrice }),
                },
              ],
            });

            return {
              hash: txHash,
              wait: async () => ({ transactionHash: txHash, status: 1 }),
            };
          },
        };
      }

      const txHash = await executeSwap(lifiQuote, signer);
      console.log("[v0] ApeMode swap executed:", txHash);
    } catch (error) {
      console.error("[v0] ApeMode swap error:", error);
      throw error;
    }
  };

  const isBridge = fromToken.chainId !== toToken.chainId;
  const buttonText = !isConnected ? "Connect" : isBridge ? "Swap" : "Swap";

  useEffect(() => {
    const fetchQuote = async () => {
      if (
        fromAmount &&
        Number.parseFloat(fromAmount) > 0 &&
        fromWalletAddress &&
        toWalletAddress
      ) {
        const validation = validateSwapAmount(fromAmount, fromToken);
        if (!validation.isValid) {
          console.log("[v0] Skipping quote fetch:", validation.error);
          setToAmount("");
          return;
        }

        try {
          console.log("[v0] Client: Requesting LiFi quote via server action");
          const fromTokenDecimals =
            fromToken.decimals || (fromToken.symbol === "USDC" ? 6 : 18);
          const fromAmountWei = (
            Number.parseFloat(fromAmount) * Math.pow(10, fromTokenDecimals)
          ).toString();

          const quoteRequest = {
            fromChain: fromToken.chainId,
            toChain: toToken.chainId,
            fromToken: fromToken.address,
            toToken: toToken.address,
            fromAmount: fromAmountWei,
            fromAddress: fromWalletAddress,
            toAddress: toWalletAddress,
            slippage: slippageTolerance,
            order: isBridge ? ("FASTEST" as const) : ("CHEAPEST" as const),
          };

          console.log("[v0] Quote request:", quoteRequest);
          const lifiQuote = await getQuote(quoteRequest);
          if (lifiQuote) {
            console.log("[v0] Quote received:", lifiQuote);

            const toTokenDecimals =
              toToken.decimals || (toToken.symbol === "USDC" ? 6 : 18);
            const toAmountFormatted = (
              Number.parseFloat(lifiQuote.estimate.toAmount) /
              Math.pow(10, toTokenDecimals)
            ).toFixed(6);
            setToAmount(toAmountFormatted);
          }
        } catch (error) {
          console.error("[v0] Quote fetch error:", error);
          if (error instanceof Error) {
            if (error.message.includes("None of the available routes")) {
              console.log(
                "[v0] No routes available - amount may be too small or no liquidity"
              );
            }
          }
        }
      } else {
        setToAmount("");
      }
    };

    const debounceTimer = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounceTimer);
  }, [
    fromAmount,
    fromToken,
    toToken,
    fromWalletAddress,
    toWalletAddress,
    getQuote,
    isBridge,
    slippageTolerance,
  ]);

  // --- layout blocks kept intact; we only wrap them when chart is docked ---
  const SwapCard = (
    <div className="max-w-md mx-auto pb-20">
      <div className="bg-yellow-400 h-8 w-11/12 mx-auto mb-0"></div>

      <div className="bg-[#191919] border border-[#FCD404]">
        <div className="flex items-center justify-between p-4 border-b border-[#121212] bg-[#121212]">
          <h1 className="text-white text-lg font-medium">
            {apeModeConfig?.isActive
              ? "ApeMode Trading"
              : activeTab === "Spot"
              ? "Swap Tokens"
              : activeTab === "Limit"
              ? "Limit Orders"
              : "Perpetual Trading"}
          </h1>
          <div className="flex items-center space-x-3">
            {/* toggle docked chart */}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => setIsChartDocked((v) => !v)}
            >
              <Eye className="h-4 w-4" />
              <span className="ml-1 text-sm">
                {isChartDocked ? "Close Chart" : "Chart View"}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => setIsSlippageModalOpen(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <>
          <div className="flex p-4 pb-0">
            {(["Spot", "Limit", "Perp"] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className={`mr-2 ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-[#F3DA5F] to-[#FCD404] font-semibold text-black hover:bg-yellow-500 rounded-none px-6"
                    : "text-white font-semibold hover:text-white hover:bg-[#2C2C2C] rounded-none px-6 border border-[#FCD404]"
                }`}
              >
                {tab}
              </Button>
            ))}
          </div>

          <div className="p-4 ">
            {activeTab === "Perp" ? (
              <ComingSoonInterface />
            ) : activeTab === "Limit" ? (
              <>
                <div className="space-y-2 -mb-4 bg-[#241E08]">
                  <div className="flex justify-between items-center p-4">
                    <span className="text-gray-400 text-sm">From</span>
                    <WalletSelectorDropdown
                      address={fromWalletAddress}
                      onConnectNewWallet={() => handleConnectNewWallet("from")}
                      onPasteWallet={() => handlePasteWallet("from")}
                    />
                  </div>

                  <div className=" p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Input
                        type="number"
                        placeholder="0"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        className="bg-transparent border-none text-3xl font-semibold text-white p-0 h-auto focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />

                      <Button
                        variant="ghost"
                        onClick={() => setIsFromTokenModalOpen(true)}
                        className="bg-[#191919] text-white px-3 py-1 h-14 rounded-none border border-[#242424]"
                      >
                        <div className="w-5 h-5 rounded-full mr-2 flex items-center justify-center">
                          <span className="flex items-center gap-1">
                            <img
                              src={
                                fromToken.chainName
                                  ?.toLowerCase()
                                  .includes("solana")
                                  ? `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/${fromToken.address}/logo.png`
                                  : fromToken.chainName
                                      ?.toLowerCase()
                                      .includes("cosmos")
                                  ? `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cosmos/assets/${fromToken.address}/logo.png`
                                  : fromToken.address ===
                                    "0x0000000000000000000000000000000000000000"
                                  ? "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png"
                                  : `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${(() => {
                                      switch (fromToken.chainId) {
                                        case 1:
                                          return "ethereum";
                                        case 56:
                                          return "smartchain";
                                        case 137:
                                          return "polygon";
                                        case 42161:
                                          return "arbitrum";
                                        case 10:
                                          return "optimism";
                                        case 43114:
                                          return "avalanchec";
                                        case 8453:
                                          return "base";
                                        case 324:
                                          return "zksync";
                                        case 59144:
                                          return "linea";
                                        case 99998:
                                          return "solana";
                                        case 99999:
                                          return "cosmos";
                                        default:
                                          return "ethereum";
                                      }
                                    })()}/assets/${fromToken.address}/logo.png`
                              }
                              alt={fromToken.symbol}
                              className="w-full h-full rounded-full"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </span>
                        </div>
                        {fromToken.symbol}
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">$0.00</span>
                      {isConnected && fromToken.balance && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-sm">
                            Balance: {fromToken.balance}
                          </span>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePercentageClick(25)}
                              className="text-xs text-gray-400 hover:text-white h-5 px-2"
                            >
                              25%
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePercentageClick(50)}
                              className="text-xs text-gray-400 hover:text-white h-5 px-2"
                            >
                              50%
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePercentageClick(100)}
                              className="text-xs text-gray-400 hover:text-white h-5 px-2"
                            >
                              MAX
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    {fromAmount &&
                      (() => {
                        const validation = validateSwapAmount(
                          fromAmount,
                          fromToken
                        );
                        return !validation.isValid ? (
                          <div className="text-red-400 text-xs mt-1">
                            {validation.error}
                          </div>
                        ) : null;
                      })()}
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSwapTokens}
                    className="bg-[#1F1F1F] border-4 border-[#FED402] text-white rounded-none p-2 h-10 w-10"
                  >
                    <ArrowUpDown className="h-6 w-6" />
                  </Button>
                </div>

                <div className="space-y-2 -mt-4 bg-[#241E08]">
                  <div className="flex justify-between items-center p-4">
                    <span className="text-gray-400 text-sm">To</span>
                    <WalletSelectorDropdown
                      address={toWalletAddress}
                      onConnectNewWallet={() => handleConnectNewWallet("to")}
                      onPasteWallet={() => handlePasteWallet("to")}
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-lg">
                        Will receive
                      </span>
                      <Button
                        variant="ghost"
                        onClick={() => setIsToTokenModalOpen(true)}
                        className="bg-[#191919] text-white px-3 py-1 h-14 rounded-none border border-[#242424]"
                      >
                        {toToken && toToken.symbol !== "Select Token" ? (
                          <>
                            <div className="w-5 h-5 rounded-full mr-2 flex items-center justify-center">
                              <span className="flex items-center">
                                <img
                                  src={
                                    toToken.symbol === "ETH"
                                      ? "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png"
                                      : toToken.symbol === "BNB"
                                      ? "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png"
                                      : toToken.symbol === "MATIC"
                                      ? "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/matic.png"
                                      : toToken.symbol === "USDC"
                                      ? "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdc.png"
                                      : "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/generic.png"
                                  }
                                  alt={toToken.symbol}
                                  className="w-full h-full rounded-full"
                                />
                              </span>
                            </div>
                            {toToken.symbol}
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </>
                        ) : (
                          <>
                            Select Token
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <LimitOrderInterface
                  fromToken={fromToken}
                  toToken={toToken}
                  fromAmount={fromAmount}
                  onFromAmountChange={setFromAmount}
                  onPlaceLimitOrder={handlePlaceLimitOrder}
                  isConnected={isConnected}
                />
              </>
            ) : (
              <>
                <div className="space-y-2 -mb-4 bg-[#241E08]">
                  <div className="flex justify-between items-center p-4">
                    <span className="text-gray-400 text-sm">From</span>
                    <WalletSelectorDropdown
                      address={fromWalletAddress}
                      onConnectNewWallet={() => handleConnectNewWallet("from")}
                      onPasteWallet={() => handlePasteWallet("from")}
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Input
                        type="number"
                        placeholder="0"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        className="bg-transparent border-none text-3xl font-semibold text-white p-0 h-auto focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />

                      <Button
                        variant="ghost"
                        onClick={() => setIsFromTokenModalOpen(true)}
                        className="bg-[#191919] text-white px-3 py-1 h-14 rounded-none border border-[#242424]"
                      >
                        <div className="w-5 h-5 rounded-full mr-2 flex items-center justify-center">
                          <span className="flex items-center gap-1">
                            <img
                              src={
                                fromToken.chainName
                                  ?.toLowerCase()
                                  .includes("solana")
                                  ? `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/${fromToken.address}/logo.png`
                                  : fromToken.chainName
                                      ?.toLowerCase()
                                      .includes("cosmos")
                                  ? `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cosmos/assets/${fromToken.address}/logo.png`
                                  : fromToken.address ===
                                    "0x0000000000000000000000000000000000000000"
                                  ? "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png"
                                  : `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${(() => {
                                      switch (fromToken.chainId) {
                                        case 1:
                                          return "ethereum";
                                        case 56:
                                          return "smartchain";
                                        case 137:
                                          return "polygon";
                                        case 42161:
                                          return "arbitrum";
                                        case 10:
                                          return "optimism";
                                        case 43114:
                                          return "avalanchec";
                                        case 8453:
                                          return "base";
                                        case 324:
                                          return "zksync";
                                        case 59144:
                                          return "linea";
                                        case 99998:
                                          return "solana";
                                        case 99999:
                                          return "cosmos";
                                        default:
                                          return "ethereum";
                                      }
                                    })()}/assets/${fromToken.address}/logo.png`
                              }
                              alt={fromToken.symbol}
                              className="w-full h-full rounded-full"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </span>
                        </div>
                        {fromToken.symbol}
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-">$0.00</span>
                      {isConnected && fromToken.balance && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">
                            Balance: {fromToken.balance}
                          </span>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePercentageClick(20)}
                              className="text-xs text-gray-400 hover:text-white h-5 px-2"
                            >
                              20%
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePercentageClick(50)}
                              className="text-xs text-gray-400 hover:text-white h-5 px-2"
                            >
                              50%
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePercentageClick(100)}
                              className="text-xs text-gray-400 hover:text-white h-5 px-2"
                            >
                              MAX
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    {fromAmount &&
                      (() => {
                        const validation = validateSwapAmount(
                          fromAmount,
                          fromToken
                        );
                        return !validation.isValid ? (
                          <div className="text-red-400 text-xs mt-1">
                            {validation.error}
                          </div>
                        ) : null;
                      })()}
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSwapTokens}
                    className="bg-[#1F1F1F] border-4 border-[#FED402] text-white rounded-none p-2 h-10 w-10"
                  >
                    <ArrowUpDown className="h-6 w-6" />
                  </Button>
                </div>

                <div className="space-y-2 bg-[#241E08] -mt-4">
                  <div className="flex justify-between items-center p-4">
                    <span className="text-gray-400 text-sm">To</span>
                    <WalletSelectorDropdown
                      address={toWalletAddress}
                      onConnectNewWallet={() => handleConnectNewWallet("to")}
                      onPasteWallet={() => handlePasteWallet("to")}
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Input
                        type="number"
                        placeholder="0"
                        value={toAmount}
                        onChange={(e) => setToAmount(e.target.value)}
                        className="bg-transparent border-none text-3xl font-medium text-white p-0 h-auto focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <Button
                        variant="ghost"
                        onClick={() => setIsToTokenModalOpen(true)}
                        className="bg-[#191919] text-white px-3 py-1 h-14 rounded-none border border-[#242424]"
                      >
                        {toToken && toToken.symbol !== "Select Token" ? (
                          <>
                            <div className="w-5 h-5 rounded-full mr-2 flex items-center justify-center">
                              <span className="flex items-center">
                                <img
                                  src={
                                    toToken.symbol === "ETH"
                                      ? "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png"
                                      : toToken.symbol === "BNB"
                                      ? "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png"
                                      : toToken.symbol === "MATIC"
                                      ? "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/matic.png"
                                      : toToken.symbol === "USDC"
                                      ? "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdc.png"
                                      : "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/generic.png"
                                  }
                                  alt={toToken.symbol}
                                  className="w-full h-full rounded-full"
                                />
                              </span>
                            </div>
                            {toToken.symbol}
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </>
                        ) : (
                          <>
                            Select Token
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">$0.00</span>
                      {isConnected && (
                        <div className="flex items-center space-x-2 text-xs ">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleConnectNewWallet("to")}
                            className="text-gray-400 hover:text-white h-5 px-2"
                          >
                            Connect new wallet
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePasteWallet("to")}
                            className="text-gray-400 hover:text-white h-5 px-2"
                          >
                            Paste new wallet
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Paste Wallet Modal */}
                  <Dialog
                    open={isPasteWalletModalOpen}
                    onOpenChange={setIsPasteWalletModalOpen}
                  >
                    {/* Paste Wallet Modal */}
                    {isPasteWalletModalOpen && (
                      <div className="fixed inset-0 z-[9990] flex items-center justify-center">
                        {/* Backdrop (only visible when modal is open) */}
                        <div
                          className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
                          onClick={() => setIsPasteWalletModalOpen(false)}
                        ></div>

                        {/* Modal content */}
                        <div
                          className="
        relative z-[9999]
        bg-[#121212] border border-[#FCD404] text-white
        rounded-none w-full max-w-md shadow-2xl
        p-6 animate-in fade-in-50 slide-in-from-bottom-2
      "
                        >
                          <DialogHeader>
                            <DialogTitle className="text-lg font-semibold text-yellow-400 text-center">
                              Paste Wallet Address
                            </DialogTitle>
                          </DialogHeader>

                          <div className="space-y-4 mt-4">
                            <p className="text-gray-400 text-sm text-center">
                              Enter the wallet address for the{" "}
                              <span className="text-yellow-400 font-semibold">
                                {walletPasteType}
                              </span>{" "}
                              wallet:
                            </p>

                            <Input
                              value={pastedWalletInput}
                              onChange={(e) =>
                                setPastedWalletInput(e.target.value)
                              }
                              placeholder="0x..."
                              className="bg-[#191919] border border-[#2A2A2A] text-white placeholder-gray-500 rounded-none w-full"
                            />

                            <div className="flex justify-end space-x-2 mt-6">
                              <Button
                                variant="ghost"
                                onClick={() => setIsPasteWalletModalOpen(false)}
                                className="text-gray-400 border border-gray-600 rounded-none px-6"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={confirmPasteWallet}
                                className="bg-gradient-to-r from-[#F3DA5F] to-[#FCD404] text-black font-semibold rounded-none px-6"
                              >
                                Confirm
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Dialog>
                </div>

                <Button
                  onClick={handleSwap}
                  disabled={isLiFiLoading}
                  className={`w-full h-12 font-semibold rounded-none my-4 text-lg ${
                    isConnected
                      ? "bg-gradient-to-r from-[#F3DA5F] to-[#FCD404] text-black"
                      : "bg-gradient-to-r from-[#F3DA5F] to-[#FCD404] text-black"
                  }`}
                >
                  {isLiFiLoading ? "Processing..." : buttonText}
                </Button>

                {!isConnected && (
                  <p className="text-center text-gray-400 text-sm leading-relaxed">
                    Trade crypto effortlessly across Ethereum and 12+ other
                    networks, all in one place.
                  </p>
                )}

                {isConnected && isBridge && (
                  <div className="text-center text-yellow-400 text-sm">
                    Cross-chain bridge detected
                  </div>
                )}

                {isConnected && (
                  <div className="text-center text-gray-400 text-xs">
                    Slippage tolerance: {slippageTolerance.toFixed(1)}%
                  </div>
                )}

                {lifiError && (
                  <div className="text-center text-red-400 text-sm">
                    {lifiError}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      </div>

      <div className="bg-yellow-400 h-8 w-11/12 mx-auto mb-0"></div>
    </div>
  );

  return (
    <>
      {/* Page wrapper:
          - default: centered
          - docked: side-by-side chart (left) + swap (right)
      */}
      <div className="min-h-screen bg-black pt-24 px-4">
        {!isChartDocked ? (
          /* normal layout */
          <div className="max-w-[1400px] mx-auto">{SwapCard}</div>
        ) : (
          /* docked layout */
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-6">
            {/* LEFT: docked chart */}
            <div className="md:w-[60%] w-full">
              <div className="bg-[#121212] border border-[#FCD404]">
                <div className="flex items-center justify-between p-3 border-b border-[#1f1f1f]">
                  <h2 className="text-white text-sm font-medium">Chart View</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                    onClick={() => setIsChartDocked(false)}
                  >
                    Close
                  </Button>
                </div>
                <div className="h-[520px] md:h-[700px]">
                  {/* IMPORTANT FIX: ensure chart renders in docked mode */}
                  <TokenPriceChart
                    isOpen={true}
                    onClose={() => setIsChartDocked(false)}
                    fromToken={fromToken}
                    toToken={toToken}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT: original swap card */}
            <div className="md:w-[40%] w-full">{SwapCard}</div>
          </div>
        )}
      </div>

      {/* ----- Modals kept as-is (restored) ----- */}

      <TokenSelectionModal
        isOpen={isFromTokenModalOpen}
        onClose={() => setIsFromTokenModalOpen(false)}
        onSelectToken={setFromToken}
        selectedToken={fromToken}
      />

      <TokenSelectionModal
        isOpen={isToTokenModalOpen}
        onClose={() => setIsToTokenModalOpen(false)}
        onSelectToken={setToToken}
        selectedToken={toToken}
      />

      <WalletModal
        open={isWalletModalOpen}
        onOpenChange={(open) => {
          setIsWalletModalOpen(open);
          if (!open) {
            setSwapWalletType(null);
          }
        }}
        swapWalletType={swapWalletType}
        onSwapWalletConnected={(address, type) => {
          console.log(`[v0] Swap wallet connected for ${type}:`, address);
          if (type === "from") {
            setFromWalletAddress(address);
          } else if (type === "to") {
            setToWalletAddress(address);
          }
          setSwapWalletType(null);
        }}
      />

      <ConnectingModal
        open={isConnecting}
        walletName={connectingWallet ?? undefined}
        onOpenChange={function (open: boolean): void {
          throw new Error("Function not implemented.");
        }}
      />

      <SlippageSettingsModal
        isOpen={isSlippageModalOpen}
        onClose={() => setIsSlippageModalOpen(false)}
        currentSlippage={slippageTolerance}
        onSlippageChange={setSlippageTolerance}
      />
    </>
  );
}
