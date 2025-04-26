

import { notFound } from "next/navigation";
import UserProfile from "src/components/profile/user-profile";

// Make the component async and extract userId early
export default async function UserProfilePage({
  params,
}: {
  readonly params: { readonly userId: string };
}) {
  // Extract the userId from params and validate it
  const userId = params.userId;

  // Basic validation to prevent crashes
  if (!userId || typeof userId !== "string") {
    return notFound();
  }

  // Render the UserProfile component with the calm, eye-pleasing theme
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-900">
      <UserProfile userId={userId} />
    </div>
  );
}
