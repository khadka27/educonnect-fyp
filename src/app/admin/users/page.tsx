import type { Metadata } from "next";
import UsersClient from "src/components/admin/users/users-client";

export const metadata: Metadata = {
  title: "User Management | EduConnect Admin",
  description: "Manage users on the EduConnect platform",
};

export default function UsersPage() {
  return <UsersClient />;
}
