import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { App } from "./App";
import { queryClient } from "./queryClient";

import "./index.css";


const rootElement = document.getElementById("root");

if (rootElement) {
    createRoot(rootElement).render(
        <QueryClientProvider client={queryClient}>
            <App />
            {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />} */}
        </QueryClientProvider>
    );
} else {
    console.error("Root element (#root) not found in the document");
}