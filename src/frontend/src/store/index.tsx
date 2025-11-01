import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./ducks/rootReducer";
import { IHomeState } from "./ducks/home/types";


export interface ApplicationState {
  HOME: IHomeState;
}

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // desativa warnings de serialização
    }),
  devTools: import.meta.env.MODE !== "production",
});
