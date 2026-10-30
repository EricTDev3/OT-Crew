import { requireUser } from "@/lib/require-user";
import { Suspense } from "react";

async function DashboardContent() {
  const user = await requireUser();

  return <h1>Welcome {user.firstName}</h1>;
}

export default function DashboardPage() {
  return (
    <main>
      <Suspense fallback={<p>Loading...</p>}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}
