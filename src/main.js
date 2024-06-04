import "@/assets/main.css";
import { Buffer as NPMBuffer } from "buffer";
import "highlight.js/styles/vs2015.min.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "@/App.vue";

window.Buffer = window.Buffer || NPMBuffer;
globalThis.Buffer = globalThis.Buffer || NPMBuffer;

const app = createApp(App);

app.use(createPinia());

app.mount("#app");
