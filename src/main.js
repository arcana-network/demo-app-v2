import "@/assets/main.css";
import { Buffer as NPMBuffer } from "buffer";
import "highlight.js/styles/monokai-sublime.min.css";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "@/App.vue";

window.Buffer = window.Buffer || NPMBuffer;
globalThis.Buffer = globalThis.Buffer || NPMBuffer;

hljs.registerLanguage("js", javascript);
hljs.registerLanguage("json", json);

const app = createApp(App);

app.use(createPinia());

app.mount("#app");
