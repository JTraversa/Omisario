# Omisario


 A basic integration between the OmiseGo network and Super Mario NES
 
https://omisario.whsieh2.now.sh/

-------------------------------------------------
The backend payments for this demonstration are run on the Ropsten Ethereum testnet.

Mainnet connection will not affect payments or game performance, however all payments are accessable only through the Ropsten testnet & OmiseGo testnet.

Note: The Live deployment has had graphical issues with displaying pBTC. We advise a local build to verify it functions correctly.

--------------------------------------------------

In order to run a local version of the game, ensure you have installed the required packages from the packages.json. 

You can do so using npm:

```
npm install @omisego/omg-js
npm install body-parser
npm install express
npm install web3
```

After dependencies have been installed, using a command prompt navigate to the directory and execute: 

```
node index.js
``` 

You can then access the game in any browser by navigating to:

http://localhost:9001/

You can access the live version by navigating to:

https://omisario.whsieh2.now.sh/

--------------------------------------------------

Limitations:

Only one user can start a session per childchain block (we use one seed wallet).

The testnet seems to have unreliable blocktimes (15-60s), this on occasion causes utxo build errors.

Notes:

Our live deployment has the following bugs currently:

1. A visual bug that fails to properly display pBTC balances

That said, if you have node already installed, we recommend the local build which does not have these issues.

--------------------------------------------------

Disclaimer: This game is not intended for distribution. All rights to Super Mario NES belong to Nintendo. Omisario is only a demonstration of OmiseGo, Portis, and pToken integration.

--------------------------------------------------
<img src="https://nescience.io/wp-content/uploads/2020/05/OmisarioLogo.jpg" width="500" height="640">

