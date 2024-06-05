<script setup>
import hljs from "highlight.js/lib/core";
import { onMounted, onUpdated, ref, watch } from "vue";

const props = defineProps(["output", "input"]);

const inputEl = ref(null);
const outputEl = ref(null);
const copied = ref(false);

onMounted(() => {
  hljs.highlightAll();
});

onUpdated(() => {
  copied.value = false;
  if (inputEl.value) {
    inputEl.value.removeAttribute("data-highlighted");
  }
  if (outputEl.value) {
    outputEl.value.removeAttribute("data-highlighted");
  }
  hljs.highlightAll();
});

async function handleCopyInput() {
  await navigator.clipboard.writeText(props.input);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 3000);
}
</script>

<template>
  <div class="xar-output mt-1">
    <div class="code">
      <div>
        <div
          style="
            display: flex;
            justify-content: space-between;
            gap: 1rem;
            align-items: center;
          "
        >
          <h4>Javascript Code</h4>
          <span style="font-size: 13px" v-if="copied">Copied</span>
          <button
            v-else
            class="copy-button"
            style="font-size: 13px; padding: 0"
            @click.stop="handleCopyInput"
          >
            Copy
          </button>
        </div>
        <hr />
      </div>
      <pre><code ref="inputEl" class="language-js">{{ props.input }}</code></pre>
    </div>
    <div class="code">
      <div>
        <h4>Output</h4>
        <hr />
      </div>
      <pre
        v-if="props.output"
      ><code ref="outputEl" class="language-json">{{ props.output}}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.copy-button {
  background: transparent;
  color: currentColor;
  transition: all 0.3s;
  outline: none;
  border: none;
}

@media (hover: hover) {
  .copy-button:hover {
    background: transparent;
    color: var(--color-primary);
    outline: none;
    border: none;
    box-shadow: none;
  }
}

.copy-button:focus-visible {
  background: transparent;
  color: var(--color-primary);
  outline: none;
  border: none;
  box-shadow: none;
}
</style>
