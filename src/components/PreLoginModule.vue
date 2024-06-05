<script setup>
import hljs from "highlight.js/lib/core";
import { computed, onMounted, onUpdated, ref } from "vue";

const props = defineProps(["address", "theme"]);
const codeEl = ref(null);

const authProviderScript = props.theme
  ? `const auth = new AuthProvider(appAddress, { theme });`
  : `const auth = new AuthProvider(appAddress);`;

const preLoginScript = computed(
  () => `import { AuthProvider } from '@arcana/auth';

const appAddress = "${props.address}";

${authProviderScript}

// Initialize auth
const init = async () => {
  await auth.init();
};

// Login using popup modal
const login = async () => {
  await auth.connect();
};

// Social Login ('google' | 'twitter' | 'github' | 'twitch' | 'discord' | 'steam' | 'aws')
const loginWithSocial = async (provider) => {
  await auth.loginWithSocial(provider);
};

// Email Login (Login with OTP)
const loginWithEmail = async (email) => {
  const loginState = await auth.loginWithOTPStart(email);
  await loginState.begin();
}; // Use this to resend the OTP as well
const confirmOTP = async (otp) => {
  await auth.loginWithOTPComplete(otp);
};

// Check if user is logged in
const isLoggedIn = () => {
  return auth.isLoggedIn();
};

// Get user details
const getUser = () => {
  return auth.getUser();
};

// Listen to connect event
auth.on("connect", () => {
  console.log("Logged in successfully");
});

// Show Wallet
const showWallet = async () => {
  await auth.showWallet();
};

// Logout
const logout = async () => {
  await auth.logout();
};

// Login with firebase
// Check the docs here: https://docs.arcana.network/auth/onboard/vanilla/custom-ui/build-idm/firebase-login/
`
);

onMounted(() => {
  hljs.highlightAll();
});

onUpdated(() => {
  if (codeEl.value) {
    codeEl.value.removeAttribute("data-highlighted");
  }
  hljs.highlightAll();
});
</script>

<template>
  <pre><code class="language-js" ref="codeEl">{{ preLoginScript }}</code></pre>
</template>
