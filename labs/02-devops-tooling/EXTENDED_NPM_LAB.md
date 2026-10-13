> Archived Node.js extension: the current participant lab is [README.md](README.md). This material uses a separate Node app and local Docker resources.

# Lab 2 — DevOps Tooling

> **Current 90-minute session:** use [EXTENDED_NODE_LAB.md](EXTENDED_NODE_LAB.md) for the selected-tool lab, [EXTENDED_NODE_FILE_GUIDE.md](EXTENDED_NODE_FILE_GUIDE.md) for granular file explanations and [EXTENDED_NODE_FACILITATOR.md](EXTENDED_NODE_FACILITATOR.md) for presenter preparation. Docker and Terraform are hands-on. Kubernetes, Ansible and Prometheus/Grafana are shorter demos. The older extended exercise below remains a reference, not the live session agenda.

- **Session:** 13 October 2026, 18:00–20:00 Malta time
- **Speaker:** Balogun James
- **Level:** Beginner
- **Hands-on time:** About 80 minutes

## What you will do

You will use one application to connect the major parts of a practical DevOps toolchain:

```text
Git → GitHub → npm → GitHub Actions → Docker → health and logs
```

The goal is not to memorize a long catalog. It is to understand the problem each tool solves, the artifact passed to the next stage, and the evidence each tool produces.

## Learning objectives

By the end of the lab, you can:

- map planning, source control, build, test, release, operations, and security tools to the DevOps lifecycle;
- explain why a toolchain is more useful than isolated tools;
- reproduce a build with npm and Docker;
- run and inspect a containerized application;
- use a health endpoint and structured logs as operational signals; and
- describe the roles of Dependabot, infrastructure as code, secrets management, and observability.

## Prerequisites and setup

Required:

- Git 2.40 or later
- Node.js 24 LTS and npm 11+
- Docker Desktop or Docker Engine with Docker Compose
- Your fork from Lab 1, or a fresh clone of this repository

Verify the tools:

```bash
git --version
node --version
npm --version
docker --version
docker compose version
```

Start from a clean `main` branch:

```bash
git switch main
git pull
npm ci
npm run check
```

If you did not complete Lab 1, clone your own fork or follow the [Lab 1 setup steps](../01-cicd-pipelines/README.md#create-your-lab-copy) first.

## Exercise 1 — Map the toolchain (10 minutes)

Open the [DevOps toolchain map](../../resources/toolchain-map.md). For each tool used in this repository, locate:

1. the lifecycle problem it solves;
2. its input;
3. its output or evidence; and
4. who consumes that output next.

**Checkpoint:** you can explain why GitHub Actions does not replace Git, and why Docker does not replace a CI system.

## Exercise 2 — Inspect source-control evidence (10 minutes)

Run:

```bash
git status
git log --oneline --decorate -5
git remote -v
```

Then answer:

- Which branch and commit are checked out?
- Does `origin` point to your fork or the instructor repository?
- Which files are intentionally ignored by `.gitignore`?

Use `git check-ignore -v node_modules dist` after those directories exist to see the exact matching rules.

## Exercise 3 — Compare package installation and build tools (15 minutes)

1. Inspect `package.json` and identify the commands for lint, test, build, and the combined check.
2. Inspect `package-lock.json`. This lock file lets automation install the same dependency graph.
3. Run a clean install and build:

   ```bash
   npm ci
   npm run check
   ```

4. Open `dist/build-info.json`.

`npm` resolves and installs the application's tool dependencies. The build script transforms source into a deployable directory. GitHub Actions orchestrates those tools on a clean hosted runner.

## Exercise 4 — Build a reproducible container image (20 minutes)

1. Read `Dockerfile` from top to bottom. Notice the separate `build` and `runtime` stages.
2. Build the image:

   ```bash
   docker build -t mmaug-pipeline-lab:local .
   ```

3. Confirm the image exists:

   ```bash
   docker image ls mmaug-pipeline-lab
   ```

4. Run it in the background:

   ```bash
   docker run --detach --name mmaug-pipeline-lab --publish 3000:3000 mmaug-pipeline-lab:local
   ```

5. Open <http://localhost:3000>.

**Checkpoint:** the same application works without a local `npm start` process. Docker packaged the runtime and built output together.

## Exercise 5 — Observe health and logs (15 minutes)

Check the application's health endpoint:

```bash
curl http://localhost:3000/health
```

On Windows PowerShell, `curl.exe` guarantees the native curl command:

```powershell
curl.exe http://localhost:3000/health
```

Inspect container state and recent logs:

```bash
docker ps --filter name=mmaug-pipeline-lab
docker inspect --format "{{json .State.Health}}" mmaug-pipeline-lab
docker logs --tail 20 mmaug-pipeline-lab
```

Refresh the browser, run `docker logs --tail 20` again, and find the structured JSON record for the request.

Operational tools build on signals like health, logs, metrics, and traces. A healthy process is not proof that every user journey works, but it is a useful automated signal.

## Exercise 6 — Find the security and maintenance automation (10 minutes)

1. Open `.github/dependabot.yml`.
2. Identify the two package ecosystems it monitors.
3. Open your fork's **Insights → Dependency graph → Dependabot** settings. Enable the available alerts and security updates only if you are comfortable doing so on your fork.
4. Review the workflow's `permissions` blocks. Explain why the validation job needs only read access while the deployment job needs Pages and identity-token write access.

Never put a token in source code, `Dockerfile`, workflow YAML, an issue, or a screenshot. Real delivery systems use a secret store and short-lived workload identities where possible.

## Tool-selection discussion

Use these questions when evaluating a new DevOps tool:

1. What problem and team boundary does it address?
2. Can it integrate through a versioned file, API, or standard artifact?
3. What credentials and permissions does it need?
4. What evidence does it produce when it succeeds or fails?
5. What will it cost to adopt, operate, secure, and replace?

Popular is not the same as appropriate. Start with the workflow and constraints, then select the smallest toolset that provides reliable feedback.

## Evidence of completion

Save these in your personal bootcamp notes:

- the `docker image ls` entry for your image;
- the healthy response from `/health`;
- one structured request log;
- one sentence connecting four tools in the chain; and
- one security improvement you would make before a production release.

## Stretch exercises

1. Use `docker compose up --build --detach`, then compare `docker compose ps` with the earlier Docker commands.
2. Add a second health assertion to `test/pipeline.test.mjs` or a lightweight smoke-test script.
3. Research one tool in each of these categories and add it to your own notes: infrastructure as code, secret management, metrics/tracing, and software supply-chain security.

## Cleanup

Stop and remove the lab container and image:

```bash
docker rm --force mmaug-pipeline-lab
docker image rm mmaug-pipeline-lab:local
```

If you used Compose instead:

```bash
docker compose down --rmi local
```

Also stop any local `npm start` process with `Ctrl+C`. This lab creates no Azure resources or paid cloud services. Your GitHub fork, Pages site, and workflow artifacts can be retained for your portfolio; follow [Lab 1 cleanup](../01-cicd-pipelines/README.md#cleanup) if you prefer to remove them.
