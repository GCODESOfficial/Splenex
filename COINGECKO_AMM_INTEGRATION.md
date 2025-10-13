# CoinGecko Token Integration & Expanded AMM Support

## Overview

This document describes the comprehensive integration of CoinGecko's extensive token database and expanded AMM (Automated Market Maker) support in the Splenex DEX. Users can now swap or bridge **any token available on CoinGecko** across multiple wallets and chains.

## Features

### 🪙 CoinGecko Token Integration

#### What It Does
- **Comprehensive Token Database**: Access to **10,000+** tokens from CoinGecko
- **Token Logos**: Automatic fetching of high-quality token logos from CoinGecko
- **Multi-Chain Support**: Tokens available across 20+ blockchain networks
- **Real-Time Search**: Dynamic token search with debounced API calls
- **Smart Caching**: In-memory caching (1-hour duration) to reduce API calls

#### Supported Chains
The integration supports tokens on the following chains:
- Ethereum (ETH)
- Binance Smart Chain (BSC)
- Polygon (MATIC)
- Arbitrum
- Optimism
- Avalanche (AVAX)
- Base
- Fantom (FTM)
- Harmony (ONE)
- Moonriver / Moonbeam
- Cronos (CRO)
- Celo
- Aurora
- Metis
- KuCoin Community Chain (KCC)
- OKEx Chain
- Huobi ECO Chain (HECO)
- Fuse
- BitTorrent Chain
- Polygon zkEVM
- zkSync Era
- Linea
- Solana
- Cosmos

#### How It Works

1. **Service Layer** (`lib/coingecko-service.ts`):
   - Fetches tokens from CoinGecko API
   - Maps platform names to chain IDs
   - Formats token data with logos and metadata
   - Implements caching to reduce API calls

2. **API Route** (`app/api/coingecko-tokens/route.ts`):
   - Provides RESTful endpoint for token queries
   - Supports filtering by chain, search query, and trending tokens
   - Implements pagination for large result sets

3. **Token Selection Modal** (`components/token-selection-modal.tsx`):
   - Integrates CoinGecko tokens with wallet balances and LiFi tokens
   - Prioritizes display: Wallet Balances → CoinGecko → LiFi → Popular
   - Shows token logos from CoinGecko with TrustWallet fallback

#### Usage

Users can now:
- **Search Any Token**: Type any token name, symbol, or contract address
- **Filter by Chain**: Select a specific blockchain to see available tokens
- **View Token Logos**: High-quality logos for visual identification
- **Swap/Bridge**: Execute swaps or bridges for any CoinGecko-listed token

### 🔄 Expanded AMM Support

#### What It Does
- **40+ AMMs & DEXs**: Support for all major decentralized exchanges
- **Real-Time Data**: Fetches available AMMs from LiFi API
- **Bridge Protocols**: Includes cross-chain bridge protocols
- **Visual Display**: Organized tabs showing DEXs and Bridges separately

#### Supported AMMs & DEXs

**Decentralized Exchanges (DEXs):**
- Uniswap V2 & V3
- PancakeSwap V2 & V3
- SushiSwap
- Curve Finance
- Balancer
- 1inch (Aggregator)
- Kyber Network
- Quickswap
- Trader Joe
- SpookySwap
- Raydium
- Orca
- DODO
- Bancor
- Velodrome
- Camelot
- Maverick
- GMX
- Zyberswap
- Beethoven X
- WooFi
- Solidly
- Aerodrome
- BaseSwap
- SyncSwap
- Mute
- *And many more...*

**Bridge Protocols:**
- Stargate
- Hop Protocol
- Connext
- Across Protocol
- Celer cBridge
- Multichain
- Synapse
- Wormhole
- Axelar
- LayerZero
- *And many more...*

#### How It Works

1. **AMM API Route** (`app/api/supported-amms/route.ts`):
   - Fetches real-time AMM data from LiFi API
   - Includes both exchanges (DEXs) and bridges
   - Fallback to comprehensive hardcoded list if API fails

2. **AMM Display Component** (`components/automated-market-makers.tsx`):
   - Shows all supported AMMs with logos and status indicators
   - Organized tabs: All, DEXs, Bridges
   - Visual indicators for active/inactive status

#### Usage

Users can:
- **View All AMMs**: See all available liquidity sources
- **Filter by Type**: Switch between DEXs and Bridges
- **Optimal Routing**: LiFi automatically routes through best AMMs

## Technical Implementation

### CoinGecko Service

```typescript
// Fetch all CoinGecko tokens
import { fetchCoinGeckoTokens } from '@/lib/coingecko-service';

const tokens = await fetchCoinGeckoTokens();
```

```typescript
// Search for specific tokens
import { searchCoinGeckoTokens } from '@/lib/coingecko-service';

const results = await searchCoinGeckoTokens('USDC', 1); // Search USDC on Ethereum
```

```typescript
// Get tokens for a specific chain
import { getCoinGeckoTokensByChain } from '@/lib/coingecko-service';

const ethTokens = await getCoinGeckoTokensByChain(1); // Ethereum tokens
```

### API Endpoints

#### Get CoinGecko Tokens
```
GET /api/coingecko-tokens

Query Parameters:
- search: string (optional) - Search query for token name/symbol/address
- chainId: number (optional) - Filter by chain ID
- trending: boolean (optional) - Get trending tokens
- page: number (optional) - Page number for pagination
- limit: number (optional) - Results per page (default: 100)

Response:
{
  success: true,
  data: Token[],
  count: number,
  total: number,
  page: number,
  limit: number
}
```

#### Get Supported AMMs
```
GET /api/supported-amms

Response:
[
  {
    name: string,
    key: string,
    logo: string,
    isActive: boolean,
    type: "DEX" | "Bridge"
  }
]
```

## Token Selection Priority

The token selection modal displays tokens in the following priority order:

1. **Wallet Balances** (Highest Priority)
   - Tokens the user currently holds
   - Shows actual balance and USD value

2. **CoinGecko Tokens**
   - Comprehensive list of all available tokens
   - Includes logos and metadata

3. **LiFi Tokens**
   - Tokens supported by LiFi protocol for swapping

4. **Popular Tokens** (Fallback)
   - Hardcoded list of common tokens (ETH, USDC, USDT, etc.)

## Logo Resolution

Token logos are resolved in the following order:

1. **CoinGecko Logo** (if available)
   - High-quality logos from CoinGecko CDN
   
2. **Chain Native Token**
   - For native tokens (ETH, BNB, MATIC), uses chain icon

3. **TrustWallet Assets**
   - Falls back to TrustWallet's token icon repository

4. **Fallback Display**
   - Shows first letter of token symbol on colored background

## Caching Strategy

- **Token Cache**: 1 hour in-memory cache for CoinGecko tokens
- **AMM Cache**: Real-time fetch from LiFi with fallback list
- **Benefits**:
  - Reduced API calls
  - Faster user experience
  - Cost optimization

## Swap Capabilities

With the CoinGecko integration, users can now:

### In-Wallet Swaps
- Swap any token within the same wallet
- Swap across different chains (bridging)

### Cross-Wallet Swaps
- Swap from primary wallet to secondary wallet
- Swap to any pasted wallet address
- Bridge tokens between wallets on different chains

### Example Use Cases

1. **Basic Swap**: ETH → USDC (Same chain, same wallet)
2. **Bridge**: ETH (Ethereum) → USDC (Polygon) (Cross-chain, same wallet)
3. **Cross-Wallet**: USDC (Wallet A) → DAI (Wallet B)
4. **Complex Bridge**: ETH (Ethereum, Wallet A) → USDC (Base, Wallet B)

## Performance Considerations

### API Rate Limits
- CoinGecko Free Tier: 10-30 calls/minute
- Mitigation: 1-hour caching reduces calls significantly
- Search debouncing: 300ms delay before API call

### Data Volume
- 10,000+ tokens across 20+ chains
- Pagination implemented: 100-500 tokens per page
- Efficient filtering on client-side

### User Experience
- Loading states for token fetching
- Progressive enhancement: Shows cached data while fetching
- Error handling with fallback to cached data

## Future Enhancements

Potential improvements for the future:

1. **Redis Caching**: Replace in-memory cache with Redis for persistence
2. **Token Analytics**: Show price changes, volume, market cap from CoinGecko
3. **Favorite Tokens**: Let users save frequently used tokens
4. **Price Alerts**: Notify users of price changes for selected tokens
5. **Advanced Filtering**: Filter by market cap, volume, price range
6. **CoinGecko Pro**: Upgrade to CoinGecko Pro API for higher rate limits

## Testing

### Manual Testing Steps

1. **Token Search**:
   - Open token selection modal
   - Search for popular tokens (BTC, ETH, USDC)
   - Search for obscure tokens
   - Verify logos display correctly

2. **Chain Filtering**:
   - Select different chains from dropdown
   - Verify tokens filter correctly
   - Check that chain-specific tokens appear

3. **AMM Display**:
   - Navigate to overview page
   - Verify AMM component loads
   - Check tabs (All, DEXs, Bridges) work
   - Verify logos and status indicators

4. **Swap Execution**:
   - Select a CoinGecko token
   - Execute a swap
   - Verify transaction completes
   - Check balance updates

### Automated Testing

```bash
# Test CoinGecko service
npm test lib/coingecko-service.test.ts

# Test API routes
npm test app/api/coingecko-tokens/route.test.ts
npm test app/api/supported-amms/route.test.ts
```

## Troubleshooting

### Common Issues

**Issue**: Tokens not loading
- **Solution**: Check network connection, verify CoinGecko API is accessible

**Issue**: Logos not displaying
- **Solution**: Check CORS policy, verify CoinGecko CDN is accessible

**Issue**: Slow search
- **Solution**: Reduce search frequency, increase debounce delay

**Issue**: Cache not working
- **Solution**: Clear cache manually using `clearTokenCache()` function

## Support

For questions or issues related to CoinGecko integration or AMM support:
1. Check this documentation
2. Review code comments in relevant files
3. Contact development team

## Related Files

- `/lib/coingecko-service.ts` - CoinGecko service implementation
- `/app/api/coingecko-tokens/route.ts` - CoinGecko API endpoint
- `/app/api/supported-amms/route.ts` - AMM API endpoint
- `/components/token-selection-modal.tsx` - Token selection UI
- `/components/automated-market-makers.tsx` - AMM display component
- `/hooks/use-lifi.tsx` - LiFi integration hook

---

**Last Updated**: October 12, 2025  
**Version**: 1.0.0

