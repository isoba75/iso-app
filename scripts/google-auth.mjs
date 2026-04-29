/**
 * One-time Google OAuth token getter for iso-app.
 * Reads credentials from ~/gtasks-mcp/gcp-oauth.keys.json
 * Run: node ~/Documents/iso-app/scripts/google-auth.mjs
 */
import http from "http";
import { readFileSync } from "fs";
import { homedir } from "os";
import { URL } from "url";
import { exec } from "child_process";

const credsPath = `${homedir()}/gtasks-mcp/gcp-oauth.keys.json`;
let raw;
try {
  raw = JSON.parse(readFileSync(credsPath, "utf8"));
} catch {
  console.error(`\n❌ Could not read ${credsPath}`);
  console.error("Make sure gtasks-mcp is set up first.\n");
  process.exit(1);
}

const { client_id, client_secret } = raw.installed ?? raw.web;
const REDIRECT_URI = "http://127.0.0.1:3001";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/tasks.readonly",
  "https://www.googleapis.com/auth/gmail.readonly",
].join(" ");

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.searchParams.set("client_id", client_id);
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", SCOPES);
authUrl.searchParams.set("access_type", "offline");
authUrl.searchParams.set("prompt", "consent");

console.log("\n→ Opening browser for Google authorization...");
exec(`open "${authUrl.toString()}"`);
console.log("  (If browser doesn't open, visit the URL manually)");
console.log("\nWaiting for callback...\n");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.end(`<h2>Error: ${error}</h2>`);
    server.close();
    console.error(`\n❌ Authorization denied: ${error}\n`);
    return;
  }
  if (!code) {
    res.end("<h2>No code received.</h2>");
    return;
  }

  res.end("<html><body style='font-family:sans-serif;padding:2rem'><h2>✅ Authorized!</h2><p>You can close this tab. Check your terminal.</p></body></html>");
  server.close();

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      client_id,
      client_secret,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();

  if (tokens.refresh_token) {
    console.log("✅ Success! Add these 3 vars to Vercel → iso-app → Settings → Environment Variables:\n");
    console.log(`GOOGLE_CLIENT_ID=${client_id}`);
    console.log(`GOOGLE_CLIENT_SECRET=${client_secret}`);
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log("\nThen go to Vercel → Deployments → Redeploy.\n");
  } else {
    console.error("\n❌ No refresh_token in response:", JSON.stringify(tokens, null, 2));
    console.log("\nIf the app was already authorized, revoke it first:");
    console.log("→ myaccount.google.com/permissions → find 'iso-app' → Remove");
    console.log("→ Then re-run this script.\n");
  }
});

server.listen(3001, "127.0.0.1", () => {
  console.log("Listening on http://127.0.0.1:3001 ...");
});
