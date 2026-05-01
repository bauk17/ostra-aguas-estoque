import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initDB } from "./lib/db/init";

initDB().then(() => {
  console.log("Database initialized");
}).catch((error) => {
  console.error("Failed to initialize database:", error);
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
