import { Suspense } from "react";
import GiftPage from "./render";
export default function Page() {
  return (
    <Suspense>
      <GiftPage />
    </Suspense>
  );
}
