<script setup>
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import { onMounted, onUpdated } from "vue";

const props = defineProps(["address", "theme"]);
hljs.registerLanguage("js", javascript);

const authProviderScript = props.theme
  ? `const auth = new AuthProvider("${props.address}", { theme: "${props.theme}" });`
  : `const auth = new AuthProvider("${props.address}");`;

const preLoginScript = `import { AuthProvider } from '@arcana/auth';

${authProviderScript}

// Initialize auth (Just do this once throughout the app lifecycle)
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

// Login with firebase
// Check the docs here: https://docs.arcana.network/auth/onboard/vanilla/custom-ui/build-idm/firebase-login/
`;

onMounted(() => {
  hljs.highlightAll();
});

onUpdated(() => {
  hljs.highlightAll();
});
</script>

<template>
  <pre><code class="language-js">{{ preLoginScript }}</code></pre>
</template>
