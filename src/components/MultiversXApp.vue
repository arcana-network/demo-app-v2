<script setup>
import { ref, computed, watch, onBeforeMount, defineAsyncComponent } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useLoadingStore } from "@/stores/loading";

const InputOutputModule = defineAsyncComponent(() =>
  import("@/components/InputOutputModule.vue")
);

const auth = useAuthStore();
const loader = useLoadingStore();
const selectedTab = ref("");
const input = ref("");
const output = ref("");
const hasInput = computed(() => {
  return ["signMessage"].includes(selectedTab.value);
});
const currentAccount = ref("");

const messageToSign = ref("");

watch(input, () => {
  output.value = "";
});

watch(selectedTab, () => {
  if (
    [
      "getAccounts",
      "getPublicKey",
      "signTransaction",
      "signTransactions",
    ].includes(selectedTab.value)
  ) {
    return;
  }
  output.value = "";
  input.value = "";
  messageToSign.value = "";
});

onBeforeMount(async () => {
  const addrInterval = setInterval(() => {
    loader.showLoader("Loading your wallet. Please wait...");
    auth.provider
      .request({
        method: "getAccounts",
      })
      .then(async (accounts) => {
        currentAccount.value = accounts[0];
        if (currentAccount.value) {
          clearInterval(addrInterval);
          loader.hideLoader();
        }
      });
  }, 1000);
});

async function handleGetAccounts() {
  input.value = `const accounts = await auth.provider.request({
    method: "getAccounts",
});

console.log(accounts);`;
  const accounts = await auth.provider.request({
    method: "getAccounts",
  });
  output.value = accounts;
}

async function handleGetPublicKey() {
  input.value = `const accounts = await auth.provider.request({
    method: "getAccounts",
});

const publicKey = await auth.provider.request({
    method: "getPublicKey",
    params: [accounts[0]],
});

console.log(publicKey);`;
  const accounts = await auth.provider.request({
    method: "getAccounts",
  });
  const publicKey = await auth.provider.request({
    method: "getPublicKey",
    params: [accounts[0]],
  });
  output.value = publicKey;
}

async function handleSignTransaction() {
  input.value = `const accounts = await auth.provider.request({
    method: "getAccounts",
});

const params = {
    transaction: {
        gasLimit: 100000,
        sender: accounts[0],
        receiver: accounts[0],
        value: "1",
        chainID: "T", // T for testnet, D for Devnet and 1 for mainnet
        data: "helloWorld",
        version: 1,
    },
};

const signature = await provider.request({
    method: "mvx_signTransaction",
    params,
});

console.log(signature)`;
  const accounts = await auth.provider.request({
    method: "getAccounts",
  });
  const params = {
    transaction: {
      gasLimit: 100000,
      sender: accounts[0],
      receiver: accounts[0],
      value: "1",
      chainID: "T",
      data: "helloWorld",
      version: 1,
    },
  };
  try {
    const signature = await auth.provider.request({
      method: "mvx_signTransaction",
      params,
    });
    output.value = signature;
  } catch (e) {
    console.error(e);
    output.value = e;
  }
}

async function handleSignTransactions() {
  input.value = `const accounts = await auth.provider.request({
    method: "getAccounts",
});

const params = {
    transactions: [
        {
            gasLimit: 100000,
            sender: accounts[0],
            receiver: accounts[0],
            value: "1",
            chainID: "T", // T for testnet, D for Devnet and 1 for mainnet
            data: "helloWorld",
            version: 1,
        },
        {
            gasLimit: 100000,
            sender: accounts[0],
            receiver: accounts[0],
            value: "2",
            chainID: "T", // T for testnet, D for Devnet and 1 for mainnet
            data: "helloWorld2",
            version: 1,
        },
    ],
};

const signatures = await provider.request({
    method: "mvx_signTransactions",
    params,
});

console.log(signatures)`;
  const accounts = await auth.provider.request({
    method: "getAccounts",
  });
  const params = {
    transactions: [
      {
        gasLimit: 100000,
        sender: accounts[0],
        receiver: accounts[0],
        value: "1",
        chainID: "T",
        data: "helloWorld",
        version: 1,
      },
      {
        gasLimit: 100000,
        sender: accounts[0],
        receiver: accounts[0],
        value: "2",
        chainID: "T",
        data: "helloWorld2",
        version: 1,
      },
    ],
  };
  try {
    const signatures = await auth.provider.request({
      method: "mvx_signTransactions",
      params,
    });
    output.value = signatures;
  } catch (e) {
    console.error(e);
    output.value = e;
  }
}

async function handleSignMessage() {
  const message = messageToSign.value;
  const request = {
    method: "mvx_signMessage",
    params: { message },
  };
  input.value = `const request = {
    method: "mvx_signMessage",
    params: { message: "${message}" },
};

const signature = await auth.provider.request(request);

console.log(signature);`;
  try {
    const signature = await auth.provider.request(request);
    output.value = signature;
  } catch (e) {
    console.error(e);
    output.value = e;
  }
}
</script>

<template>
  <div>
    <div
      class="hide"
      :class="{ show: !!currentAccount }"
      style="font-size: 14px"
    >
      <span><strong>Network: </strong> MultiversX (Testnet)</span>
      <br />
      <span><strong>Account: </strong>{{ currentAccount }}</span>
    </div>
    <div class="mt-1" style="display: flex; flex-wrap: wrap">
      <button
        class="tab"
        :class="{ selected: selectedTab === 'getAccounts' }"
        @click.stop="
          selectedTab = 'getAccounts';
          handleGetAccounts();
        "
        :disabled="!currentAccount"
      >
        Get Accounts
      </button>
      <button
        class="tab"
        :class="{ selected: selectedTab === 'getPublicKey' }"
        @click.stop="
          selectedTab = 'getPublicKey';
          handleGetPublicKey();
        "
        :disabled="!currentAccount"
      >
        Get Public Key
      </button>
      <button
        class="tab"
        :class="{ selected: selectedTab === 'signMessage' }"
        @click.stop="selectedTab = 'signMessage'"
        :disabled="!currentAccount"
      >
        Sign Message
      </button>
      <button
        class="tab"
        :class="{ selected: selectedTab === 'signTransaction' }"
        @click.stop="
          selectedTab = 'signTransaction';
          handleSignTransaction();
        "
        :disabled="!currentAccount"
      >
        Sign Transaction
      </button>
      <button
        class="tab"
        :class="{ selected: selectedTab === 'signTransactions' }"
        @click.stop="
          selectedTab = 'signTransactions';
          handleSignTransactions();
        "
        :disabled="!currentAccount"
      >
        Sign Transactions
      </button>
    </div>
    <div class="input mt-1" v-if="hasInput">
      <form
        v-if="selectedTab === 'signMessage'"
        class="mt-1"
        style="display: flex; flex-direction: column; gap: 1rem"
        @submit.prevent="handleSignMessage"
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
    </div>
    <InputOutputModule v-if="input" :input="input" :output="output" />
  </div>
</template>
