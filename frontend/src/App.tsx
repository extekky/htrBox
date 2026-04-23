import { AppRouter } from "@/pages/router";
import { Toaster } from "@/components/common/Toaster";

export function App() {
  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
}
