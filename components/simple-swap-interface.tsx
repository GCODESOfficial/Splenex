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
import { useToast } from "@/components/ui/use-toast";

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
  const { address, isConnected, balance, isConnecting, connectingWallet, switchNetwork, chainId, refreshBalances } =
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

  const { toast } = useToast();

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
  
  // Swap processing state
  const [isSwapping, setIsSwapping] = useState(false);

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

  // Helper to get network configuration for adding to wallet
  const getNetworkConfig = (chainId: number) => {
    const networks: { [key: number]: any } = {
      56: {
        chainId: "0x38",
        chainName: "BNB Smart Chain",
        nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
        rpcUrls: ["https://bsc-dataseed.binance.org"],
        blockExplorerUrls: ["https://bscscan.com"],
      },
      8453: {
        chainId: "0x2105",
        chainName: "Base",
        nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://mainnet.base.org"],
        blockExplorerUrls: ["https://basescan.org"],
      },
      42161: {
        chainId: "0xa4b1",
        chainName: "Arbitrum One",
        nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://arb1.arbitrum.io/rpc"],
        blockExplorerUrls: ["https://arbiscan.io"],
      },
      137: {
        chainId: "0x89",
        chainName: "Polygon",
        nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
        rpcUrls: ["https://polygon-rpc.com"],
        blockExplorerUrls: ["https://polygonscan.com"],
      },
      10: {
        chainId: "0xa",
        chainName: "Optimism",
        nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://mainnet.optimism.io"],
        blockExplorerUrls: ["https://optimistic.etherscan.io"],
      },
    };
    return networks[chainId];
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
      USDT: 1,
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

    if (isSwapping) {
      console.log("[v0] Swap already in progress, ignoring request");
      return;
    }

    const validation = validateSwapAmount(fromAmount, fromToken);
    if (!validation.isValid) {
      toast({
        title: "Invalid Amount",
        description: validation.error,
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    if (!fromWalletAddress || !toWalletAddress) {
      toast({
        title: "Wallet Connection Error",
        description:
          "Please ensure both wallets are connected before swapping.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    setIsSwapping(true);
    
    try {
      console.log("[v0] Initiating swap with LiFi...");

      // ✅ Ensure chainIds are numbers first
      const fromChain = Number(fromToken.chainId);
      const toChain = Number(toToken.chainId);

      // ✅ Convert chainId to hex format for wallet switching
      const fromChainHex = `0x${fromChain.toString(16)}`;
      const currentChainId = chainId ? parseInt(chainId, 16) : null;

      // ✅ SWITCH TO SOURCE CHAIN BEFORE SWAP
      if (currentChainId !== fromChain) {
        console.log(`[v0] Switching network from chain ${currentChainId} to ${fromChain} (${fromChainHex})`);
        
        toast({
          title: "Switch Network",
          description: `Please switch to ${fromToken.chainName} network to complete the swap`,
          duration: 3000,
        });

        try {
          await switchNetwork(fromChainHex);
          
          // Wait for network switch to complete
          await new Promise((resolve) => setTimeout(resolve, 2000));
          
          console.log(`[v0] Successfully switched to ${fromToken.chainName}`);
        } catch (switchError: any) {
          console.error("[v0] Network switch failed:", switchError);
          
          // If network doesn't exist in wallet, try to add it
          if (switchError.code === 4902) {
            console.log(`[v0] Network not found, attempting to add ${fromToken.chainName}`);
            
            const networkConfig = getNetworkConfig(fromChain);
            if (networkConfig && typeof window !== "undefined" && window.ethereum) {
              try {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [networkConfig],
                });
                
                toast({
                  title: "Network Added",
                  description: `${fromToken.chainName} has been added to your wallet. Please try swapping again.`,
                  duration: 4000,
                });
                return;
              } catch (addError) {
                console.error("[v0] Failed to add network:", addError);
                toast({
                  title: "Failed to Add Network",
                  description: `Please add ${fromToken.chainName} network to your wallet manually`,
                  variant: "destructive",
                  duration: 5000,
                });
              }
            } else {
              toast({
                title: "Network Not Found",
                description: `Please add ${fromToken.chainName} network to your wallet manually`,
                variant: "destructive",
                duration: 5000,
              });
            }
          } else {
            toast({
              title: "Network Switch Failed",
              description: `Failed to switch to ${fromToken.chainName}. ${switchError.message || "Please switch manually."}`,
              variant: "destructive",
              duration: 5000,
            });
          }
          return;
        }
      }

      // ✅ fix decimals properly
      let fromTokenDecimals = fromToken.decimals;
      
      // If decimals not set, determine based on token and chain
      if (!fromTokenDecimals) {
        if (fromToken.symbol === "USDC") {
          fromTokenDecimals = 6;
        } else if (fromToken.symbol === "USDT") {
          // USDT has different decimals per chain!
          fromTokenDecimals = [1, 42161, 137].includes(fromChain) ? 6 : 18;
        } else if (fromToken.symbol === "WBTC") {
          fromTokenDecimals = 8;
        } else {
          fromTokenDecimals = 18;
        }
      }
      
      console.log(`[v0] Using decimals for ${fromToken.symbol}: ${fromTokenDecimals}`);
      
      const fromAmountWei = (
        Number.parseFloat(fromAmount) * Math.pow(10, fromTokenDecimals)
      ).toFixed(0); // LiFi expects integer string
      
      console.log(`[v0] Amount conversion: ${fromAmount} ${fromToken.symbol} = ${fromAmountWei} wei (using ${fromTokenDecimals} decimals)`);

      // ✅ remap unsupported USDT on Base → USDC
      if (fromToken.symbol === "USDT" && fromToken.chainId === 8453) {
        fromToken.address = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base USDC
        fromToken.symbol = "USDC";
      }
      if (toToken.symbol === "USDT" && toToken.chainId === 8453) {
        toToken.address = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
        toToken.symbol = "USDC";
      }

      // ✅ normalize token addresses (native tokens use null address)
      const safeFromToken = ["ETH", "BNB", "MATIC"].includes(fromToken.symbol)
        ? "0x0000000000000000000000000000000000000000"
        : fromToken.address;
      const safeToToken = ["ETH", "BNB", "MATIC"].includes(toToken.symbol)
        ? "0x0000000000000000000000000000000000000000"
        : toToken.address;

      const quoteRequest = {
        fromChain,
        toChain,
        fromToken: safeFromToken,
        toToken: safeToToken,
        fromAmount: fromAmountWei,
        fromAddress: fromWalletAddress,
        toAddress: toWalletAddress,
        slippage: slippageTolerance,
        order: isBridge ? ("FASTEST" as const) : ("CHEAPEST" as const),
      };

      console.log("[v0] Quote request:", quoteRequest);
      const lifiQuote = await getQuote(quoteRequest);

      if (!lifiQuote) {
        toast({
          title: "Quote Error",
          description: "No available route or invalid pair for this swap.",
          variant: "destructive",
          duration: 4000,
        });
        return;
      }

      console.log("[v0] Quote received:", lifiQuote);

      // ✅ CHECK AND REQUEST TOKEN APPROVAL FOR ERC20 TOKENS
      const isNativeToken = ["ETH", "BNB", "MATIC"].includes(fromToken.symbol);
      
      if (!isNativeToken && lifiQuote.transactionRequest && typeof window !== "undefined" && window.ethereum) {
        console.log("[v0] Checking token approval for ERC20 token...");
        
        // Get the spender address from LiFi quote (the contract that needs approval)
        const spenderAddress = lifiQuote.transactionRequest.to;
        console.log(`[v0] Spender address (LiFi contract): ${spenderAddress}`);
        
        try {
          // ERC20 allowance function signature: allowance(owner, spender)
          const allowanceData = `0xdd62ed3e${fromWalletAddress.slice(2).padStart(64, '0')}${spenderAddress.slice(2).padStart(64, '0')}`;
          
          const allowanceResult = await window.ethereum.request({
            method: "eth_call",
            params: [
              {
                to: fromToken.address,
                data: allowanceData,
              },
              "latest",
            ],
          });

          const currentAllowance = allowanceResult && allowanceResult !== "0x" ? parseInt(allowanceResult, 16) : 0;
          const requiredAmount = parseInt(fromAmountWei);
          
          console.log(`[v0] Current allowance: ${currentAllowance}, Required: ${requiredAmount}`);

          if (currentAllowance < requiredAmount) {
            console.log("[v0] Insufficient allowance, requesting approval...");
            
            toast({
              title: "Approval Required",
              description: `Please approve ${fromToken.symbol} for swapping`,
              duration: 4000,
            });

            // ERC20 approve function - approve max amount for better UX
            const maxApproval = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
            const approveData = `0x095ea7b3${spenderAddress.slice(2).padStart(64, '0')}${maxApproval.slice(2)}`;

            const approveTxHash = await window.ethereum.request({
              method: "eth_sendTransaction",
              params: [
                {
                  from: fromWalletAddress,
                  to: fromToken.address,
                  data: approveData,
                  value: "0x0",
                },
              ],
            });

            console.log("[v0] Approval transaction sent:", approveTxHash);
            
            toast({
              title: "Approval Pending",
              description: "Waiting for approval transaction to confirm...",
              duration: 5000,
            });

            // Wait for approval transaction to be mined
            let approvalReceipt = null;
            let attempts = 0;
            while (!approvalReceipt && attempts < 60) {
              await new Promise((resolve) => setTimeout(resolve, 2000));
              try {
                approvalReceipt = await window.ethereum.request({
                  method: "eth_getTransactionReceipt",
                  params: [approveTxHash],
                });
                attempts++;
              } catch (error) {
                console.log("[v0] Waiting for approval confirmation...");
                attempts++;
              }
            }

            if (approvalReceipt) {
              const status = typeof approvalReceipt.status === 'string' 
                ? parseInt(approvalReceipt.status, 16) 
                : approvalReceipt.status;
              
              if (status === 0) {
                throw new Error("Approval transaction failed");
              }
              
              console.log("[v0] Approval confirmed!");
              toast({
                title: "Approval Successful",
                description: `${fromToken.symbol} approved. Getting fresh quote...`,
                duration: 3000,
              });

              // ✅ GET FRESH QUOTE AFTER APPROVAL (quote may be stale)
              console.log("[v0] Fetching fresh quote after approval...");
              
              try {
                const freshQuote = await getQuote(quoteRequest);
                
                if (freshQuote) {
                  console.log("[v0] Fresh quote received after approval");
                  console.log("[v0] Fresh quote details:", {
                    fromAmount: freshQuote.action?.fromAmount,
                    toAmount: freshQuote.estimate?.toAmount,
                    transactionTo: freshQuote.transactionRequest?.to,
                  });
                  
                  // Replace the entire quote object with the fresh one
                  lifiQuote.transactionRequest = freshQuote.transactionRequest;
                  lifiQuote.estimate = freshQuote.estimate;
                  lifiQuote.action = freshQuote.action;
                } else {
                  console.warn("[v0] Failed to get fresh quote, using original");
                }
              } catch (refreshError) {
                console.error("[v0] Error getting fresh quote:", refreshError);
                console.warn("[v0] Will proceed with original quote");
              }
            } else {
              console.warn("[v0] Approval confirmation timeout - proceeding anyway");
            }
          } else {
            console.log("[v0] Sufficient allowance already exists");
          }
        } catch (approvalError) {
          console.error("[v0] Approval error:", approvalError);
          const errMsg = approvalError instanceof Error ? approvalError.message : String(approvalError);
          
          if (errMsg.includes("User rejected") || errMsg.includes("user rejected")) {
            toast({
              title: "Approval Cancelled",
              description: "You cancelled the approval. The swap cannot proceed without approval.",
              variant: "destructive",
              duration: 5000,
            });
          } else {
            toast({
              title: "Approval Failed",
              description: `Failed to approve token: ${errMsg}`,
              variant: "destructive",
              duration: 5000,
            });
          }
          throw approvalError;
        }
      }

      const toTokenDecimals =
        toToken.decimals || (toToken.symbol === "USDC" ? 6 : 18);
      const toAmountFormatted = (
        Number.parseFloat(lifiQuote.estimate.toAmount) /
        Math.pow(10, toTokenDecimals)
      ).toFixed(6);
      setToAmount(toAmountFormatted);

      // Determine gas fee currency based on chain
      const gasFeeCurrency = fromToken.chainName === "BSC" || fromToken.symbol === "BNB" ? "BNB" : 
                             fromToken.chainName === "Polygon" || fromToken.symbol === "MATIC" ? "MATIC" : "ETH";
      
      console.log(`[v0] Gas fees will be paid in ${gasFeeCurrency} on ${fromToken.chainName} (Chain ID: ${fromChain})`);
      
      if (lifiQuote.estimate?.gasCosts) {
        const gasCosts = lifiQuote.estimate.gasCosts;
        console.log(`[v0] Estimated gas: ${gasCosts[0]?.estimate || "Unknown"} (${gasCosts[0]?.amountUSD ? `$${gasCosts[0].amountUSD}` : "N/A"})`);
      }

      // ✅ Log transaction details before execution
      console.log("[v0] Final transaction details:");
      console.log("- To address:", lifiQuote.transactionRequest?.to);
      console.log("- Data length:", lifiQuote.transactionRequest?.data?.length);
      console.log("- Value:", lifiQuote.transactionRequest?.value);
      console.log("- Gas limit:", lifiQuote.transactionRequest?.gasLimit);
      console.log("- Slippage tolerance:", slippageTolerance);
      
      // ✅ Test the transaction with eth_call before submitting
      if (typeof window !== "undefined" && window.ethereum && lifiQuote.transactionRequest) {
        try {
          console.log("[v0] Testing transaction with eth_call...");
          const testResult = await window.ethereum.request({
            method: "eth_call",
            params: [
              {
                from: fromWalletAddress,
                to: lifiQuote.transactionRequest.to,
                data: lifiQuote.transactionRequest.data,
                value: lifiQuote.transactionRequest.value || "0x0",
              },
              "latest",
            ],
          });
          console.log("[v0] eth_call test successful, result:", testResult);
        } catch (testError: any) {
          console.error("[v0] eth_call test failed:", testError);
          
          // If the test call fails, the actual transaction will definitely fail
          let errorMsg = "Transaction simulation failed. ";
          
          if (testError.message?.includes("insufficient funds")) {
            errorMsg += "Insufficient balance or gas.";
          } else if (testError.message?.includes("slippage")) {
            errorMsg += "Slippage tolerance too low. Try increasing it in settings.";
          } else if (testError.message?.includes("INSUFFICIENT_OUTPUT_AMOUNT")) {
            errorMsg += "Price impact too high or slippage too low. Increase slippage tolerance.";
          } else {
            errorMsg += testError.message || "Unknown error";
          }
          
          toast({
            title: "Transaction Will Fail",
            description: errorMsg,
            variant: "destructive",
            duration: 6000,
          });
          
          throw new Error(errorMsg);
        }
      }
      
      // ✅ signer
      let signer = null;
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const w = (window as any).ethereum;
        signer = {
          sendTransaction: async (txRequest: any) => {
            console.log("[v0] Sending transaction with request:", {
              to: txRequest.to,
              from: fromWalletAddress,
              value: txRequest.value,
              gasLimit: txRequest.gasLimit,
              dataLength: txRequest.data?.length,
            });
            console.log(`[v0] Transaction will execute on ${fromToken.chainName} (Chain ID: ${fromChain})`);
            console.log(`[v0] Gas will be paid in ${gasFeeCurrency}`);
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
                    ...(txRequest.gasPrice && { gasPrice: txRequest.gasPrice }),
                  },
                ],
              });

              return {
                hash: txHash,
                wait: async () => {
                  console.log("[v0] Waiting for transaction confirmation...");
                  let receipt = null;
                  let attempts = 0;
                  const maxAttempts = 60;
                  
                  while (!receipt && attempts < maxAttempts) {
                    try {
                      receipt = await w.request({
                        method: "eth_getTransactionReceipt",
                        params: [txHash],
                      });
                      
                      if (receipt) {
                        console.log("[v0] Transaction receipt received:", receipt);
                        
                        const status = receipt.status;
                        const statusNumber = typeof status === 'string' ? parseInt(status, 16) : status;
                        
                        if (statusNumber === 0) {
                          console.error("[v0] Transaction failed on chain");
                          console.error("[v0] Transaction receipt:", receipt);
                          throw new Error("Transaction reverted - this may be due to slippage, insufficient balance, or price impact");
                        }
                        
                        console.log("[v0] Transaction confirmed successfully!");
                        break;
                      } else {
                        console.log(`[v0] Transaction pending... (attempt ${attempts + 1}/${maxAttempts})`);
                        await new Promise((res) => setTimeout(res, 5000));
                        attempts++;
                      }
                    } catch (error) {
                      if (error instanceof Error && error.message.includes("reverted")) {
                        console.error("[v0] Transaction reverted:", error);
                        throw error;
                      }
                      console.log("[v0] Error checking receipt (will retry):", error);
                      await new Promise((res) => setTimeout(res, 5000));
                      attempts++;
                    }
                  }
                  
                  if (!receipt && attempts >= maxAttempts) {
                    console.warn("[v0] Transaction confirmation timeout - but may still succeed");
                  }
                  
                  return {
                    transactionHash: txHash,
                    status: receipt?.status || 1,
                    blockNumber: receipt?.blockNumber,
                    gasUsed: receipt?.gasUsed,
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

      console.log("[v0] Executing swap transaction...");
      console.log("[v0] Quote being sent to executeSwap:", {
        hasTransactionRequest: !!lifiQuote.transactionRequest,
        hasEstimate: !!lifiQuote.estimate,
        estimatedToAmount: lifiQuote.estimate?.toAmount,
      });
      
      const txHash = await executeSwap(lifiQuote, signer);
      
      if (txHash) {
        console.log("[v0] Transaction hash received:", txHash);
        
        toast({
          title: `${isBridge ? "Bridge" : "Swap"} Transaction Submitted`,
          description: `Transaction hash: ${txHash.substring(0, 10)}... Waiting for confirmation...`,
          variant: "default",
          duration: 5000,
        });

        // Wait for transaction to be indexed
        const blockTimeMs = fromChain === 56 ? 3000 : 
                           fromChain === 1 ? 12000 : 
                           fromChain === 8453 ? 2000 : 
                           fromChain === 42161 ? 250 : 
                           5000;
        
        console.log(`[v0] Waiting ${blockTimeMs}ms for ${fromToken.chainName} to index transaction...`);
        await new Promise((resolve) => setTimeout(resolve, blockTimeMs));

        // Refresh wallet balances
        console.log("[v0] Refreshing wallet balances...");
        let refreshAttempts = 0;
        const maxRefreshAttempts = 3;
        
        while (refreshAttempts < maxRefreshAttempts) {
          try {
            await refreshBalances();
            console.log(`[v0] Balances refreshed successfully (attempt ${refreshAttempts + 1})`);
            
            if (refreshAttempts < maxRefreshAttempts - 1) {
              await new Promise((resolve) => setTimeout(resolve, 3000));
            }
            refreshAttempts++;
          } catch (refreshError) {
            console.error(`[v0] Failed to refresh balances (attempt ${refreshAttempts + 1}):`, refreshError);
            refreshAttempts++;
            if (refreshAttempts < maxRefreshAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 2000));
            }
          }
        }

        toast({
          title: `${isBridge ? "Bridge" : "Swap"} Completed!`,
          description: `Your tokens have been swapped successfully! Your balance has been updated.`,
          variant: "default",
          duration: 5000,
        });

        setFromAmount("");
        setToAmount("");
      } else {
        console.error("[v0] No transaction hash returned from executeSwap");
        toast({
          title: "Transaction Failed",
          description: "The transaction was reverted. Please try again with higher slippage tolerance.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("[v0] Swap error:", errMsg);
      
      let errorDescription = errMsg;
      
      if (errMsg.includes("Invalid request parameters")) {
        errorDescription = "LiFi rejected the token pair or amount. Ensure token addresses and amounts are valid and supported.";
      } else if (errMsg.includes("reverted") || errMsg.includes("slippage") || errMsg.includes("price impact")) {
        errorDescription = "Transaction reverted on chain. Try: 1) Increase slippage tolerance, 2) Reduce swap amount, 3) Wait and try again.";
      } else if (errMsg.includes("insufficient funds") || errMsg.includes("insufficient balance")) {
        errorDescription = "Insufficient balance. You need more tokens or gas fees.";
      } else if (errMsg.includes("User rejected") || errMsg.includes("user rejected")) {
        errorDescription = "Transaction was cancelled.";
      }
      
      toast({
        title: "Swap Failed",
        description: errorDescription,
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setIsSwapping(false);
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
      });

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
          });
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
      });

      setFromAmount("");
    } catch (error) {
      console.error("[v0] Limit order error:", error);
      toast({
        title: "Limit Order Failed",
        description: "Unable to place limit order. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
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
          
          const fromTokenDecimals = fromToken.decimals || 
            (fromToken.symbol === "USDC" ? 6 : 
             fromToken.symbol === "USDT" ? 6 : 
             fromToken.symbol === "WBTC" ? 8 : 18);
          
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
          console.log(`[v0] FromToken details - Symbol: ${fromToken.symbol}, Address: ${fromToken.address}, ChainId: ${fromToken.chainId}, Decimals: ${fromTokenDecimals}`);
          console.log(`[v0] ToToken details - Symbol: ${toToken.symbol}, Address: ${toToken.address}, ChainId: ${toToken.chainId}`);
          const lifiQuote = await getQuote(quoteRequest);
          if (lifiQuote) {
            console.log("[v0] Quote received:", lifiQuote);

            const toTokenDecimals = toToken.decimals || 
              (toToken.symbol === "USDC" ? 6 : 
               toToken.symbol === "USDT" ? 6 : 
               toToken.symbol === "WBTC" ? 8 : 18);
            
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
                  disabled={isLiFiLoading || isSwapping}
                  className={`w-full h-12 font-semibold rounded-none my-4 text-lg ${
                    isConnected
                      ? "bg-gradient-to-r from-[#F3DA5F] to-[#FCD404] text-black"
                      : "bg-gradient-to-r from-[#F3DA5F] to-[#FCD404] text-black"
                  } ${(isLiFiLoading || isSwapping) ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isSwapping 
                    ? "Swapping..." 
                    : isLiFiLoading 
                    ? "Getting Quote..." 
                    : buttonText}
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
