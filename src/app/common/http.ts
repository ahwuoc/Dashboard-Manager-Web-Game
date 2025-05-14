const API_PATH = process.env.NEXT_PUBLIC_API_URL!;

type Method = "GET" | "POST" | "PUT" | "DELETE";

type OptionsCus = RequestInit & {
  body?: any;
};
type ResponseCus<T> = {
  status?: number;
  payload?: T;
};

const http = async <T>(
  method: Method,
  url: string,
  options: OptionsCus = {}
): Promise<ResponseCus<T>> => {
  const { body, ...restOptions } = options;
  const headers = {
    "Content-Type": "application/json",
    ...restOptions.headers,
  };
  const fullpath = url.startsWith("/")
    ? `${API_PATH}${url}`
    : `${API_PATH}/${url}`;
  try {
    const response = await fetch(fullpath, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      ...restOptions,
    });
    let data: any = {};

    if (response.ok) {
      try {
        data = await response.json();
      } catch (err) {
        throw new Error("Invalid JSON response");
      }
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }
    return {
      status: response.status,
      payload: data as T,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Something went wrong"
    );
  }
};

const HTTP = {
  get: <T>(url: string) => http<T>("GET", url),
  post: <T>(url: string, body: any, options: OptionsCus = {}) => {
    return http<T>("POST", url, { ...options, body });
  },
  put: <T>(url: string, body?: any, options: OptionsCus = {}) => {
    return http<T>("PUT", url, { ...options, body });
  },
  delete: <T>(url: string, body?: any, options: OptionsCus = {}) => {
    return http<T>("DELETE", url, { ...options, body });
  },
};

export default HTTP;
