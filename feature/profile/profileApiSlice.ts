import { apiSlice } from "../../app/api/apiSlice";
import endpoints from "../../app/utils/endpoints";

export const profileApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createProfile: builder.mutation({
      query: (data) => ({
        url: endpoints.PROFILE_CREATE,
        method: "POST",
        body: data,
      }),
      extraOptions: { serviceKey: "us" },
      invalidatesTags: ['Profile'],
    }),
    getEnrichedProfile: builder.query({
      query: (userId: string) => ({
        url: endpoints.PROFILE_GET_USER_PROFILE(userId),
        method: "GET",
      }),
      extraOptions: { serviceKey: "us" },
      providesTags: ['Profile'],
      keepUnusedDataFor: 60,
    }),
    updateProfilePricing: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: endpoints.PROFILE_PRICING(userId),
        method: "PUT",
        body: data,
      }),
      extraOptions: { serviceKey: "us" },
      invalidatesTags: ['Profile'],
    }),
    updateProfileServices: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: endpoints.PROFILE_SERVICES(userId),
        method: "PUT",
        body: data,
      }),
      extraOptions: { serviceKey: "us" },
      invalidatesTags: ['Profile'],
    }),
    updateProfileVideo: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: endpoints.PROFILE_VIDEO(userId),
        method: "PUT",
        body: data,
      }),
      extraOptions: { serviceKey: "us" },
      invalidatesTags: ['Profile'],
    }),
    updateProfileMedia: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: endpoints.PROFILE_MEDIA(userId),
        method: "PUT",
        body: data,
      }),
      extraOptions: { serviceKey: "us" },
      invalidatesTags: ['Profile'],
    }),
    getProfileReviews: builder.query({
      query: (userId: string) => ({
        url: endpoints.PROFILE_REVIEWS(userId),
        method: "GET",
      }),
      extraOptions: { serviceKey: "us" },
      providesTags: ['Profile'],
    }),
    followProfile: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: endpoints.PROFILE_FOLLOW(userId),
        method: "POST",
        body: data,
      }),
      extraOptions: { serviceKey: "us" },
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const {
  useCreateProfileMutation,
  useGetEnrichedProfileQuery,
  useUpdateProfilePricingMutation,
  useUpdateProfileServicesMutation,
  useUpdateProfileVideoMutation,
  useUpdateProfileMediaMutation,
  useGetProfileReviewsQuery,
  useFollowProfileMutation,
} = profileApiSlice;

