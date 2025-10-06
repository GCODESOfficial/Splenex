/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { useAlchemyBalance } from "@/hooks/use-alchemy-balance";

interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  usdValue: number;
  pricePerToken?: number;
  chain?: string;
}

interface DetectedWallet {
  id: string;
  name: string;
  provider: any;
}

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  chainId: string | null;
  balance: string | null;
  totalUsdBalance: number;
  tokenBalances: TokenBalance[];
  isConnecting: boolean;
  connectingWallet: string | null;
  connect: (walletType?: string, providerOverride?: any) => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: string) => Promise<void>;
  detectWallets: () => DetectedWallet[];
  refreshBalances: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

function providerId(p: any): { id: string; name: string } {
  if (!p) return { id: "injected", name: "Injected" };
  if (p.isRabby) return { id: "rabby", name: "Rabby" };
  if (p.isMetaMask) return { id: "metamask", name: "MetaMask" };
  if (p.isPhantom) return { id: "phantom", name: "Phantom" };
  if (p.isKeplr) return { id: "keplr", name: "Keplr" };
  return { id: "injected", name: "Injected" };
}

function detectWalletsImpl(): DetectedWallet[] {
  const detected: DetectedWallet[] = [];
  if (typeof window === "undefined") return detected;
  const eth = (window as any).ethereum;
  const providers: any[] = Array.isArray(eth?.providers) ? eth.providers : [eth].filter(Boolean);
  for (const prov of providers) {
    const meta = providerId(prov);
    if (!detected.some((d) => d.id === meta.id))
      detected.push({ id: meta.id, name: meta.name, provider: prov });
  }
  if ((window as any).solana?.isPhantom)
    detected.push({ id: "phantom", name: "Phantom", provider: (window as any).solana });
  if ((window as any).keplr)
    detected.push({ id: "keplr", name: "Keplr", provider: (window as any).keplr });
  return detected;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const providerRef = useRef<any>(null);

  const detectWallets = () => detectWalletsImpl();

  const resolveProvider = (walletType?: string): any => {
    const detected = detectWalletsImpl();
    if (walletType) {
      const lower = walletType.toLowerCase();
      return detected.find(
        (d) => d.id === lower || d.name.toLowerCase().includes(lower)
      )?.provider;
    }
    return detected[0]?.provider;
  };

  const { totalUsd, nativeSum, tokens, refresh } = useAlchemyBalance(address);

  const refreshBalances = async () => {
    try {
      await refresh();
    } catch (err) {
      console.error("[Wallet] refreshBalances failed:", err);
    }
  };

  const connect = async (walletType?: string, providerOverride?: any) => {
    try {
      setIsConnecting(true);
      setConnectingWallet(walletType || "default");
      const provider = providerOverride || resolveProvider(walletType);
      if (!provider) throw new Error("No wallet detected");
      providerRef.current = provider;

      if (provider.isPhantom || provider?.connect) {
        const res = await provider.connect();
        const pub = res?.publicKey?.toString?.() || provider.publicKey?.toString?.();
        setAddress(pub);
        setIsConnected(true);
        setChainId("solana:mainnet");
        await refreshBalances();
        localStorage.setItem("connectedWallet", JSON.stringify({ walletType: "phantom" }));
        return;
      }

      if (provider.enable && provider === (window as any).keplr) {
        const preferred = localStorage.getItem("preferredKeplrChain") || "cosmoshub-4";
        await provider.enable(preferred);
        const key = await (window as any).keplr.getKey(preferred);
        setAddress(key?.bech32Address || null);
        setIsConnected(true);
        setChainId(preferred);
        await refreshBalances();
        localStorage.setItem("connectedWallet", JSON.stringify({ walletType: "keplr" }));
        return;
      }

      if (typeof provider.request === "function") {
        const accounts: string[] = await provider.request({ method: "eth_requestAccounts" });
        if (!accounts?.length) throw new Error("No account authorized");
        const acc = accounts[0];
        setAddress(acc);
        setIsConnected(true);
        const cid: string = await provider.request({ method: "eth_chainId" });
        setChainId(cid);
        await refreshBalances();
        const id = providerId(provider).id;
        localStorage.setItem("connectedWallet", JSON.stringify({ walletType: id }));
        return;
      }

      throw new Error("Unsupported provider");
    } catch (err) {
      console.error("[Wallet] connect error:", err);
    } finally {
      setIsConnecting(false);
      setConnectingWallet(null);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setChainId(null);
    setIsConnected(false);
    setIsConnecting(false);
    setConnectingWallet(null);
    providerRef.current = null;
    localStorage.removeItem("connectedWallet");
  };

  const value: WalletContextType = {
    address,
    isConnected,
    chainId,
    balance: nativeSum ? nativeSum.toFixed(4) : "0.0000",
    totalUsdBalance: totalUsd,
    tokenBalances: tokens.map((t) => ({
      symbol: t.symbol,
      name: t.name ?? "",
      balance: t.balance,
      usdValue: t.usd ?? 0,
      pricePerToken: t.price,
      chain: t.chain,
    })),
    isConnecting,
    connectingWallet,
    connect,
    disconnect,
    switchNetwork: async () => {},
    detectWallets,
    refreshBalances,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
}
