import { createRoot } from "react-dom/client";
import { App } from "./App";

declare global {
  var __root: ReturnType<typeof createRoot> | undefined;
}

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

if (!globalThis.__root) {
  globalThis.__root = createRoot(container);
}
globalThis.__root.render(<App />);
