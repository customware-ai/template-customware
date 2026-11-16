import { createRoot } from "react-dom/client";
import { RouterProvider } from "speedy-router";

import "./app.css";
import { router } from "./routes";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found.");

createRoot(root).render(<RouterProvider router={router} />);
