import { Metadata } from "next";

async function fetchUserData(userId: string) {
  const res = await fetch(`/api/user/${userId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("User not found");
  }

  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: { userId: string };
}): Promise<Metadata> {
  const userData = await fetchUserData(params.userId);

  return {
    title: userData.name || "User Profile",
  };
}
