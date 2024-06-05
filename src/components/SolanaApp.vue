<script setup>
import { ref, defineAsyncComponent, watch, computed, onBeforeMount } from "vue";
import { useAuthStore } from "@/stores/auth";
import base58 from "bs58";
import {
  PublicKey,
  Connection,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
  clusterApiUrl,
} from "@solana/web3.js";
import { useLoadingStore } from "@/stores/loading";

const InputOutputModule = defineAsyncComponent(() =>
  import("@/components/InputOutputModule.vue")
);

const selectedTab = ref("");
const auth = useAuthStore();
const output = ref();
const input = ref();
const messageToSign = ref("");
const currentAccount = ref("");
const loader = useLoadingStore();

const hasInput = computed(() => {
  return ["signMessage"].includes(selectedTab.value);
});

watch(input, () => {
  output.value = "";
});

watch(selectedTab, () => {
  if (
    [
      "getAccounts",
      "getPublicKey",
      "signTransaction",
      "signAndSendTransaction",
      "signAllTransactions",
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
        params: [],
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
  params: [],
});

console.log(accounts);`;
  try {
    const request = {
      method: "getAccounts",
      params: [],
    };
    const accounts = await auth.provider.request(request);
    output.value = accounts;
  } catch (e) {
    output.value = e;
  }
}

async function handleGetPublicKey() {
  input.value = `import SolanaWeb3 from "@solana/web3.js";

const accounts = await auth.provider.request({
  method: "getAccounts",
  params: [],
});
const publicKey = new SolanaWeb3.PublicKey(accounts[0])

console.log(publicKey);`;
  try {
    const request = {
      method: "getAccounts",
      params: [],
    };
    const accounts = await auth.provider.request(request);
    const publicKey = new PublicKey(accounts[0]);
    output.value = publicKey;
  } catch (e) {
    output.value = e;
  }
}

async function handleSignMessage() {
  try {
    const encodedMessage = base58.encode(
      new TextEncoder().encode(messageToSign.value)
    );
    const request = {
      method: "signMessage",
      params: {
        message: encodedMessage,
        display: "hex",
      },
    };
    input.value = `import base58 from "bs58";

const encodedMessage = base58.encode(
  new TextEncoder().encode("${messageToSign.value}")
);

const signature = await auth.provider.request({
  method: "signMessage",
  params: {
    message: encodedMessage,
    display: "hex",
  },
});

console.log(signature);
// Use base58.decode(signature.signature) to get the signature as a Uint8Array
// Use new PublicKey(signature.publicKey) to get the PublicKey of the signer`;
    const sig = await auth.provider.request(request);
    output.value = sig;
  } catch (e) {
    output.value = e;
  }
}

async function handleSignTransaction() {
  input.value = `import { PublicKey, Connection, SystemProgram, clusterApiUrl } from "@solana/web3.js";
import base58 from "bs58";

const accounts = await auth.provider.request({
  method: "getAccounts",
  params: [],
});
const publicKey = new PublicKey(accounts[0]);

const connection = new Connection(clusterApiUrl("mainnet"));
const minimumRent = await connection.getMinimumBalanceForRentExemption(0);
const { blockhash } = await connection.getLatestBlockhash();

const instructions = [
  SystemProgram.transfer({
    fromPubkey: publicKey, // Public Key of the sender
    toPubkey: publicKey, // Public Key of the receiver, in this case the sender and the receiver are same, but can be different.
    lamports: minimumRent,
  }),
];
// Use any programs in the instructions, more info: https://docs.solanalabs.com/runtime/programs

const messageV0 = new TransactionMessage({
  payerKey: publicKey,
  recentBlockhash: blockhash,
  instructions,
}).compileToV0Message();

const transaction = new VersionedTransaction(messageV0);

const signature = await auth.provider.request({
  method: "signTransaction",
  params: {
    message: base58.encode(transaction.serialize()),
  },
});

console.log(signature);
// Use base58.decode(signature) to get the signature as a Uint8Array`;

  try {
    const publicKey = new PublicKey(
      (
        await auth.provider.request({
          method: "getAccounts",
          params: [],
        })
      )[0]
    );
    const connection = new Connection(clusterApiUrl("testnet"));
    const minimumRent = await connection.getMinimumBalanceForRentExemption(0);
    const { blockhash } = await connection.getLatestBlockhash();

    const instructions = [
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: publicKey,
        lamports: minimumRent,
      }),
    ];

    const messageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);

    const signature = await auth.provider.request({
      method: "signTransaction",
      params: {
        message: base58.encode(transaction.serialize()),
      },
    });

    output.value = signature;
  } catch (e) {
    output.value = e;
  }
}

async function handleSignAllTransactions() {
  input.value = `import { PublicKey, Connection, SystemProgram, clusterApiUrl } from "@solana/web3.js";
import base58 from "bs58";

const accounts = await auth.provider.request({
  method: "getAccounts",
  params: [],
});
const publicKey = new PublicKey(accounts[0]);

const connection = new Connection(clusterApiUrl("mainnet"));
const minimumRent = await connection.getMinimumBalanceForRentExemption(0);
const { blockhash } = await connection.getLatestBlockhash();

const instructions = [
  SystemProgram.transfer({
    fromPubkey: publicKey, // Public Key of the sender
    toPubkey: publicKey, // Public Key of the receiver, in this case the sender and the receiver are same, but can be different.
    lamports: minimumRent,
  }),
];

const messageV0 = new TransactionMessage({
  payerKey: publicKey,
  recentBlockhash: blockhash,
  instructions,
}).compileToV0Message();

const transaction = new VersionedTransaction(messageV0);

const signatures = await auth.provider.request({
  method: "signAllTransactions",
  params: {
    messages: [
      base58.encode(transaction.serialize()),
      base58.encode(transaction.serialize()),
      base58.encode(transaction.serialize()),
    ],
  },
});

console.log(signatures);
// Use signatures.map(base58.decode) to get the signatures as a Uint8Array`;

  try {
    const publicKey = new PublicKey(
      (
        await auth.provider.request({
          method: "getAccounts",
          params: [],
        })
      )[0]
    );
    const connection = new Connection(clusterApiUrl("testnet"));
    const minimumRent = await connection.getMinimumBalanceForRentExemption(0);
    const { blockhash } = await connection.getLatestBlockhash();

    const instructions = [
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: publicKey,
        lamports: minimumRent,
      }),
    ];

    const messageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);

    const signatures = await auth.provider.request({
      method: "signAllTransactions",
      params: {
        message: [
          base58.encode(transaction.serialize()),
          base58.encode(transaction.serialize()),
          base58.encode(transaction.serialize()),
        ],
      },
    });

    output.value = signatures;
  } catch (e) {
    output.value = e;
  }
}

async function handleSignAndSendTransaction() {
  input.value = `import { PublicKey, Connection, SystemProgram, clusterApiUrl } from "@solana/web3.js";
import base58 from "bs58";

const accounts = await auth.provider.request({
  method: "getAccounts",
  params: [],
});
const publicKey = new PublicKey(accounts[0]);

const connection = new Connection(clusterApiUrl("mainnet"));
const minimumRent = await connection.getMinimumBalanceForRentExemption(0);
const { blockhash } = await connection.getLatestBlockhash();

const instructions = [
  SystemProgram.transfer({
    fromPubkey: publicKey, // Public Key of the sender
    toPubkey: publicKey, // Public Key of the receiver, in this case the sender and the receiver are same, but can be different.
    lamports: minimumRent,
  }),
];

const messageV0 = new TransactionMessage({
  payerKey: publicKey,
  recentBlockhash: blockhash,
  instructions,
}).compileToV0Message();

const transaction = new VersionedTransaction(messageV0);

const tx = await auth.provider.request({
  method: "signAndSendTransaction",
  params: {
    message: base58.encode(transaction.serialize()),
  },
});

console.log(tx);`;

  try {
    const publicKey = new PublicKey(
      (
        await auth.provider.request({
          method: "getAccounts",
          params: [],
        })
      )[0]
    );
    const connection = new Connection(clusterApiUrl("testnet"));
    const minimumRent = await connection.getMinimumBalanceForRentExemption(0);
    const { blockhash } = await connection.getLatestBlockhash();

    const instructions = [
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: publicKey,
        lamports: minimumRent,
      }),
    ];

    const messageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);

    const tx = await auth.provider.request({
      method: "signAndSendTransaction",
      params: {
        message: base58.encode(transaction.serialize()),
      },
    });

    output.value = tx;
  } catch (e) {
    output.value = e;
  }
}

async function loadSiwsMessage() {
  const address = (
    await auth.provider.request({
      method: "getAccounts",
      params: [],
    })
  )[0];
  messageToSign.value = `https://demo.arcana.network wants you to sign in with your Solana account:
${address}

Some statement

URI: https://demo.arcana.network
Version: 1
Chain ID: mainnet
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
</script>

<template>
  <div>
    <div
      class="hide"
      :class="{ show: !!currentAccount }"
      style="font-size: 14px"
    >
      <span><strong>Network: </strong> Solana</span>
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
        :class="{ selected: selectedTab === 'signAllTransactions' }"
        @click.stop="
          selectedTab = 'signAllTransactions';
          handleSignAllTransactions();
        "
        :disabled="!currentAccount"
      >
        Sign All Transactions
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
      <h4 style="font-weight: 600">Input</h4>
      <div v-if="selectedTab === 'signMessage'">
        <h4>Load Input from presets</h4>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap">
          <button @click.stop="loadSiwsMessage">Load SIWS Message</button>
          <button @click.stop="loadRandomMessage">Load Random Message</button>
        </div>
      </div>
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
