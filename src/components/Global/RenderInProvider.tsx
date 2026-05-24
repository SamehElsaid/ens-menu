"use client";

import { store } from "@/store/store";
import { Provider } from "react-redux";
import HomeApp from "./HomeApp";

function RenderInProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <HomeApp>{children}</HomeApp>
    </Provider>
  );
}

export default RenderInProvider;
