import { ref } from "vue";
import { defineStore } from "pinia";
import { AuthProvider } from "@arcana/auth";

export const useAuthStore = defineStore("auth", () => {
  const authProvider = ref(null);
  const isLoggedIn = ref(false);
  const provider = ref(null);

  async function loadAuth(appId) {
    // const ap = new AuthProvider("e06aaea212b141ecaee8682cf842eac31470cef2", {
    //   network: {
    //     gatewayUrl: "https://gateway-dev.arcana.network",
    //     authUrl: "http://localhost:8080",
    //     walletUrl: "http://localhost:3000",
    //   },
    // });
    const ap = new AuthProvider(appId);
    await ap.init();
    authProvider.value = ap;
    provider.value = ap.provider;
    ap.provider.on("connect", () => {
      isLoggedIn.value = true;
    });
    if (await ap.isLoggedIn()) {
      isLoggedIn.value = true;
    }
  }

  async function login() {
    await authProvider.value.connect();
  }

  async function logout() {
    await authProvider.value.logout();
    isLoggedIn.value = false;
  }

  return { authProvider, isLoggedIn, provider, loadAuth, login, logout };
});
