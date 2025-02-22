import qs from "qs";

export function getStrapiURL(path = ""): string {
  return `${
    process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://127.0.0.1:1337"
  }${path}`;
}

export async function fetchAPI<T>(
  path: string,
  urlParamsObject = {},
  options: { headers?: Record<string, string> } = {},
): Promise<T> {
  try {
    const token = process.env.BEARER_TOKEN;
    const mergedOptions = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
      ...options,
    };

    const queryString = qs.stringify(urlParamsObject, { encode: false });
    const requestUrl = `${getStrapiURL(
      `/api${path}${queryString ? `?${queryString}` : ""}`,
    )}`;

    const response = await fetch(requestUrl, mergedOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch ${path}: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(
      `Something went wrong. Please check your API server and parameters.\nError: ${error.message}`,
    );
  }
}
