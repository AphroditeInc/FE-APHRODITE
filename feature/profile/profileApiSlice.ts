import { apiSlice } from "../../app/api/apiSlice";
import endpoints from "../../app/utils/endpoints";

export const profileApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true, // Allow overriding existing endpoints in development
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
      query: ({ id, data }) => {
        const url = endpoints.PROFILE_UPDATE(id);
        console.log("UpdateProfile mutation - URL:", url, "Body:", data, "ID:", id);
        return {
          url,
          method: "PUT",
          body: data,
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
      transformResponse: (response: unknown) => {
        // RTK Query returns the response directly
        // The response should be: { success: true, data: EnrichedProfile } or direct EnrichedProfile
        return response;
      },
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
    listProfiles: builder.query<{ success: boolean; data: unknown }, { type?: 'hunk' | 'diva'; page?: number; limit?: number; state?: string; city?: string }>({
      query: (params?: { type?: 'hunk' | 'diva'; page?: number; limit?: number; state?: string; city?: string }) => {
        const queryParams = new URLSearchParams();
        // API requires 'type' parameter, so always include it (default to 'diva' if not provided)
        const type = params?.type || 'diva';
        queryParams.append('type', type);
        
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.state) queryParams.append('state', params.state);
        if (params?.city) queryParams.append('city', params.city);
        
        const queryString = queryParams.toString();
        return {
          url: `${endpoints.PROFILE_LIST}?${queryString}`,
          method: "GET",
        };
      },
      transformResponse: (response: unknown) => {
        // RTK Query returns the response directly, so we just pass it through
        // The response should be: { success: true, data: [...] } or { success: true, data: { items: [...] } }
        console.log('listProfiles transformResponse:', response);
        return response as { success: boolean; data: unknown };
      },
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
  useListProfilesQuery,
  useUpdateProfilePricingMutation,
  useUpdateProfileServicesMutation,
  useCreateProfileServiceMutation,
  useUpdateProfileVideoMutation,
  useUpdateProfileMediaMutation,
  useGetProfileReviewsQuery,
  useFollowProfileMutation,
} = profileApiSlice;
