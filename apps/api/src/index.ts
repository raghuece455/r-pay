import { createApp } from "./app";
import { config } from "./lib/config";

const app = createApp();

app.listen(config.port, () => {
  console.log(`R-Pay API listening on http://localhost:${config.port}`);
  console.log("Safety: mock UPI switch only; no real money movement.");
});

