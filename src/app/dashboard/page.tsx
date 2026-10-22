import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";

async function DashboardContent() {
  const { isAuthenticated, userId, redirectToSignIn } = await auth();

  if (!isAuthenticated) return redirectToSignIn();

  return <h1>Welcome! Your user ID is {userId}</h1>;
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
