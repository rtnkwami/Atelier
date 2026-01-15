import { ProductResponse } from "./types/products";

export async function getProducts() {
    const response = await fetch(`${ process.env.BACKEND_URL }/products`);
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    const data: ProductResponse = await response.json();
    return data;
}