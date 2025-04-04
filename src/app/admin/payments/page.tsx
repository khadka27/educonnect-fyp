import type { Metadata } from "next"
import PaymentsClient from "src/components/admin/payments/payments-client"

export const metadata: Metadata = {
  title: "Payments Management | EduConnect Admin",
  description: "Manage payments on the EduConnect platform",
}

export default function PaymentsPage() {
  return <PaymentsClient />
}

