const API_BASE_URL = process.env.NEXT_PUBLIC_URL;

type OptionsInit = Omit<RequestInit, "body"> & {
  body?: unknown;
};

type ReturnResponse<T> = {
  status: number;
  payload: T;
};
type Method = "GET" | "POST" | "DELETE" | "PUT";

const request = async <T>(
  method: Method,
  url: string,
  options?: OptionsInit,
): Promise<ReturnResponse<T>> => {
  const { body: rawBody, ...restOptions } = options ?? {};
  const requestBody = rawBody ? JSON.stringify(rawBody) : undefined;

  const baseHeaders = {
    "Content-Type": "application/json",
  };

  const finalUrl = url.includes("api")
    ? url.startsWith("/")
      ? url
      : `/${url}`
    : `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;

  const finalHeaders = {
    ...baseHeaders,
    ...(options?.headers || {}),
  };

  const fetchOptions: RequestInit = {
    method,
    headers: finalHeaders,
    ...(method !== "GET" ? { body: requestBody } : {}),
    ...restOptions,
  };

  const response = await fetch(finalUrl, fetchOptions);

  if (!response.ok) {
    throw new Error("Request failed");
  }
  const data = await response.json();
  return {
    status: response.status,
    payload: data as T,
  };
};

const http = {
  get: async <T>(url: string, options?: OptionsInit) =>
    await request<T>("GET", url, options),
  post: async <T>(url: string, body: unknown, options?: OptionsInit) =>
    await request<T>("POST", url, { ...options, body }),
  put: async <T>(url: string, body: unknown, options?: OptionsInit) =>
    await request<T>("PUT", url, { ...options, body }),
  delete: async <T>(url: string, body?: unknown, options?: OptionsInit) =>
    await request<T>("DELETE", url, { ...options, body }),
};
export default http;
