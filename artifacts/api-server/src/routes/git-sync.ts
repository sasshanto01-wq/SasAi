import { Router, type IRouter } from "express";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stat, unlink } from "node:fs/promises";
import { SyncGitBody, SyncGitResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const execAsync = promisify(exec);

const REPO_URL = "https://github.com/sasshanto01-wq/SasAi.git";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");

async function run(cmd: string) {
  return execAsync(cmd, {
    cwd: REPO_ROOT,
    env: { ...process.env },
    maxBuffer: 10 * 1024 * 1024,
  });
}

async function clearStaleLock() {
  const lockPath = path.join(REPO_ROOT, ".git", "index.lock");
  try {
    const s = await stat(lockPath);
    const ageMs = Date.now() - s.mtimeMs;
    if (ageMs > 15_000) {
      await unlink(lockPath).catch(() => {});
    }
  } catch {
    // no lock file
  }
}

async function runWithLockRetry(cmd: string, attempts = 5) {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await run(cmd);
    } catch (e) {
      lastErr = e;
      const err = e as { stderr?: string; message?: string };
      const msg = (err.stderr || err.message || "");
      if (/index\.lock/.test(msg) || /unable to create.*lock/i.test(msg)) {
        await new Promise((r) => setTimeout(r, 400 + i * 300));
        await clearStaleLock();
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

function shellEscape(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

router.post("/sync", async (req, res) => {
  const pushedAt = new Date().toISOString();
  try {
    const body = SyncGitBody.parse(req.body ?? {});
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      const response = SyncGitResponse.parse({
        ok: false,
        status: "failed",
        pushedAt,
        error: "GITHUB_TOKEN is not configured on the server",
      });
      res.status(500).json(response);
      return;
    }

    await run(`git config user.email "agent@replit.local"`).catch(() => {});
    await run(`git config user.name "Replit Agent"`).catch(() => {});

    const { stdout: branchOut } = await run(`git rev-parse --abbrev-ref HEAD`);
    const branch = branchOut.trim() || "main";

    await runWithLockRetry(`git add -A`);

    const { stdout: statusOut } = await run(`git status --porcelain`);
    let commitSha: string | undefined;
    let commitMessage: string | undefined;
    let status: "pushed" | "nothing_to_commit" = "pushed";

    if (statusOut.trim().length > 0) {
      const defaultMsg = `Sync from dashboard at ${pushedAt}`;
      commitMessage = (body.message?.trim() || defaultMsg).slice(0, 500);
      await runWithLockRetry(`git commit -m ${shellEscape(commitMessage)}`);
      const { stdout: shaOut } = await run(`git rev-parse HEAD`);
      commitSha = shaOut.trim();
    } else {
      status = "nothing_to_commit";
    }

    const remoteUrl = `https://x-access-token:${token}@github.com/sasshanto01-wq/SasAi.git`;
    const pushCmd = `git push ${shellEscape(remoteUrl)} HEAD:${branch}`;
    let pushDetails = "";
    try {
      const { stdout, stderr } = await run(pushCmd);
      pushDetails = (stdout + "\n" + stderr).trim();
    } catch (e) {
      const err = e as { stderr?: string; stdout?: string; message?: string };
      const sanitized = (err.stderr || err.stdout || err.message || "git push failed")
        .replace(token, "***");
      const response = SyncGitResponse.parse({
        ok: false,
        status: "failed",
        pushedAt,
        commitSha,
        commitMessage,
        error: sanitized.slice(0, 1000),
      });
      res.status(500).json(response);
      return;
    }

    const response = SyncGitResponse.parse({
      ok: true,
      status,
      pushedAt,
      commitSha,
      commitMessage,
      details: `Pushed to ${REPO_URL} (${branch}).${pushDetails ? " " + pushDetails.slice(0, 400) : ""}`,
    });
    res.json(response);
  } catch (error) {
    const err = error as Error;
    console.error("Git sync error:", err);
    const sanitized = (err.message || "Unknown error").replace(
      process.env.GITHUB_TOKEN || "__none__",
      "***"
    );
    const response = SyncGitResponse.parse({
      ok: false,
      status: "failed",
      pushedAt,
      error: sanitized.slice(0, 1000),
    });
    res.status(500).json(response);
  }
});

export default router;
