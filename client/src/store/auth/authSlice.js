import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../requestMethod";

export const authSlice = createApi({
  reducerPath: "auth",
  baseQuery: axiosBaseQuery({ baseUrl: "auth" }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (user) => ({
        url: "/register",
        method: "POST",
        data: user,
      }),
    }),
    getCurrentUser: builder.query({
      query: () => ({
        url: "/check-auth",
        method: "GET",
      }),
    }),
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        data: credentials,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "/forgot-password",
        method: "POST",
        data: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, newPassword }) => ({
        url: `/reset-password/${token}`,
        method: "POST",
        data: { password: newPassword },
      }),
    }),
    verifyEmail: builder.mutation({
      query: (verificationCode) => ({
        url: "/verify-email",
        method: "POST",
        data: { code: verificationCode },
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useGetCurrentUserQuery,
  useLoginUserMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useLogoutMutation,
} = authSlice;
