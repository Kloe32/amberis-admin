import { API_ROUTES } from "../config/config";
import axiosInstance from "../config/axiosInstance";

const getCategories = async () => {
  try {
    const { data } = await axiosInstance.get(API_ROUTES.GET_CATEGORIES);
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch categories",
      { cause: error },
    );
  }
};

const addCategory = async (categoryData: FormData) => {
  try {
    const { data } = await axiosInstance.post(
      API_ROUTES.ADD_CATEGORY,
      categoryData,
    );
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to add category",
      { cause: error },
    );
  }
};

const updateCategory = async (categoryId: string, categoryData: FormData) => {
  try {
    const { data } = await axiosInstance.put(
      `${API_ROUTES.UPDATE_CATEGORY}/${categoryId}`,
      categoryData,
    );
    console.log(categoryData);
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update category",
      { cause: error },
    );
  }
};

const deleteCategory = async (categoryId: string) => {
  try {
    const { data } = await axiosInstance.delete(
      `${API_ROUTES.DELETE_CATEGORY}/${categoryId}`,
    );
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete category",
      { cause: error },
    );
  }
};

const getProducts = async () => {
  try {
    const { data } = await axiosInstance.get(API_ROUTES.GET_PRODUCTS);
    console.log(data);
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch products",
      { cause: error },
    );
  }
};

const addProduct = async (productData: FormData) => {
  try {
    const { data } = await axiosInstance.post(
      API_ROUTES.ADD_PRODUCT,
      productData,
    );
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to add product",
      { cause: error },
    );
  }
};

const updateProduct = async (productId: string, productData: FormData) => {
  try {
    const { data } = await axiosInstance.put(
      `${API_ROUTES.UPDATE_PRODUCT}/${productId}`,
      productData,
    );
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update product",
      { cause: error },
    );
  }
};
const updateProductStatus = async (productId: string, status: string) => {
  try {
    const { data } = await axiosInstance.patch(
      `${API_ROUTES.UPDATE_PRODUCT_STATUS}/${productId}`,
      { status },
    );
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to update product status",
      { cause: error },
    );
  }
};

const deleteProduct = async (productId: string) => {
  try {
    const { data } = await axiosInstance.delete(
      `${API_ROUTES.DELETE_PRODUCT}/${productId}`,
    );
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete product",
      { cause: error },
    );
  }
};

export {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
};
