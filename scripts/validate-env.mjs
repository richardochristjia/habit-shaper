const required = ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"];

const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length > 0) {
  console.error(`Missing required environment values: ${missing.join(", ")}`);
  process.exit(1);
}

try {
  new URL(process.env.BETTER_AUTH_URL);
} catch {
  console.error("BETTER_AUTH_URL must be an absolute URL.");
  process.exit(1);
}

if (process.env.BETTER_AUTH_SECRET.length < 32) {
  console.error("BETTER_AUTH_SECRET must contain at least 32 characters.");
  process.exit(1);
}
