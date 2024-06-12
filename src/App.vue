<script setup>
import { ref, computed, defineAsyncComponent, watch } from "vue";
import { useLoadingStore } from "@/stores/loading";
import { useAuthStore } from "@/stores/auth";
import { apps } from "@/utils/apps";
import { getAppConfig } from "@/utils/service";
import PreLoginModule from "@/components/PreLoginModule.vue";

const EVMApp = defineAsyncComponent(() => import("@/components/EVMApp.vue"));
const NEARApp = defineAsyncComponent(() => import("@/components/NEARApp.vue"));
const SolanaApp = defineAsyncComponent(() =>
  import("@/components/SolanaApp.vue")
);
const MultiversXApp = defineAsyncComponent(() =>
  import("@/components/MultiversXApp.vue")
);

const appAddress = ref("");
const isLoggedIn = computed(() => auth.isLoggedIn);
const loadingStore = useLoadingStore();
const auth = useAuthStore();
const presetLoaded = ref("");
const appLoaded = ref(false);
const chainType = ref("");
const themeSelected = ref("");
const isPresetClicked = ref(false);

const loadApp = async () => {
  presetLoaded.value = "";
  loadingStore.showLoader("Loading the app. Please wait...");
  try {
    appLoaded.value = false;
    // Removing existing iframe if any
    document.querySelector("iframe.xar-wallet")?.remove();
    await auth.loadAuth(appAddress.value);
    appLoaded.value = true;
    const appConfig = await getAppConfig(appAddress.value);
    chainType.value = appConfig.chain_type?.toLowerCase();
  } catch (e) {
    console.error(e);
    alert("Error loading app. Please check the console for more details.");
  } finally {
    loadingStore.hideLoader();
  }
};

const loadPreset = async (preset) => {
  isPresetClicked.value = true;
  appLoaded.value = false;
  presetLoaded.value = "";
  let address = "";
  let presetName = "";
  switch (preset) {
    case "evm":
      address = apps.evm;
      presetName = "EVM Preset App";
      break;
    case "solana":
      address = apps.solana;
      presetName = "Solana Preset App";
      break;
    case "multiversx":
      address = apps.multiversx;
      presetName = "MultiversX Preset App";
      break;
    case "near":
      address = apps.near;
      presetName = "NEAR Preset App";
      break;
    default:
      break;
  }
  loadingStore.showLoader(`Loading the ${presetName}. Please wait...`);
  try {
    appAddress.value = address;
    document.querySelector("iframe.xar-wallet")?.remove();
    if (themeSelected.value) {
      await auth.loadAuth(address, { theme: themeSelected.value });
    } else await auth.loadAuth(address);
    appLoaded.value = true;
    presetLoaded.value = `Loaded ${presetName}`;
    const appConfig = await getAppConfig(address);
    chainType.value = appConfig.chain_type?.toLowerCase();
    isPresetClicked.value = true;
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
  appAddress.value = "";
  appLoaded.value = false;
  presetLoaded.value = "";
};

async function handleShowWallet() {
  await auth.authProvider.showWallet();
}

watch(appAddress, () => {
  isPresetClicked.value = false;
});
</script>

<template>
  <main>
    <header
      style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
      "
    >
      <img src="/logo-horizontal.png" style="height: 40px" />
      <div v-if="isLoggedIn">
        <div style="display: flex; align-items: center; gap: 1rem">
          <button @click.stop="handleShowWallet">Show Wallet</button>
          <button @click.stop="logout">Logout</button>
        </div>
      </div>
    </header>
    <div class="loader hide" :class="{ show: loadingStore.isLoading }">
      {{ loadingStore.message || "Loading..." }}
    </div>
    <section v-if="isLoggedIn" name="post-login">
      <div>
        <NEARApp v-if="chainType === 'near'" />
        <MultiversXApp v-else-if="chainType === 'multiversx'" />
        <SolanaApp v-else-if="chainType === 'solana'" />
        <EVMApp v-else-if="chainType === 'evm'" />
      </div>
    </section>
    <section v-else name="pre-login" style="align-items: center">
      <div>
        <div>
          <h3 style="font-weight: 600; margin-bottom: 0.5rem">
            Load apps from the presets
          </h3>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap">
            <button @click.stop="loadPreset('evm')">Load EVM App</button>
            <button @click.stop="loadPreset('solana')">Load Solana App</button>
            <button @click.stop="loadPreset('multiversx')">
              Load MultiversX App
            </button>
            <button @click.stop="loadPreset('near')">
              Load NEAR App (Testnet)
            </button>
          </div>
        </div>
        <div class="mt-1">
          <h3 style="font-weight: 600; margin-bottom: 0.5rem">
            Or load your own app
          </h3>
          <form
            @submit.prevent="loadApp"
            style="display: flex; flex-direction: column; gap: 4px"
          >
            <label for="app-address">App Address:</label>
            <div
              style="
                display: flex;
                gap: 1rem;
                align-items: center;
                flex-wrap: wrap;
              "
            >
              <input
                type="text"
                id="app-address"
                style="max-width: 360px; width: 100%"
                v-model="appAddress"
              />
              <button type="submit" :disabled="isPresetClicked">
                Load App
              </button>
            </div>
          </form>
        </div>
        <div class="hide mt-1" :class="{ show: appLoaded }">
          <span v-if="presetLoaded">{{ presetLoaded }}</span>
          <span v-else>App {{ appAddress }} loaded</span>
        </div>
        <div class="hide mt-1" :class="{ show: appLoaded }">
          <button @click.stop="login">Login With Arcana</button>
        </div>
      </div>
      <div class="xar-output mt-1">
        <div class="code">
          <div>
            <h4>Javascript Code</h4>
            <hr />
          </div>
          <PreLoginModule :address="appAddress" :theme="themeSelected" />
        </div>
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
  gap: 0.5rem;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
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
