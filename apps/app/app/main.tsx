import { createRoot } from "react-dom/client";
import { RouterProvider } from "speedy-router";

import "./app.css";
import { router } from "./routes";

createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
