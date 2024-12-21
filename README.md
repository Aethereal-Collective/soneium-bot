# SONEIUM & SAKE FINANCE BOT
ALL IN ONE BOT FOR SONEIUM CHAIN, All you have to do is to configure RPC API KEY in config.js and Private key in accounts.js the bot and run it.

# Join US
- [Discord](https://discord.gg/aethereal)
- [X](https://x.com/aethereal_co)

## Prerequisite
- Git
- Node JS (v22)
- Sepolia Faucet https://testnetbridge.com/sepolia
- RPC Private (Alchemy) https://alchemy.com

## BOT FEATURE
- Multi Account 
- Auto Bridge (Using Official Bridge)
- Deploy Smart Contract
- Auto [Sake Finance](https://x.com/sakefinance) (Incentive)
- Auto Transaction Using [Sonifi V2](https://x.com/SoneFi_xyz) (Incentive)


## Setup & Configure BOT
You can use screen to run the bot, so you can disconnect the bot and reconnect it later.
```
screen -S soneium
```

To reconnect the bot, you can use this command:
```
screen -r soneium
```

### Linux
1. Clone project repo
   ```
   git clone https://github.com/Aethereal-Collective/soneium-bot.git && cd soneium-bot
   ```
2. Run
   ```
   npm install
   ```
4. Configure your accounts
   ```
   nano accounts/accounts.js
   ```
5. Configure the bot config
    ```
   nano config/config.js
    ```
6. Run Menu
   ```
   npm run soneium
   ```
7. Run NFT
   ```
   npm run nft
   ```

## Troubleshoot
insufficient GAS / insufficient Balance = You don't have enough ETH . Please bridge 0.05 Minimum with 0.1 ETH Sepolia (Minimum in your wallet)
