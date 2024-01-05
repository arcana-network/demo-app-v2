<script setup>
import { ref, computed, watch, onBeforeMount } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useLoadingStore } from "@/stores/loading";

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
const from = ref("");
const sendTxInput = ref({
  to: "",
  value: "",
  data: "",
});

onBeforeMount(async () => {
  const addrInterval = setInterval(() => {
    loader.showLoader("Loading your wallet. Please wait...");
    auth.provider
      .request({
        method: "eth_requestAccounts",
      })
      .then((accounts) => {
        from.value = accounts[0];
        if (from.value) {
          clearInterval(addrInterval);
          loader.hideLoader();
        }
      });
  }, 1000);
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
});

const hasInput = computed(() => {
  return (
    selectedTab.value === "addChain" ||
    selectedTab.value === "switchChain" ||
    selectedTab.value === "addToken" ||
    selectedTab.value === "signMessage" ||
    selectedTab.value === "signTypedMessage" ||
    selectedTab.value === "sendTransaction"
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

async function handleShowWallet() {
  await auth.authProvider.showWallet();
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
</script>

<template>
  <div>
    <div class="hide" :class="{ show: !!from }">
      <span>Loaded the account: {{ from }}</span>
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
          <button @click.stop="addChainInput.chainId = '0x13881'">
            Load Polygon Mumbai
          </button>
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
          <button type="reset">Reset</button>
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
          <button type="reset">Reset</button>
        </div>
      </form>
      <div v-if="selectedTab === 'addToken'">Add ERC20 details</div>
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
          <button type="reset">Reset</button>
        </div>
      </form>
      <form
        v-if="selectedTab === 'signMessage'"
        style="display: flex; flex-direction: column; gap: 1rem"
        @submit.prevent="signMessage"
      >
        <div class="form-group">
          <label for="message">Enter message to sign</label>
          <textarea id="message" v-model="messageToSign" rows="10"></textarea>
        </div>
        <div style="display: flex; gap: 1rem">
          <button>Sign Message</button>
          <button type="reset">Reset</button>
        </div>
      </form>
      <form
        v-if="selectedTab === 'sendTransaction'"
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
          <button type="reset">Reset</button>
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
