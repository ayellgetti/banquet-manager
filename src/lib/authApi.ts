import { apiRequest } from "@/lib/apiClient";
import { clearAuthSession, setAuthSession, type StoredUser } from "@/lib/authStorage";

export type LoginResult = {
  accessToken: string;
  refreshToken: string;
  user: StoredUser;
};

export async function login(username: string, password: string): Promise<LoginResult> {
  const data = await apiRequest<LoginResult>("/auth/login", {
    method: "POST",
    body: { username, password },
    auth: false,
  });

  setAuthSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
  });

  return data;
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem("banquet.refreshToken");
  try {
    if (refreshToken) {
      await apiRequest("/auth/logout", {
        method: "POST",
        body: { refreshToken },
        auth: false,
      });
    }
  } finally {
    clearAuthSession();
  }
}
