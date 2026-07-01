export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div style={{ padding: 32 }}>
      <h1>Client portal</h1>
      <p>Access token: {token}</p>
      <p>Project status and client-facing updates will live here.</p>
    </div>
  );
}
