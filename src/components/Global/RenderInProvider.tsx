"use client";

import { store } from "@/store/store";
import { Provider } from "react-redux";
import HomeApp from "./HomeApp";
import GoogleAuthProvider from "./GoogleAuthProvider";

function RenderInProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <GoogleAuthProvider>
        <HomeApp>{children}</HomeApp>
      </GoogleAuthProvider>
    </Provider>
  );
}

export default RenderInProvider;
