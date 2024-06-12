export const apps = {
  evm: import.meta.env.VITE_EVM_APP,
  solana: import.meta.env.VITE_SOLANA_APP,
  near: import.meta.env.VITE_NEAR_APP,
  multiversx: import.meta.env.VITE_MULTIVERSX_APP,
};

console.log(apps);
