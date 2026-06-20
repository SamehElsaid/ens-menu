"use client";

import { store } from "@/store/store";
import { Provider } from "react-redux";
import HomeApp from "./HomeApp";
import SafeNavigationGuard from "./SafeNavigationGuard";

function RenderInProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SafeNavigationGuard />
      <HomeApp>{children}</HomeApp>
    </Provider>
  );
}

export default RenderInProvider;
