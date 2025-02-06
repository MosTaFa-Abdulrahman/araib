import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../requestMethod";

export const brandSlice = createApi({
  reducerPath: "brand",
  baseQuery: axiosBaseQuery({ baseUrl: "brand" }),
  tagTypes: ["Brand"],
  endpoints: (builder) => ({
    // Create
    createBrand: builder.mutation({
      query: (brandData) => ({
        url: "/create",
        method: "POST",
        data: brandData,
      }),
      invalidatesTags: ["Brand"],
    }),
    // Get All
    getAllBrands: builder.query({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: ["Brand"],
    }),
    // Get By ID
    getBrandById: builder.query({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: ["Brand"],
    }),
    // Update By ID
    updateBrand: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Brand"],
    }),
    // Delete By ID
    deleteBrand: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Brand"],
    }),
  }),
});

export const {
  useCreateBrandMutation,
  useGetAllBrandsQuery,
  useGetBrandByIdQuery,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandSlice;
