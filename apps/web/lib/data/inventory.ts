import {
  GetCategoriesResponse,
  PublicProductSchema,
  SearchProductResponseSchema,
  SearchProducts
} from "contracts"

export async function getCatalog(params?: SearchProducts) {
  const searchParams = new URLSearchParams();
  if (params) {
    // loop over each key value pair in params because URLSearchParams expects only strings
    for (const [key, value] of Object.entries(params)) {
      searchParams.append(key, String(value));
    }
  }
  try {
    const response = await fetch(`${process.env.API_BASE_URL}/inventory?${searchParams}`)

    if (!response.ok) {
      console.error(await response.json())
      return null;
    }

    const data = await response.json();
    const validation = SearchProductResponseSchema.safeParse(data);

    if (validation.error) {
      console.error(validation.error);
      return null
    }
    return validation.data;
  } catch (error) {
    console.error(error)
    return null;
  }
}

export async function getCatalogProduct(id: string) {
  try {
    const response = await fetch(`${ process.env.API_BASE_URL }/inventory/${ id }`)

    if (!response.ok) {
      throw new Error(`Error fetching product ${ id }`);
    }

    const data = await response.json()
    const validation = PublicProductSchema.safeParse(data);

    if (validation.error) {
      console.error(validation.error)
      throw new Error('Error fetching product from catalog', { cause: validation.error })
    }
    return validation.data;
  } catch (error) {
    console.error(error)
    throw new Error('Error fetching product from catalog', { cause: error })
  }
}

export async function getCategories() {
  try {
    const response = await fetch(`${ process.env.API_BASE_URL }/inventory/categories`);

    if (!response.ok) {
      throw new Error('Error fetching product categories', { cause: response.statusText });
    }

    const data = await response.json()
    const validation = GetCategoriesResponse.safeParse(data);

    if (validation.error) {
      console.error(validation.error)
      throw new Error('Error fetching product categories', { cause: validation.error })
    }
    return validation.data;
  } catch (error) {
    console.error(error)
    throw new Error('Error fetching product categories', { cause: error })
  }
}