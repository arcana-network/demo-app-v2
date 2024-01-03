<script setup>
import { ref, computed } from "vue";
import { useLoadingStore } from "./stores/loading";
import { useAuthStore } from "./stores/auth";
import EVMApp from "./components/EVMApp.vue";
import SolanaApp from "./components/SolanaApp.vue";

const appAddress = ref("");
const isLoggedIn = computed(() => auth.isLoggedIn);
const loadingStore = useLoadingStore();
const auth = useAuthStore();
const appNetwork = computed(() => {
  if (appAddress.value.includes("dev")) {
    return "Dev";
  } else if (appAddress.value.includes("test")) {
    return "Testnet";
  } else if (appAddress.value.includes("live")) {
    return "Mainnet";
  } else {
    return "Local";
  }
});
const appLoaded = ref(false);

const loadApp = async () => {
  loadingStore.showLoader("Loading the app. Please wait...");
  try {
    appLoaded.value = false;
    // Removing existing iframe if any
    document.querySelector("iframe.xar-wallet")?.remove();
    await auth.loadAuth(appAddress.value);
    appLoaded.value = true;
  } catch (e) {
    console.error(e);
    alert("Error loading app. Please check the console for more details.");
  } finally {
    loadingStore.hideLoader();
  }
};

const loadPreset = async (preset) => {
  appLoaded.value = false;
  let address = "";
  let presetName = "";
  if (preset === "evm-mainnet") {
    address = import.meta.env.VITE_EVM_MAINNET_APP;
    presetName = "EVM App on Mainnet";
  } else if (preset === "evm-testnet") {
    address = import.meta.env.VITE_EVM_TESTNET_APP;
    presetName = "EVM App on Testnet";
  } else if (preset === "solana-testnet") {
    address = import.meta.env.VITE_SOLANA_TESTNET_APP;
    presetName = "Solana App on Testnet";
  }
  appAddress.value = address;
  loadingStore.showLoader(`Loading the ${presetName}. Please wait...`);
  try {
    document.querySelector("iframe.xar-wallet")?.remove();
    await auth.loadAuth(address);
    appLoaded.value = true;
  } catch (e) {
    console.error(e);
    alert("Error loading app. Please check the console for more details.");
  } finally {
    loadingStore.hideLoader();
  }
};

const login = async () => {
  await auth.login();
};

const logout = async () => {
  await auth.logout();
};
</script>

<template>
  <main>
    <div class="loader hide" :class="{ show: loadingStore.isLoading }">
      {{ loadingStore.message || "Loading..." }}
    </div>
    <section v-if="isLoggedIn" name="post-login">
      <div class="mt-1">
        <button @click.stop="logout">Logout</button>
      </div>
      <div class="mt-1">
        <SolanaApp v-if="auth.authProvider.solana" />
        <EVMApp v-else />
      </div>
    </section>
    <section v-else name="pre-login">
      <div>
        <h3 style="font-weight: 600; margin-bottom: 0.5rem">
          Load apps from the presets
        </h3>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap">
          <button @click.stop="loadPreset('evm-mainnet')">
            Load EVM App on Mainnet
          </button>
          <button @click.stop="loadPreset('evm-testnet')">
            Load EVM App on Testnet
          </button>
          <button disabled @click.stop="loadPreset('solana-testnet')">
            Load Solana App on Testnet
          </button>
        </div>
      </div>
      <div class="mt-1">
        <h3 style="font-weight: 600; margin-bottom: 0.5rem">
          Or load your own app
        </h3>
        <form
          @submit.prevent="loadApp"
          style="display: flex; gap: 1rem; align-items: center"
        >
          <label for="app-address">App Address:</label>
          <input
            type="text"
            id="app-address"
            style="width: 360px"
            v-model="appAddress"
          />
          <button type="submit">Load App</button>
        </form>
      </div>
      <div class="hide mt-1" :class="{ show: appLoaded }">
        App {{ appAddress }} loaded on {{ appNetwork }} network
      </div>
      <div class="hide mt-1" :class="{ show: appLoaded }">
        <button @click.stop="login">Login With Arcana</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
}

main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loader {
  animation: color-change 1.25s infinite;
}

@keyframes color-change {
  0% {
    color: var(--vt-c-indigo);
  }
  30% {
    color: transparent;
  }
  60% {
    color: var(--vt-c-indigo);
  }
}
</style>
