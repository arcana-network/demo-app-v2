<script setup>
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import { onMounted, onUpdated, ref } from "vue";

const props = defineProps(["output", "input"]);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("json", json);

const inputEl = ref(null);
const outputEl = ref(null);

onMounted(() => {
  hljs.highlightAll();
});

onUpdated(() => {
  if (inputEl.value) {
    inputEl.value.removeAttribute("data-highlighted");
  }
  if (outputEl.value) {
    outputEl.value.removeAttribute("data-highlighted");
  }
  hljs.highlightAll();
});
</script>

<template>
  <div class="output mt-1">
    <div>
      <h4 style="font-weight: 600">Javascript Code</h4>
      <pre><code ref="inputEl" class="language-js">{{ props.input }}</code></pre>
    </div>
    <div>
      <h4 style="font-weight: 600">Output</h4>
      <pre
        v-if="props.output"
      ><code ref="outputEl" class="language-json">{{ props.output}}</code></pre>
    </div>
  </div>
</template>
