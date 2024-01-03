<script setup>
import { ref, computed, watch, onBeforeMount } from "vue";
import { useAuthStore } from "@/stores/auth";

const selectedTab = ref("");
const auth = useAuthStore();
const output = ref("");
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
  const accounts = await auth.provider.request({
    method: "eth_requestAccounts",
  });
  from.value = accounts[0];
});

watch(selectedTab, () => {
  output.value = "";
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
  output.value = await auth.provider.request({ method: "eth_requestAccounts" });
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
    params.blockExplorerUrls = [addChainInput.value.blockExplorerUrl];
  }
  if (addChainInput.value.iconUrl) {
    params.iconUrls = [addChainInput.value.iconUrl];
  }
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
  try {
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
    output.value = await auth.provider.request({
      method: "eth_sendTransaction",
      params: [param],
    });
  } catch (error) {
    console.error(error);
    output.value = error;
  }
}
</script>

<template>
  <div>
    <div style="display: flex; flex-wrap: wrap">
      <button
        class="tab"
        :class="{ selected: selectedTab === 'requestAccounts' }"
        @click.stop="
          selectedTab = 'requestAccounts';
          handleRequestAccounts();
        "
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
      >
        Show Wallet
      </button>
      <button
        class="tab"
        :class="{ selected: selectedTab === 'addChain' }"
        @click.stop="selectedTab = 'addChain'"
      >
        Add Chain
      </button>
      <button
        class="tab"
        :class="{ selected: selectedTab === 'switchChain' }"
        @click.stop="selectedTab = 'switchChain'"
      >
        Switch Chain
      </button>
      <button
        class="tab"
        :class="{ selected: selectedTab === 'addToken' }"
        @click.stop="selectedTab = 'addToken'"
      >
        Add Token
      </button>
      <button
        class="tab"
        :class="{ selected: selectedTab === 'signMessage' }"
        @click.stop="selectedTab = 'signMessage'"
      >
        Sign Message
      </button>
      <button
        class="tab"
        :class="{ selected: selectedTab === 'sendTransaction' }"
        @click.stop="selectedTab = 'sendTransaction'"
      >
        Send Transaction
      </button>
    </div>
    <div class="input mt-1" v-if="hasInput">
      <h4 style="font-weight: 600">Input</h4>
      <form
        v-if="selectedTab === 'addChain'"
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
        <div style="display: flex; gap: 1rem">
          <div class="form-group">
            <label for="chain-exp">Explorer Url</label>
            <input id="chain-exp" v-model="addChainInput.blockExplorerUrl" />
          </div>
          <div class="form-group">
            <label for="chain-icon">Chain Icon</label>
            <input id="chain-icon" v-model="addChainInput.iconUrl" />
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
          <button>Add Chain</button>
          <button type="reset">Reset</button>
        </div>
      </form>
      <form
        v-if="selectedTab === 'switchChain'"
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
      <form
        v-if="selectedTab === 'addToken'"
        style="display: flex; flex-direction: column; gap: 1rem"
        @submit.prevent="addToken"
      >
        <div>Add ERC20 details</div>
        <div class="form-group">
          <label for="contract">Contract Address</label>
          <input id="contract" v-model="addTokenInput.contract" />
        </div>
        <div class="form-group">
          <label for="symbol">Symbol</label>
          <input id="symbol" v-model="addTokenInput.symbol" />
        </div>
        <div class="form-group">
          <label for="decimals">Decimals</label>
          <input id="decimals" v-model="addTokenInput.decimals" />
        </div>
        <div class="form-group">
          <label for="image">Image</label>
          <input id="image" v-model="addTokenInput.image" />
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
    <div class="output mt-1" v-if="output">
      <h4 style="font-weight: 600">Output</h4>
      <pre
        style="overflow-x: auto; white-space: pre-wrap; word-wrap: break-word"
        >{{ output }}</pre
      >
    </div>
  </div>
</template>
