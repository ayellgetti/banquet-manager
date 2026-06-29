import { clearAuthSession, getAccessToken, getRefreshToken, setAuthSession } from "@/lib/authStorage";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: string[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = { success: false; message: string; errors?: string[] };

export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_URL?.trim();
  return base && base.length > 0 ? base.replace(/\/$/, "") : "http://localhost:3000";
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthSession();
    return null;
  }

  const res = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearAuthSession();
    return null;
  }

  const body = (await res.json()) as ApiSuccess<{
    accessToken: string;
    refreshToken: string;
  }>;

  const user = JSON.parse(localStorage.getItem("banquet.user") ?? "null");
  if (user) {
    setAuthSession({
      accessToken: body.data.accessToken,
      refreshToken: body.data.refreshToken,
      user,
    });
  }

  return body.data.accessToken;
}

async function getValidAccessToken(): Promise<string | null> {
  return getAccessToken();
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, headers = {} } = options;
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const buildInit = (token: string | null): RequestInit => {
    const initHeaders: Record<string, string> = { ...headers };
    if (body !== undefined) {
      initHeaders["Content-Type"] = "application/json";
    }
    if (auth && token) {
      initHeaders.Authorization = `Bearer ${token}`;
    }
    return {
      method,
      headers: initHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    };
  };

  let token = auth ? await getValidAccessToken() : null;
  let res = await fetch(url, buildInit(token));

  if (auth && res.status === 401 && getRefreshToken()) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    token = await refreshPromise;
    if (token) {
      res = await fetch(url, buildInit(token));
    }
  }

  let parsed: ApiSuccess<T> | ApiFailure;
  try {
    parsed = (await res.json()) as ApiSuccess<T> | ApiFailure;
  } catch {
    throw new ApiError("Invalid response from API", res.status);
  }

  if (!res.ok || parsed.success === false) {
    if (res.status === 401 && auth) {
      clearAuthSession();
    }
    const message = parsed.success === false ? parsed.message : "Request failed";
    const errors = parsed.success === false ? parsed.errors : undefined;
    throw new ApiError(message, res.status, errors);
  }

  return parsed.data;
}

export async function publicApiRequest<T>(
  path: string,
  body: unknown,
  options: { headers?: Record<string, string> } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const leadKey = import.meta.env.VITE_LEAD_API_KEY?.trim();
  if (leadKey) {
    headers["X-Lead-Api-Key"] = leadKey;
  }

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const parsed = (await res.json()) as ApiSuccess<T> | ApiFailure;
  if (!res.ok || parsed.success === false) {
    const message = parsed.success === false ? parsed.message : "Request failed";
    throw new ApiError(message, res.status, parsed.success === false ? parsed.errors : undefined);
  }

  return parsed.data;
}
