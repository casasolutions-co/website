const ACCOUNT_ID  = process.env.CLOUDFLARE_ACCOUNT_ID!;
const DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID!;
const API_TOKEN   = process.env.CLOUDFLARE_API_TOKEN!;

export async function d1Run(sql: string, params: unknown[] = []): Promise<unknown> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    },
  );

  const json = await res.json() as { success: boolean; errors?: { message: string }[] };
  if (!json.success) {
    throw new Error(json.errors?.[0]?.message ?? 'D1 query failed');
  }
  return json;
}
