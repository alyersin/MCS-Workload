export async function POST(request) {
  const { userSecret } = await request.json();

  const base = process.env.SECRET_KEY_BASE;
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);

  const expectedKey = `${base}${month}${year}`;
  const isValid = userSecret.trim() === expectedKey;

  return Response.json({ valid: isValid });
}
