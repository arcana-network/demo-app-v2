<script setup>
import { useAuthStore } from "@/stores/auth";
import { useLoadingStore } from "@/stores/loading";
import base58 from "bs58";
import { ref, watch, defineAsyncComponent, computed, onBeforeMount } from "vue";

const InputOutputModule = defineAsyncComponent(() =>
  import("@/components/InputOutputModule.vue")
);

const auth = useAuthStore();
const output = ref("");
const input = ref("");
const currentAccount = ref("");
const loader = useLoadingStore();
const selectedTab = ref("");
const messageToSign = ref("");
const hasInput = computed(() => {
  return ["signMessage"].includes(selectedTab.value);
});

watch(input, () => {
  output.value = "";
});

watch(selectedTab, () => {
  if (["getAccounts", "signAndSendTransaction"].includes(selectedTab.value)) {
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
  const request = {
    method: "getAccounts",
  };
  const accounts = await auth.provider.request(request);
  output.value = accounts;
}

async function handleSignMessage() {
  input.value = `import base58 from "bs58";
  
const message = base58.encode(Buffer.from("${messageToSign.value}");

const signedMessage = await auth.provider.request({
  method: "near_signMessage",
  params: { message },
});

console.log(signedMessage);`;
  const message = base58.encode(Buffer.from(messageToSign.value));
  const request = {
    method: "near_signMessage",
    params: { message },
  };
  try {
    const signedMessage = await auth.provider.request(request);
    output.value = signedMessage;
  } catch (e) {
    console.error(e);
    output.value = e.message;
  }
}

async function handleSignAndSendTransaction() {
  input.value = `const accounts = await auth.provider.request({
  method: "getAccounts",
});

const transaction = {
  receiverId: accounts[0],
  actions: [
    {
      transfer: {
        deposit: BigInt(1000000000000000000),
      },
    },
    {
      transfer: {
        deposit: BigInt(1000000000000000000),
      },
    },
    {
      transfer: {
        deposit: BigInt(1000000000000000000),
      },
    },
  ],
}

const signedTransaction = await auth.provider.request({
  method: "near_signAndSendTransaction",
  params: { transaction },
});

console.log(signedTransaction);`;
  const transaction = {
    receiverId: currentAccount.value,
    actions: [
      {
        transfer: {
          deposit: BigInt(1000000000000000000),
        },
      },
      {
        transfer: {
          deposit: BigInt(1000000000000000000),
        },
      },
      {
        transfer: {
          deposit: BigInt(1000000000000000000),
        },
      },
    ],
  };
  const request = {
    method: "near_signAndSendTransaction",
    params: { transaction },
  };
  try {
    const signedTransaction = await auth.provider.request(request);
    output.value = signedTransaction;
  } catch (e) {
    console.error(e);
    output.value = e.message;
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
      <span><strong>Network: </strong> Near (Testnet)</span>
      <br />
      <span><strong>Account: </strong>{{ currentAccount }}</span>
    </div>
    <div div class="mt-1" style="display: flex; flex-wrap: wrap">
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
        :class="{ selected: selectedTab === 'signMessage' }"
        @click.stop="selectedTab = 'signMessage'"
        :disabled="!currentAccount"
      >
        Sign Message
      </button>
      <button
        class="tab"
        :class="{ selected: selectedTab === 'signAndSendTransaction' }"
        @click.stop="
          selectedTab = 'signAndSendTransaction';
          handleSignAndSendTransaction();
        "
        :disabled="!currentAccount"
      >
        Sign And Send Transaction
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
