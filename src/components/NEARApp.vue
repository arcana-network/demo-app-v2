<script setup>
import { useAuthStore } from "@/stores/auth";
import base58 from "bs58";
import { ref, watch } from "vue";

const auth = useAuthStore();
const output = ref();
const input = ref();

async function getAccounts() {
  const request = {
    method: "getAccounts",
  };
  input.value = request;
  const accounts = await auth.provider.request(request);
  output.value = accounts;
}

async function signMessage() {
  const message = base58.encode(Buffer.from("Hello, World!"));
  const request = {
    method: "near_signMessage",
    params: { message },
  };
  input.value = request;
  const signedMessage = await auth.provider.request(request);
  output.value = signedMessage;
}

async function signAndSendTransaction() {
  const transaction = {
    receiverId:
      "54eaa199c250f7e95e91ad2e37c564da7326436f949966107a98884f5fd51c95",
    actions: [
      {
        transfer: {
          deposit: BigInt(1000),
        },
      },
      {
        transfer: {
          deposit: BigInt(1000),
        },
      },
      {
        transfer: {
          deposit: BigInt(1000),
        },
      },
    ],
  };
  const request = {
    method: "near_signAndSendTransaction",
    params: { transaction },
  };
  const displayableTransferActions = transaction.actions.map((action) => {
    if (action.transfer) {
      return {
        transfer: {
          deposit: action.transfer.deposit.toString(),
        },
      };
    }
    return action;
  });
  const displayableRequest = {
    method: request.method,
    params: {
      transaction: {
        receiverId: transaction.receiverId,
        actions: displayableTransferActions,
      },
    },
  };
  input.value = displayableRequest;
  const signedTransaction = await auth.provider.request(request);
  output.value = signedTransaction;
}

watch(input, () => {
  output.value = "";
});
</script>

<template>
  <div>
    <div style="display: flex; gap: 1rem; flex-wrap: wrap">
      <button @click.stop="getAccounts">Get Accounts</button>
      <button @click.stop="signMessage">Sign Message</button>
      <button @click.stop="signAndSendTransaction">
        Sign And Send Transaction
      </button>
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
