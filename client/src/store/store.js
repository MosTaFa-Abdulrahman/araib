import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./auth/authSlice";
import { brandSlice } from "./brand/brandSlice";

export const store = configureStore({
  reducer: {
    [authSlice.reducerPath]: authSlice.reducer,
    [brandSlice.reducerPath]: brandSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authSlice.middleware)
      .concat(brandSlice.middleware),
});
