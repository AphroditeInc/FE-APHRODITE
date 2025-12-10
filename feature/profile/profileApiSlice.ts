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
    updateProfile: builder.mutation({
      query: ({ id, ...data }) => {
        const url = endpoints.PROFILE_UPDATE(id);
        console.log("UpdateProfile mutation - URL:", url, "Body:", data, "ID:", id);
        return {
          url,
          method: "PUT",
          body: data, // id is NOT included in body, only in URL
        };
      },
      extraOptions: { serviceKey: "us" },
      invalidatesTags: ['Profile'],
    }),
    getProfileById: builder.query({
      query: (id: string) => ({
        url: endpoints.PROFILE_GET_BY_ID(id),
        method: "GET",
      }),
      extraOptions: { serviceKey: "us" },
      providesTags: ['Profile'],
      keepUnusedDataFor: 60,
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
    createProfileService: builder.mutation({
      query: ({ id, ...data }) => ({
        url: endpoints.PROFILE_SERVICES(id),
        method: "POST",
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
      query: ({ id, mediaUrls }) => {
        const url = endpoints.PROFILE_UPDATE(id);
        console.log("UpdateProfileMedia mutation - URL:", url, "Method: PUT", "Body:", { media: mediaUrls }, "ID:", id);
        return {
          url,
          method: "PUT",
          body: { media: mediaUrls },
        };
      },
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
  useUpdateProfileMutation,
  useGetProfileByIdQuery,
  useGetEnrichedProfileQuery,
  useUpdateProfilePricingMutation,
  useUpdateProfileServicesMutation,
  useCreateProfileServiceMutation,
  useUpdateProfileVideoMutation,
  useUpdateProfileMediaMutation,
  useGetProfileReviewsQuery,
  useFollowProfileMutation,
} = profileApiSlice;







