const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";

const response = await fetch(`${apiBaseUrl}/api/ops/simulations/midnight-retry-storm`, { method: "POST" });

if (!response.ok) {
  throw new Error(`Failed to simulate incident: ${response.status} ${await response.text()}`);
}

console.log(await response.json());

