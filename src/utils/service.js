const apis = {
  dev: "https://gateway-dev.arcana.network",
  test: "https://gateway001-testnet.arcana.network",
  live: "https://gateway.arcana.network",
};

function getEnv(address) {
  const [_, env, id] = address.split("_");
  return {
    api: apis[env],
    id,
  };
}

export async function getAppConfig(address) {
  const { api, id } = getEnv(address);
  const res = await fetch(`${api}/api/v1/get-app-config/?id=${id}`);
  return await res.json();
}
