<script setup>
import { ref, computed, watch, onBeforeMount, onBeforeUnmount } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useLoadingStore } from "@/stores/loading";
import { chainNames, chainTokens, chainUSDTs } from "@/chains";

const selectedTab = ref("");
const auth = useAuthStore();
const loader = useLoadingStore();
const output = ref("");
const input = ref("");
const addChainInput = ref({
  chainId: "",
  chainName: "",
  nativeCurrency: {
    symbol: "",
    decimals: 18,
  },
  rpcUrl: "",
  blockExplorerUrl: "",
  iconUrl: "",
});
const addTokenInput = ref({
  contract: "",
  symbol: "",
  decimals: 18,
  image: "",
});
const messageToSign = ref("");
const dataToSign = ref({
  types: "",
  domain: "",
  primaryType: "",
  message: "",
});
const from = ref("");
const sendTxInput = ref({
  to: "",
  value: "",
  data: "",
});
const walletChain = ref("");
const displayTokens = computed(() => {
  return chainTokens[Number(walletChain.value)];
});
const currentAccountType = ref("");
const chainUSDT = computed(() => {
  return chainUSDTs[Number(walletChain.value)];
});
const accountType = ref("");

onBeforeMount(async () => {
  const addrInterval = setInterval(() => {
    loader.showLoader("Loading your wallet. Please wait...");
    auth.provider
      .request({
        method: "eth_requestAccounts",
      })
      .then(async (accounts) => {
        from.value = accounts[0];
        const chainId = await auth.provider.request({
          method: "eth_chainId",
        });
        walletChain.value = chainId;
        auth.provider.on("chainChanged", (chainId) => {
          walletChain.value = chainId;
        });
        if (from.value) {
          clearInterval(addrInterval);
          loader.hideLoader();
        }
      });
    auth.provider
      .request({
        method: "_arcana_getAccountType",
      })
      .then((accountType) => {
        currentAccountType = accountType;
      });
  }, 1000);
});

onBeforeUnmount(() => {
  auth.provider.removeAllListeners();
});

watch(selectedTab, () => {
  output.value = "";
  input.value = "";
  addChainInput.value = {
    chainId: "",
    chainName: "",
    nativeCurrency: {
      symbol: "",
      decimals: 18,
    },
    rpcUrl: "",
    blockExplorerUrl: "",
    iconUrl: "",
  };
  addTokenInput.value = {
    contract: "",
    symbol: "",
    decimals: 18,
    image: "",
  };
  messageToSign.value = "";
  sendTxInput.value = {
    to: "",
    value: "",
    data: "",
  };
  dataToSign.value = {
    types: "",
    domain: "",
    primaryType: "",
    message: "",
  };
});

const hasInput = computed(() => {
  return (
    selectedTab.value === "addChain" ||
    selectedTab.value === "switchChain" ||
    selectedTab.value === "addToken" ||
    selectedTab.value === "signMessage" ||
    selectedTab.value === "signTypedData" ||
    selectedTab.value === "sendTransaction" ||
    selectedTab.value === "switchAccountType"
  );
});

async function handleRequestAccounts() {
  setTimeout(async () => {
    input.value = { method: "eth_requestAccounts" };
    output.value = await auth.provider.request({
      method: "eth_requestAccounts",
    });
  }, 10);
}

async function handleGetAccountType() {
  setTimeout(async () => {
    input.value = { method: "_arcana_getAccountType" };
    output.value = await auth.provider.request({
      method: "_arcana_getAccountType",
    });
  }, 10);
}

async function handleSwitchAccountType() {
  input.value = {
    method: "_arcana_switchAccountType",
    params: {
      type: accountType.value,
    },
  };
  try {
    output.value = await auth.provider.request({
      method: "_arcana_switchAccountType",
      params: {
        type: accountType.value,
      },
    });
  } catch (error) {
    console.error(error);
    output.value = error;
  }
}

async function handleShowWallet() {
  await auth.authProvider.showWallet();
}

async function loadSiweMessage() {
  messageToSign.value = `localhost wants you to sign in with your Ethereum account:
${from.value}

This is a test statement.

URI: https://localhost/login
Version: 1
Chain ID: 1
Nonce: ${Math.random().toString(16).substring(2, 10)}
Issued At: ${new Date().toISOString()}`;
}

async function loadRandomMessage() {
  messageToSign.value = `${Math.random()
    .toString(36)
    .substring(2)} ${Math.random().toString(36).substring(2)} ${Math.random()
    .toString(36)
    .substring(2)}`;
}

async function loadSendUSDT() {
  // Send 1 USDT to the current user
  sendTxInput.value = {
    to: chainUSDT.value,
    data:
      "0xa9059cbb000000000000000000000000" +
      from.value.substring(2) +
      "00000000000000000000000000000000000000000000000000000000000f4240",
  };
}

async function loadSendETH() {
  // Send 0.0001 ETH to user
  sendTxInput.value = {
    to: from.value,
    value: "0xe8d4a51000",
    data: "",
  };
}

async function addChain() {
  const param = {
    chainId: addChainInput.value.chainId,
    chainName: addChainInput.value.chainName,
    rpcUrls: [addChainInput.value.rpcUrl],
    nativeCurrency: {
      symbol: addChainInput.value.nativeCurrency.symbol,
      decimals: addChainInput.value.nativeCurrency.decimals,
    },
  };
  if (addChainInput.value.blockExplorerUrl) {
    param.blockExplorerUrls = [addChainInput.value.blockExplorerUrl];
  }
  if (addChainInput.value.iconUrl) {
    param.iconUrls = [addChainInput.value.iconUrl];
  }
  input.value = {
    method: "wallet_addEthereumChain",
    params: [param],
  };
  try {
    output.value = await auth.provider.request({
      method: "wallet_addEthereumChain",
      params: [param],
    });
  } catch (error) {
    console.error(error);
    output.value = error;
  }
}

async function switchChain() {
  input.value = {
    method: "wallet_switchEthereumChain",
    params: [
      {
        chainId: addChainInput.value.chainId,
      },
    ],
  };
  try {
    output.value = await auth.provider.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: addChainInput.value.chainId,
        },
      ],
    });
  } catch (error) {
    console.error(error);
    output.value = error;
  }
}

watch(input, () => {
  output.value = "";
});

async function addToken() {
  input.value = {
    method: "wallet_watchAsset",
    params: {
      type: "ERC20",
      options: {
        address: addTokenInput.value.contract,
        symbol: addTokenInput.value.symbol,
        decimals: addTokenInput.value.decimals,
        image: addTokenInput.value.image,
      },
    },
  };
  try {
    output.value = await auth.provider.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: addTokenInput.value.contract,
          symbol: addTokenInput.value.symbol,
          decimals: addTokenInput.value.decimals,
          image: addTokenInput.value.image,
        },
      },
    });
  } catch (error) {
    console.error(error);
    output.value = error;
  }
}

async function signMessage() {
  input.value = {
    method: "personal_sign",
    params: [messageToSign.value, from.value],
  };
  try {
    output.value = await auth.provider.request({
      method: "personal_sign",
      params: [messageToSign.value, from.value],
    });
  } catch (error) {
    console.error(error);
    output.value = error;
  }
}

function loadTypedData() {
  dataToSign.value = {
    types: `{
  "EIP712Domain": [
    {
      "name": "name",
      "type": "string"
    },
    {
      "name": "version",
      "type": "string"
    },
    {
      "name": "chainId",
      "type": "uint256"
    },
    {
      "name": "verifyingContract",
      "type": "address"
    }
  ],
  "Person": [
    {
      "name": "name",
      "type": "string"
    },
    {
      "name": "wallet",
      "type": "address"
    }
  ],
  "Mail": [
    {
      "name": "from",
      "type": "Person"
    },
    {
      "name": "to",
      "type": "Person"
    },
    {
      "name": "contents",
      "type": "string"
    }
  ]
}`,
    primaryType: "Mail",
    domain: `{
  "name": "Ether Mail",
  "version": "1",
  "chainId": 1,
  "verifyingContract": "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"
}`,
    message: `{
  "from": {
    "name": "Cow",
    "wallet": "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826"
  },
  "to": {
    "name": "Bob",
    "wallet": "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"
  },
  "contents": "Hello, Bob!"
}`,
  };
}

async function signTypedData() {
  input.value = {
    method: "eth_signTypedData_v4",
    params: [
      from.value,
      {
        types: JSON.parse(dataToSign.value.types),
        domain: JSON.parse(dataToSign.value.domain),
        primaryType: dataToSign.value.primaryType,
        message: JSON.parse(dataToSign.value.message),
      },
    ],
  };
  try {
    output.value = await auth.provider.request({
      method: "eth_signTypedData_v4",
      params: [
        from.value,
        JSON.stringify({
          types: JSON.parse(dataToSign.value.types),
          domain: JSON.parse(dataToSign.value.domain),
          primaryType: dataToSign.value.primaryType,
          message: JSON.parse(dataToSign.value.message),
        }),
      ],
    });
  } catch (error) {
    console.error(error);
    output.value = error;
  }
}

async function sendTransaction() {
  const param = {
    from: from.value,
    to: sendTxInput.value.to,
  };

  if (sendTxInput.value.value) {
    param.value = sendTxInput.value.value;
  }
  if (sendTxInput.value.data) {
    param.data = sendTxInput.value.data;
  }
  input.value = {
    method: "eth_sendTransaction",
    params: [param],
  };
  try {
    output.value = await auth.provider.request({
      method: "eth_sendTransaction",
      params: [param],
    });
  } catch (error) {
    console.error(error);
    output.value = error;
  }
}

function loadChain(chain) {
  switch (chain) {
    case "gnosis":
      addChainInput.value = {
        chainId: "0x64",
        chainName: "Gnosis",
        nativeCurrency: {
          symbol: "GNO",
          decimals: 18,
        },
        rpcUrl: "https://gnosis.publicnode.com",
        blockExplorerUrl: "https://gnosisscan.io",
        iconUrl: "https://icons.llamao.fi/icons/chains/rsz_xdai.jpg",
      };
      break;
    case "mantle":
      addChainInput.value = {
        chainId: "0x1388",
        chainName: "Mantle",
        nativeCurrency: {
          symbol: "MNT",
          decimals: 18,
        },
        rpcUrl: "https://rpc.mantle.xyz",
        blockExplorerUrl: "https://explorer.mantle.xyz",
        iconUrl: "https://icons.llamao.fi/icons/chains/rsz_mantle.jpg",
      };
      break;
    case "celo":
      addChainInput.value = {
        chainId: "0xa4ec",
        chainName: "Celo Mainnet",
        nativeCurrency: {
          symbol: "CELO",
          decimals: 18,
        },
        rpcUrl: "https://1rpc.io/celo",
        blockExplorerUrl: "https://celoscan.io",
        iconUrl: "https://icons.llamao.fi/icons/chains/rsz_celo.jpg",
      };
      break;
    case "cronos":
      addChainInput.value = {
        chainId: "0x19",
        chainName: "Cronos Mainnet",
        nativeCurrency: {
          symbol: "CRON",
          decimals: 18,
        },
        rpcUrl: "https://cronos-evm.publicnode.com",
        blockExplorerUrl: "https://cronoscan.com",
        iconUrl: "https://icons.llamao.fi/icons/chains/rsz_cronos.jpg",
      };
      break;
    default:
      break;
  }
}

function populateToken(token) {
  addTokenInput.value = {
    contract: token.contractAddress,
    symbol: token.symbol,
    decimals: token.decimals,
    image: token.image,
  };
}
</script>

<template>
  <div>
    <div class="hide" :class="{ show: !!from }">
      <span>Loaded the account: {{ from }}</span>
      <br />
      <span
        >Currently selected chain: {{ walletChain }}
        <span v-if="chainNames[Number(walletChain)]"
          >({{ chainNames[Number(walletChain)] }})</span
        ></span
      >
      <br />
      <span
        >Account Type:
        <span v-if="currentAccountType === 'scw'"
          >SCW (Smart Contract Wallet). Using this wallet you can perform
          gasless transactions.<br />
          <span
            ><strong>Note:</strong> If you are using a sample app from the
            presets then you will be charged gas fees from your SCW since the
            gas tank for preset apps is empty and is not sponsored by the
            developers.</span
          ></span
        >
        <span v-else>EOA (Externally Owned Address).</span></span
      >
    </div>
    <div class="mt-1" style="display: flex; flex-wrap: wrap">
      <button
        class="tab"
        :class="{ selected: selectedTab === 'requestAccounts' }"
        @click.stop="
          selectedTab = 'requestAccounts';
          handleRequestAccounts();
        "
        :disabled="!from"
      >
        Request Accounts
      </button>
      <button
        class="tab"
        :class="{ selected: selectedTab === 'showWallet' }"
        @click.stop="
          selectedTab = 'showWallet';
          handleShowWallet();
        "
        :disabled="!from"
      >
        Show Wallet
      </button>
      <button
        class="tab"
        :class="{ selected: selectedTab === 'addChain' }"
        @click.stop="selectedTab = 'addChain'"
        :disabled="!from"
      >
        Add Chain
      </button>
      <button
        class="tab"
        :class="{ selected: selectedTab === 'switchChain' }"
        @click.stop="selectedTab = 'switchChain'"
        :disabled="!from"
      >
        Switch Chain
      </button>
      <button
        class="tab"
        :class="{ selected: selectedTab === 'addToken' }"
        @click.stop="selectedTab = 'addToken'"
        :disabled="!from"
      >
        Add Token
      </button>
      <button
        class="tab"
        :class="{ selected: selectedTab === 'signMessage' }"
        @click.stop="selectedTab = 'signMessage'"
        :disabled="!from"
      >
        Sign Message
      </button>
      <button
        class="tab"
        :class="{ selected: selectedTab === 'sendTransaction' }"
        @click.stop="selectedTab = 'sendTransaction'"
        :disabled="!from"
      >
        Send Transaction
      </button>
      <button
        class="tab"
        :class="{ selected: selectedTab === 'signTypedData' }"
        @click.stop="selectedTab = 'signTypedData'"
        :disabled="!from"
      >
        Sign Typed Data
      </button>
      <button
        class="tab"
        :class="{ selected: selectedTab === 'getAccountType' }"
        @click.stop="
          selectedTab = 'getAccountType';
          handleGetAccountType();
        "
        :disabled="!from"
      >
        Get Account Type
      </button>
      <button
        class="tab"
        :class="{ selected: selectedTab === 'switchAccountType' }"
        @click.stop="selectedTab = 'switchAccountType'"
        :disabled="!from"
      >
        Switch Account Type
      </button>
    </div>
    <div class="input mt-1" v-if="hasInput">
      <h4 style="font-weight: 600">Input</h4>
      <div v-if="selectedTab === 'addChain'">
        <h4>Load Input from presets</h4>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap">
          <button @click.stop="loadChain('celo')">Load Celo Mainnet</button>
          <button @click.stop="loadChain('cronos')">Load Cronos Mainnet</button>
          <button @click.stop="loadChain('gnosis')">Load Gnosis</button>
          <button @click.stop="loadChain('mantle')">Load Mantle</button>
        </div>
      </div>
      <div v-if="selectedTab === 'switchChain'">
        <h4>Load Input from presets</h4>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap">
          <button @click.stop="addChainInput.chainId = '0x1'">
            Load Ethereum Mainnet
          </button>
          <button @click.stop="addChainInput.chainId = '0x89'">
            Load Polygon Mainnet
          </button>
          <button @click.stop="addChainInput.chainId = '0x38'">
            Load BNB Smart Chain
          </button>
          <button @click.stop="addChainInput.chainId = '0xa4b1'">
            Load Arbitrum One
          </button>
          <button @click.stop="addChainInput.chainId = '0xa'">
            Load OP Mainnet
          </button>
        </div>
      </div>
      <div v-if="selectedTab === 'addToken'">
        <h4>Load Input from presets:</h4>
        <div
          v-if="displayTokens?.length"
          style="display: flex; gap: 1rem; flex-wrap: wrap"
        >
          <button
            v-for="displayToken in displayTokens"
            @click.stop="populateToken(displayToken)"
          >
            {{ displayToken.name }}
          </button>
        </div>
        <div v-else>
          <span
            >No presets available for this chain. Please switch the chain to 0x1
            (Ethereum Mainnet), 0x89 (Polygon Mainnet), 0x38 (BNB Smart Chain
            Mainnet) or 0xa4b1 (Arbitrum One) to get presets</span
          >
        </div>
      </div>
      <div v-if="selectedTab === 'signMessage'">
        <h4>Load Input from presets</h4>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap">
          <button @click.stop="loadSiweMessage">Load SIWE Message</button>
          <button @click.stop="loadRandomMessage">Load Random Message</button>
        </div>
      </div>
      <div v-if="selectedTab === 'signTypedData'">
        <h4>Load Input from presets</h4>
        <div
          v-if="Number(walletChain) === 1"
          style="display: flex; gap: 1rem; flex-wrap: wrap"
        >
          <button @click.stop="loadTypedData">Load Sample Typed Data</button>
        </div>
        <div v-else>
          <span
            >No presets available for this chain. Please switch the chain to 0x1
            (Ethereum Mainnet) to get presets</span
          >
        </div>
      </div>
      <div v-if="selectedTab === 'sendTransaction'">
        <h4>Load Input from presets</h4>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap">
          <button @click.stop="loadSendETH">
            Load 0.000001 Native Token Transfer
          </button>
          <button v-if="chainUSDT" @click.stop="loadSendUSDT">
            Load 1 USDT Transfer
          </button>
          <span v-else>
            No USDT contract address available for this chain. Please switch the
            chain to 0x1 (Ethereum Mainnet), 0x89 (Polygon Mainnet), 0x38 (BNB
            Smart Chain Mainnet), 0xa4b1 (Arbitrum One) or 0xa (OP Mainnet) to
            get the USDT preset
          </span>
        </div>
      </div>
      <form
        v-if="selectedTab === 'addChain'"
        class="mt-1"
        style="display: flex; flex-direction: column; gap: 1rem"
        @submit.prevent="addChain"
      >
        <div style="display: flex; gap: 1rem">
          <div class="form-group">
            <label for="chain-id">Chain ID</label>
            <input id="chain-id" v-model="addChainInput.chainId" />
          </div>
          <div class="form-group">
            <label for="chain-name">Name</label>
            <input id="chain-name" v-model="addChainInput.chainName" />
          </div>
          <div class="form-group">
            <label for="chain-rpc">RPC Url</label>
            <input id="chain-rpc" v-model="addChainInput.rpcUrl" />
          </div>
        </div>
        <div style="display: flex; gap: 1rem; align-items: center">
          <div class="form-group">
            <label for="chain-symbol">Currency Symbol</label>
            <input
              id="chain-symbol"
              v-model="addChainInput.nativeCurrency.symbol"
            />
          </div>
          <div class="form-group">
            <label for="chain-decimals">Currency Decimals</label>
            <input
              id="chain-decimals"
              v-model="addChainInput.nativeCurrency.decimals"
              type="number"
            />
          </div>
        </div>
        <div style="display: flex; gap: 1rem">
          <div class="form-group">
            <label for="chain-exp">Explorer Url (Optional)</label>
            <input id="chain-exp" v-model="addChainInput.blockExplorerUrl" />
          </div>
          <div class="form-group">
            <label for="chain-icon">Chain Icon (Optional)</label>
            <input id="chain-icon" v-model="addChainInput.iconUrl" />
          </div>
        </div>
        <div style="display: flex; gap: 1rem">
          <button>Add Chain</button>
          <button type="reset" @click.stop="(input = ''), (output = '')">
            Reset
          </button>
        </div>
      </form>
      <form
        v-if="selectedTab === 'switchChain'"
        class="mt-1"
        style="display: flex; flex-direction: column; gap: 1rem"
        @submit.prevent="switchChain"
      >
        <div class="form-group">
          <label for="chain-id">Chain ID</label>
          <input id="chain-id" v-model="addChainInput.chainId" />
        </div>
        <div style="display: flex; gap: 1rem">
          <button>Switch Chain</button>
          <button type="reset" @click.stop="(input = ''), (output = '')">
            Reset
          </button>
        </div>
      </form>
      <div class="mt-1" v-if="selectedTab === 'addToken'">
        Add ERC20 details
      </div>
      <form
        v-if="selectedTab === 'addToken'"
        style="display: flex; flex-direction: column; gap: 1rem"
        @submit.prevent="addToken"
      >
        <div class="form-group">
          <label for="contract">Contract Address</label>
          <input id="contract" v-model="addTokenInput.contract" />
        </div>
        <div style="display: flex; align-items: center; gap: 1rem">
          <div class="form-group">
            <label for="symbol">Symbol</label>
            <input id="symbol" v-model="addTokenInput.symbol" />
          </div>
          <div class="form-group">
            <label for="decimals">Decimals</label>
            <input id="decimals" v-model="addTokenInput.decimals" />
          </div>
          <div class="form-group">
            <label for="image">Image (Optional)</label>
            <input id="image" v-model="addTokenInput.image" />
          </div>
        </div>
        <div style="display: flex; gap: 1rem">
          <button>Add Token</button>
          <button type="reset" @click.stop="(input = ''), (output = '')">
            Reset
          </button>
        </div>
      </form>
      <form
        v-if="selectedTab === 'signMessage'"
        class="mt-1"
        style="display: flex; flex-direction: column; gap: 1rem"
        @submit.prevent="signMessage"
      >
        <div class="form-group">
          <label for="message">Enter message to sign</label>
          <textarea id="message" v-model="messageToSign" rows="10"></textarea>
        </div>
        <div style="display: flex; gap: 1rem">
          <button>Sign Message</button>
          <button type="reset" @click.stop="(input = ''), (output = '')">
            Reset
          </button>
        </div>
      </form>
      <form
        v-if="selectedTab === 'signTypedData'"
        class="mt-1"
        style="display: flex; flex-direction: column; gap: 1rem"
        @submit.prevent="signTypedData"
      >
        <div class="form-group">
          <label for="signing-acc">Signing Account</label>
          <input id="signing-acc" disabled :value="from" />
        </div>
        <div class="form-group">
          <label for="types">Types (Must be an object)</label>
          <textarea id="types" v-model="dataToSign.types" rows="6"></textarea>
        </div>
        <div class="form-group">
          <label for="domain">Domain (Must be an object)</label>
          <textarea id="domain" v-model="dataToSign.domain" rows="6"></textarea>
        </div>
        <div class="form-group">
          <label for="primary-type">Primary Type (String)</label>
          <input id="primary-type" :value="dataToSign.primaryType" />
        </div>
        <div class="form-group">
          <label for="domain">Message (Must be an object)</label>
          <textarea
            id="domain"
            v-model="dataToSign.message"
            rows="6"
          ></textarea>
        </div>
        <div style="display: flex; gap: 1rem">
          <button>Sign Typed Data</button>
          <button type="reset" @click.stop="(input = ''), (output = '')">
            Reset
          </button>
        </div>
      </form>
      <form
        v-if="selectedTab === 'sendTransaction'"
        class="mt-1"
        style="display: flex; flex-direction: column; gap: 1rem"
        @submit.prevent="sendTransaction"
      >
        <div class="form-group">
          <label for="to">Recipient Address (To)</label>
          <input id="to" v-model="sendTxInput.to" />
        </div>
        <div class="form-group">
          <label for="val">Amount (Value)</label>
          <input id="val" v-model="sendTxInput.value" />
        </div>
        <div class="form-group">
          <label for="data"
            >Data (Optional - Only used for Contract Deployment or Contract
            Interaction)</label
          >
          <textarea id="data" v-model="sendTxInput.data" rows="10"></textarea>
        </div>
        <div style="display: flex; gap: 1rem">
          <button>Send Transaction</button>
          <button type="reset" @click.stop="(input = ''), (output = '')">
            Reset
          </button>
        </div>
      </form>
      <form
        v-if="selectedTab === 'switchAccountType'"
        class="mt-1"
        style="display: flex; flex-direction: column; gap: 1rem"
        @submit.prevent="handleSwitchAccountType"
      >
        <div class="form-group">
          <label for="account-type">Account Type: </label>
          <select
            id="account-type"
            placeholder="Select Account Type"
            v-model="accountType"
          >
            <option value="scw">SCW (Smart Contract Wallet)</option>
            <option value="eoa">EOA (Externally Owned Address)</option>
          </select>
        </div>
        <div style="display: flex; gap: 1rem">
          <button>Switch Account Type</button>
          <button type="reset" @click.stop="(input = ''), (output = '')">
            Reset
          </button>
        </div>
      </form>
    </div>
    <div class="output mt-1" v-if="input">
      <div>
        <h4 style="font-weight: 600">Request Sent</h4>
        <pre>{{ input }}</pre>
      </div>
      <div>
        <h4 style="font-weight: 600">Response Received</h4>
        <pre v-if="output">{{ output }}</pre>
      </div>
    </div>
  </div>
</template>
