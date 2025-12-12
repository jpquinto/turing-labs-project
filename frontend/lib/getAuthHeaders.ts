import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

export async function getAuthHeaders() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${session.accessToken}`,
  };
}

