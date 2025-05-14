const API_PATH = process.env.NEXT_PUBLIC_API_URL!;

if (!API_PATH) {
  console.error("NEXT_PUBLIC_API_URL is not defined!");
  // Depending on your application, you might want to throw an error here
  // throw new Error("NEXT_PUBLIC_API_URL is not defined!");
}

type Method = "GET" | "POST" | "PUT" | "DELETE";

// Options type specifically for the http function
// It includes RequestInit properties and a typed 'body' before JSON.stringify
type HttpRequestOptions<TBody = unknown> = Omit<RequestInit, "body"> & {
  body?: TBody; // The body data before JSON.stringify
};

// Response type remains the same
type HttpResponse<T> = {
  status: number;
  payload: T;
};

const http = async <T, TBody = unknown>(
  method: Method,
  url: string,
  options: HttpRequestOptions<TBody> = {}
): Promise<HttpResponse<T>> => {
  const { body, headers: customHeaders, ...restOptions } = options;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  const headers = new Headers({
    ...defaultHeaders,
    ...(customHeaders as Record<string, string>), // Safely merge headers
  });

  // Remove Content-Type if body is undefined for methods like GET
  if (body === undefined) {
    headers.delete("Content-Type");
  }

  const fullpath = url.startsWith("/")
    ? `${API_PATH}${url}`
    : `${API_PATH}/${url}`;

  try {
    const response = await fetch(fullpath, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined, // Stringify body only if it exists
      ...restOptions,
    });

    // Check for empty response body (e.g., 204 No Content)
    const isNoContent = response.status === 204;
    let data: T;

    if (response.ok && !isNoContent) {
      try {
        // Check if the response expects JSON
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          data = (await response.json()) as T;
        } else {
          // Handle non-JSON responses if necessary, perhaps return null or throw
          // For now, assuming T can be void or null for non-JSON success
          data = undefined as T; // Or handle differently
        }
      } catch (err) {
        // Log or handle JSON parsing errors
        console.error("JSON parsing error:", err);
        throw new Error("Invalid JSON response");
      }
    } else if (response.ok && isNoContent) {
      data = undefined as T; // No content, payload is undefined
    } else {
      // Handle non-ok responses, potentially reading error details from body
      let errorDetail = `HTTP Error: ${response.status}`;
      try {
        const errorBody = await response.json();
        if (
          errorBody &&
          typeof errorBody === "object" &&
          "message" in errorBody
        ) {
          errorDetail = `HTTP Error: ${response.status} - ${errorBody.message}`;
        } else if (errorBody && typeof errorBody === "string") {
          errorDetail = `HTTP Error: ${response.status} - ${errorBody}`;
        }
      } catch (jsonError) {
        // Ignore JSON parsing errors for error responses
        console.error("Failed to parse error response body:", jsonError);
      }
      throw new Error(errorDetail);
    }

    return {
      status: response.status,
      payload: data,
    };
  } catch (error) {
    // Rethrow or wrap the error for better debugging
    console.error("HTTP request failed:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "An unknown error occurred during HTTP request"
    );
  }
};

// Helper types for the HTTP object methods
type GetOptions = Omit<HttpRequestOptions, "body">;
type PostPutDeleteOptions<TBody = unknown> = HttpRequestOptions<TBody>;

const HTTP = {
  get: <T>(url: string, options: GetOptions = {}) =>
    http<T>("GET", url, options),

  post: <T, TBody>(
    url: string,
    body: TBody,
    options: Omit<PostPutDeleteOptions<TBody>, "body"> = {}
  ) => {
    // Pass the body as part of the options object to http
    return http<T, TBody>("POST", url, { ...options, body });
  },

  put: <T, TBody>(
    url: string,
    body: TBody,
    options: Omit<PostPutDeleteOptions<TBody>, "body"> = {}
  ) => {
    // Pass the body as part of the options object to http
    return http<T, TBody>("PUT", url, { ...options, body });
  },

  delete: <T, TBody = unknown>(
    url: string,
    body?: TBody,
    options: Omit<PostPutDeleteOptions<TBody>, "body"> = {}
  ) => {
    // Pass the body as part of the options object to http
    return http<T, TBody>("DELETE", url, { ...options, body });
  },
};

export default HTTP;
