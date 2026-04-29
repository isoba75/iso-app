const TOKEN = process.env.GITHUB_TOKEN!;
const OWNER = process.env.GITHUB_REPO_OWNER!;
const REPO  = process.env.GITHUB_REPO_NAME ?? "iso-life";

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

export async function readFile(path: string): Promise<string> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`,
    { headers, next: { revalidate: 300 } } // cache 5 min
  );
  if (!res.ok) throw new Error(`GitHub read failed: ${path} (${res.status})`);
  const data = await res.json();
  return Buffer.from(data.content, "base64").toString("utf-8");
}

export async function writeFile(
  path: string,
  content: string,
  message: string
): Promise<void> {
  // Get current SHA if file exists (required for updates)
  let sha: string | undefined;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`,
      { headers }
    );
    if (res.ok) {
      const data = await res.json();
      sha = data.sha;
    }
  } catch {}

  const body: Record<string, string> = {
    message,
    content: Buffer.from(content).toString("base64"),
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`,
    { method: "PUT", headers, body: JSON.stringify(body) }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub write failed: ${path} — ${err}`);
  }
}

export async function listFiles(path: string): Promise<string[]> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`,
    { headers, next: { revalidate: 300 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data.map((f: { name: string }) => f.name) : [];
}
