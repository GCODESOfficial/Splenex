# Testing Guide: CoinGecko Integration & Expanded AMM Support

## Overview

This guide provides step-by-step instructions for testing the new CoinGecko token integration and expanded AMM support features.

## Pre-Testing Setup

### Requirements
- Node.js and npm installed
- Wallet extension installed (MetaMask, Rabby, Coinbase, etc.)
- Test tokens on at least 2 different chains
- Active internet connection

### Environment Setup

1. **Start the Development Server**:
   ```bash
   npm run dev
   ```

2. **Access the Application**:
   - Open browser to `http://localhost:3000`
   - Ensure no console errors

## Test Plan

### 1. CoinGecko Token Search & Display

#### Test 1.1: Basic Token Search
**Objective**: Verify token search functionality

**Steps**:
1. Navigate to swap page (`/`)
2. Click on token selection dropdown
3. Type "BTC" in search box
4. Wait for results to load

**Expected Results**:
- ✅ CoinGecko tokens load within 2-3 seconds
- ✅ Bitcoin (BTC) appears in results with logo
- ✅ Multiple BTC variants shown (WBTC on different chains)
- ✅ Token count displayed at top right
- ✅ Loading indicator shown during fetch

**Pass/Fail**: _______

---

#### Test 1.2: Chain-Specific Token Filtering
**Objective**: Verify chain filtering works correctly

**Steps**:
1. Open token selection modal
2. Select "Ethereum" from chain dropdown
3. Search for "USDC"
4. Switch to "Polygon" chain
5. Search for same token

**Expected Results**:
- ✅ Only Ethereum USDC shows when Ethereum selected
- ✅ Only Polygon USDC shows when Polygon selected
- ✅ Different contract addresses for each chain
- ✅ Logos display correctly for both
- ✅ Chain badge shows on token icons

**Pass/Fail**: _______

---

#### Test 1.3: Token Logo Resolution
**Objective**: Verify token logos display correctly

**Steps**:
1. Open token selection modal
2. Search for these tokens:
   - ETH (native token)
   - USDC (popular token)
   - LINK (common token)
   - An obscure token with low market cap

**Expected Results**:
- ✅ ETH shows chain icon (Ethereum logo)
- ✅ USDC shows USDC logo from CoinGecko
- ✅ LINK shows LINK logo
- ✅ Obscure token shows either logo or fallback (first letter)
- ✅ No broken image icons

**Pass/Fail**: _______

---

#### Test 1.4: Wallet Balance Integration
**Objective**: Verify wallet balances display correctly alongside CoinGecko tokens

**Steps**:
1. Connect wallet with test tokens
2. Open token selection modal
3. Observe token list order

**Expected Results**:
- ✅ Wallet balance tokens appear at top
- ✅ CoinGecko tokens appear after wallet balances
- ✅ Balance and USD value shown for wallet tokens
- ✅ All tokens have correct chain information
- ✅ No duplicate tokens

**Pass/Fail**: _______

---

### 2. AMM Display & Functionality

#### Test 2.1: AMM Component Display
**Objective**: Verify AMM component renders correctly

**Steps**:
1. Navigate to overview page
2. Scroll to "Liquidity Sources" section
3. Observe AMM display

**Expected Results**:
- ✅ AMM component loads without errors
- ✅ Shows "40+" or actual count of AMMs
- ✅ Three tabs visible: All, DEXs, Bridges
- ✅ Green status indicators for active AMMs
- ✅ AMM logos display (if available)

**Pass/Fail**: _______

---

#### Test 2.2: AMM Tab Switching
**Objective**: Verify tab functionality

**Steps**:
1. Click "All" tab - observe count
2. Click "DEXs" tab - observe count
3. Click "Bridges" tab - observe count
4. Return to "All" tab

**Expected Results**:
- ✅ All tab shows total count (DEXs + Bridges)
- ✅ DEXs tab shows only DEX/exchange protocols
- ✅ Bridges tab shows only bridge protocols
- ✅ Counts add up correctly
- ✅ No duplicates across tabs
- ✅ Smooth tab transitions

**Pass/Fail**: _______

---

#### Test 2.3: AMM Data Fetching
**Objective**: Verify AMM data loads from LiFi or fallback

**Steps**:
1. Open browser DevTools console
2. Navigate to overview page
3. Watch for AMM fetch logs
4. Check if data comes from LiFi or fallback

**Expected Results**:
- ✅ Console shows AMM fetch attempt
- ✅ Either LiFi success or fallback message
- ✅ No JavaScript errors
- ✅ All AMMs have names and types
- ✅ Hover effects work on AMM cards

**Pass/Fail**: _______

---

### 3. Token Swapping with CoinGecko Tokens

#### Test 3.1: Same-Chain Swap (CoinGecko Token)
**Objective**: Execute swap using CoinGecko token

**Steps**:
1. Connect wallet to Ethereum (or any testnet)
2. From Token: Select ETH
3. To Token: Search and select a CoinGecko token (e.g., LINK)
4. Enter amount (small test amount)
5. Click "Swap"
6. Approve transaction in wallet

**Expected Results**:
- ✅ Token search returns CoinGecko token with logo
- ✅ Quote fetched successfully from LiFi
- ✅ Expected output amount displayed
- ✅ Gas estimate shown
- ✅ Transaction submitted successfully
- ✅ Balance updates after confirmation

**Pass/Fail**: _______

---

#### Test 3.2: Cross-Chain Bridge (CoinGecko Token)
**Objective**: Bridge CoinGecko token across chains

**Steps**:
1. Connect wallet
2. From Token: ETH on Ethereum
3. To Token: Search CoinGecko for USDC on Polygon
4. Enter swap amount
5. Execute bridge

**Expected Results**:
- ✅ Cross-chain indicator shows "Bridge"
- ✅ Quote shows bridge route
- ✅ Gas costs on source chain shown
- ✅ Transaction executes on source chain
- ✅ Tokens arrive on destination chain (may take time)
- ✅ Both wallet balances update

**Pass/Fail**: _______

---

#### Test 3.3: Cross-Wallet Swap (CoinGecko Token)
**Objective**: Swap from primary to secondary wallet using CoinGecko token

**Steps**:
1. Connect primary wallet
2. Connect secondary wallet (or paste address)
3. From Token: Select any CoinGecko token with balance
4. To Token: Select different CoinGecko token
5. Ensure "To" wallet is secondary wallet
6. Execute swap

**Expected Results**:
- ✅ Both wallets show in swap interface
- ✅ Quote calculates correctly
- ✅ Transaction executes from primary wallet
- ✅ Tokens arrive in secondary wallet
- ✅ Both balances update correctly

**Pass/Fail**: _______

---

#### Test 3.4: Search Obscure Token & Swap
**Objective**: Test swapping less common CoinGecko tokens

**Steps**:
1. Open token modal
2. Search for a low-market-cap token (e.g., "PEPE", "SHIB", etc.)
3. Select the token
4. Try to get a quote

**Expected Results**:
- ✅ Token found in CoinGecko results
- ✅ Logo displays correctly
- ✅ Either quote succeeds OR shows "No route available"
- ✅ If no route, clear error message shown
- ✅ No application crash or freeze

**Pass/Fail**: _______

---

### 4. Performance & Error Handling

#### Test 4.1: CoinGecko API Failure
**Objective**: Verify graceful handling of API failures

**Steps**:
1. Block `api.coingecko.com` in browser DevTools (Network tab)
2. Open token selection modal
3. Try to search tokens

**Expected Results**:
- ✅ Error caught gracefully
- ✅ Cached tokens still shown (if previously loaded)
- ✅ Or fallback popular tokens shown
- ✅ No application crash
- ✅ User-friendly error message (optional)

**Pass/Fail**: _______

---

#### Test 4.2: Search Performance
**Objective**: Verify search is responsive with debouncing

**Steps**:
1. Open token selection modal
2. Type quickly: "btcethlink"
3. Delete and type slowly: "usdc"
4. Observe network requests in DevTools

**Expected Results**:
- ✅ Debouncing prevents API call on every keystroke
- ✅ API call only after 300ms pause
- ✅ Search feels responsive
- ✅ Results update smoothly
- ✅ No excessive API calls

**Pass/Fail**: _______

---

#### Test 4.3: Large Token List Rendering
**Objective**: Verify performance with many tokens

**Steps**:
1. Select "All Chains" in token modal
2. Clear search (show all tokens)
3. Scroll through token list
4. Observe scrolling performance

**Expected Results**:
- ✅ List renders within reasonable time
- ✅ Smooth scrolling (60fps or close)
- ✅ No UI freezing
- ✅ Logos load progressively
- ✅ Pagination or virtualization works (if implemented)

**Pass/Fail**: _______

---

### 5. Mobile Responsiveness

#### Test 5.1: Mobile Token Selection
**Objective**: Verify mobile UI works correctly

**Steps**:
1. Open app on mobile device or use DevTools mobile emulation
2. Open token selection modal
3. Search for tokens
4. Filter by chain

**Expected Results**:
- ✅ Modal displays correctly on mobile
- ✅ Search input is usable
- ✅ Chain dropdown works
- ✅ Token list scrolls smoothly
- ✅ Token selection works
- ✅ No layout issues

**Pass/Fail**: _______

---

#### Test 5.2: Mobile AMM Display
**Objective**: Verify AMM component on mobile

**Steps**:
1. Navigate to overview on mobile
2. View AMM component
3. Switch between tabs

**Expected Results**:
- ✅ AMM cards display in responsive grid
- ✅ Tabs are accessible and usable
- ✅ AMM names visible
- ✅ No horizontal scrolling issues
- ✅ Touch interactions work

**Pass/Fail**: _______

---

## API Testing

### CoinGecko Tokens API

#### Test Direct API Endpoints

```bash
# Test 1: Fetch all tokens (paginated)
curl "http://localhost:3000/api/coingecko-tokens?limit=10"

# Test 2: Search for specific token
curl "http://localhost:3000/api/coingecko-tokens?search=bitcoin"

# Test 3: Filter by chain
curl "http://localhost:3000/api/coingecko-tokens?chainId=1&limit=20"

# Test 4: Get trending tokens
curl "http://localhost:3000/api/coingecko-tokens?trending=true"
```

**Expected Responses**:
- ✅ Status 200 for all requests
- ✅ JSON response with `success: true`
- ✅ `data` array contains tokens
- ✅ Tokens have required fields: symbol, name, address, chainId, logoURI

---

### Supported AMMs API

```bash
# Test AMM endpoint
curl "http://localhost:3000/api/supported-amms"
```

**Expected Response**:
- ✅ Status 200
- ✅ JSON array of AMMs
- ✅ Each AMM has: name, key, type, isActive
- ✅ Both DEXs and Bridges present

---

## Checklist Summary

| Test Category | Tests Passed | Tests Failed | Notes |
|---------------|--------------|--------------|-------|
| Token Search & Display | ___/4 | ___/4 | |
| AMM Display | ___/3 | ___/3 | |
| Token Swapping | ___/4 | ___/4 | |
| Performance | ___/3 | ___/3 | |
| Mobile | ___/2 | ___/2 | |
| API Endpoints | ___/2 | ___/2 | |
| **TOTAL** | **___/18** | **___/18** | |

---

## Critical Issues Log

Document any critical issues found during testing:

| Issue # | Description | Severity | Status | Notes |
|---------|-------------|----------|--------|-------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## Sign-Off

**Tester Name**: _______________________  
**Date**: _______________________  
**Overall Assessment**: ☐ Pass ☐ Fail ☐ Pass with Minor Issues  

**Comments**:
_____________________________________________
_____________________________________________
_____________________________________________

---

## Additional Notes

### Known Limitations
1. CoinGecko Free API has rate limits (10-30 calls/minute)
2. Some tokens may not have logos available
3. Cross-chain swaps may take several minutes
4. Not all CoinGecko tokens are swappable (depends on LiFi support)

### Recommended Test Environment
- **Testnets**: Use Sepolia (ETH), Mumbai (Polygon), etc. for testing
- **Tokens**: Faucet tokens for testing without real funds
- **Wallets**: Use dedicated test wallets, not production wallets

---

**Last Updated**: October 12, 2025

