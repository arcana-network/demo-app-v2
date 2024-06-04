<script setup>
import { ref, computed, defineAsyncComponent } from "vue";
import { useLoadingStore } from "@/stores/loading";
import { useAuthStore } from "@/stores/auth";
import { apps } from "@/utils/apps";

const EVMApp = defineAsyncComponent(() => import("@/components/EVMApp.vue"));
const NEARApp = defineAsyncComponent(() => import("@/components/NEARApp.vue"));
const SolanaApp = defineAsyncComponent(() =>
  import("@/components/SolanaApp.vue")
);
const PreLoginModule = defineAsyncComponent(() =>
  import("@/components/PreLoginModule.vue")
);

const appAddress = ref("");
const isLoggedIn = computed(() => auth.isLoggedIn);
const loadingStore = useLoadingStore();
const auth = useAuthStore();
const presetLoaded = ref("");
const appLoaded = ref(false);
const chainType = ref("");
const themeSelected = ref("");

const loadApp = async () => {
  presetLoaded.value = "";
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
  presetLoaded.value = "";
  let address = "";
  let presetName = "";
  if (preset === "evm") {
    address = apps.evm;
    presetName = "EVM Preset App";
  } else if (preset === "solana") {
    address = apps.solana;
    presetName = "Solana Preset App";
  } else if (preset === "near") {
    address = apps.near;
    presetName = "NEAR Preset App";
  } else {
    address = apps.solana;
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
    chainType.value = auth.authProvider.appConfig.chainType;
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
</script>

<template>
  <main>
    <header
      style="display: flex; align-items: center; justify-content: space-between"
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
      <div class="mt-1">
        <NEARApp v-if="chainType === 'near_cv25519'" />
        <div v-else-if="chainType === 'mvx_cv25519'"></div>
        <SolanaApp v-else-if="chainType === 'solana_cv25519'" />
        <EVMApp v-else />
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
            <button @click.stop="loadPreset('near')">Load NEAR App</button>
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
          <span v-if="presetLoaded">{{ presetLoaded }}</span>
          <span v-else>App {{ appAddress }} loaded</span>
        </div>
        <div class="hide mt-1" :class="{ show: appLoaded }">
          <button @click.stop="login">Login With Arcana</button>
        </div>
      </div>
      <div class="mt-1" v-if="appLoaded">
        <h4 style="font-weight: 600">Javascript Code</h4>
        <PreLoginModule :address="appAddress" :theme="themeSelected" />
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
