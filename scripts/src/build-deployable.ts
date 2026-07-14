// Runs `pnpm run build` only for workspace artifacts that have a production
// service configured in their artifact.toml (i.e. artifacts that actually get
// deployed). Design/preview-only artifacts (e.g. the mockup sandbox "Canvas"),
// which have no [services.production] block, are skipped so the deployment
// build doesn't fail on preview-only env requirements (like the mockup
// sandbox's PORT/BASE_PATH checks) that are never satisfied outside its dev
// workflow.
import { readFile } from "node:fs/promises";
import { readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const workspaceRoot = path.resolve(import.meta.dirname, "../..");
const artifactsDir = path.join(workspaceRoot, "artifacts");

async function hasProductionService(artifactDir: string): Promise<boolean> {
  const tomlPath = path.join(artifactDir, ".replit-artifact", "artifact.toml");
  if (!existsSync(tomlPath)) return false;
  const contents = await readFile(tomlPath, "utf8");
  // Matches [services.production] or [services.production.*] table headers.
  return /^\[services\.production(\.[^\]]+)?\]/m.test(contents);
}

async function getPackageName(artifactDir: string): Promise<string | null> {
  const pkgPath = path.join(artifactDir, "package.json");
  if (!existsSync(pkgPath)) return null;
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  return typeof pkg.name === "string" ? pkg.name : null;
}

function run(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: workspaceRoot,
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

async function main() {
  const entries = readdirSync(artifactsDir, { withFileTypes: true }).filter(
    (entry) => entry.isDirectory(),
  );

  const deployablePackages: string[] = [];

  for (const entry of entries) {
    const artifactDir = path.join(artifactsDir, entry.name);
    if (!(await hasProductionService(artifactDir))) continue;
    const packageName = await getPackageName(artifactDir);
    if (packageName) deployablePackages.push(packageName);
  }

  if (deployablePackages.length === 0) {
    console.log("[build-deployable] No artifacts with a production service found; nothing to build.");
    return;
  }

  console.log(
    `[build-deployable] Building deployable artifacts: ${deployablePackages.join(", ")}`,
  );

  const filterArgs = deployablePackages.flatMap((name) => ["--filter", name]);
  await run("pnpm", [...filterArgs, "--if-present", "run", "build"]);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
