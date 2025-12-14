import { createRoot } from "react-dom/client";
import { App } from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

let root = (container as any)._reactRootContainer;
if (!root) {
  root = createRoot(container);
  (container as any)._reactRootContainer = root;
}
root.render(<App />);
