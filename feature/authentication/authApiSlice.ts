import { apiSlice } from "../../app/api/apiSlice";
import endpoints from "../../app/utils/endpoints";

export const authApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true, // Allow overriding existing endpoints
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (data) => ({
        url: endpoints.AUTH_REGISTER,
        method: "POST",
        body: data,
      }),
      extraOptions: { serviceKey: "us" },
    }),
    registerWithEmail: builder.mutation({
      query: (data) => ({
        url: endpoints.AUTH_EMAIL_REGISTER,
        method: "POST",
        body: data,
      }),
      extraOptions: { serviceKey: "us" },
    }),
    login: builder.mutation({
      query: (data) => ({
        url: endpoints.AUTH_LOGIN,
        method: "POST",
        body: data,
      }),
      extraOptions: { serviceKey: "us" },
    }),
    logout: builder.mutation({
      query: () => ({
        url: endpoints.AUTH_LOGOUT,
        method: "POST",
      }),
      extraOptions: { serviceKey: "us" },
    }),
    refreshToken: builder.mutation({
      query: (data) => ({
        url: endpoints.AUTH_REFRESH,
        method: "POST",
        body: data,
      }),
      extraOptions: { serviceKey: "us" },
    }),
    getAuthProfile: builder.query({
      query: () => ({
        url: endpoints.AUTH_PROFILE,
        method: "GET",
      }),
      extraOptions: { serviceKey: "us" },
      providesTags: ['User'],
    }),
    updateAuthProfile: builder.mutation({
      query: (data) => ({
        url: endpoints.AUTH_PROFILE,
        method: "PUT",
        body: data,
      }),
      extraOptions: { serviceKey: "us" },
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: endpoints.AUTH_CHANGE_PASSWORD,
        method: "POST",
        body: data,
      }),
      extraOptions: { serviceKey: "us" },
    }),
    sendOTP: builder.mutation({
      query: (data) => ({
        url: endpoints.OTP_SEND,
        method: "POST",
        body: data,
      }),
      extraOptions: { serviceKey: "us" },
    }),
    createCompleteUser: builder.mutation({
      query: (data) => ({
        url: endpoints.USER_CREATE,
        method: "POST",
        body: data,
      }),
      extraOptions: { serviceKey: "us" },
    }),
    getUserProfile: builder.query({
      query: (userId: string) => ({
        url: endpoints.USER_PROFILE(userId),
        method: "GET",
      }),
      extraOptions: { serviceKey: "us" },
      providesTags: ['User'],
    }),
    completeBasicDetails: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: endpoints.USER_BASIC_DETAILS(userId),
        method: "POST",
        body: data,
      }),
      extraOptions: { serviceKey: "us" },
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: endpoints.USER_UPDATE_PROFILE(userId),
        method: "PUT",
        body: data,
      }),
      extraOptions: { serviceKey: "us" },
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useRegisterWithEmailMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetAuthProfileQuery,
  useUpdateAuthProfileMutation,
  useChangePasswordMutation,
  useSendOTPMutation,
  useCreateCompleteUserMutation,
  useGetUserProfileQuery,
  useCompleteBasicDetailsMutation,
  useUpdateUserMutation,
} = authApiSlice;

