# MMAUG DevOps Bootcamp Labs

[![CI/CD Pipeline](https://github.com/balop3e/mmaug-devops-bootcamp-labs/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/balop3e/mmaug-devops-bootcamp-labs/actions/workflows/ci-cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-2ea44f.svg)](LICENSE)

Public, beginner-friendly labs for Balogun James's sessions in the **MMAUG 30-Day AI and DevOps Fundamentals Bootcamp**.

**[View the live sample application](https://balop3e.github.io/mmaug-devops-bootcamp-labs/)**

| Date and time (Malta) | Session | Lab |
| --- | --- | --- |
| 5 October 2026, 18:00–20:00 | Fundamentals of DevOps CI/CD Pipelines | [Live browser lab](LIVE_LAB.md) · [Full follow-on lab](labs/01-cicd-pipelines/README.md) · [Facilitator runbook](FACILITATOR_RUNBOOK.md) |
| 13 October 2026, 90-minute teaching session | DevOps Tooling | [Participant lab: .NET, Docker and Azure Terraform](labs/02-devops-tooling/README.md) · [Session plan](labs/02-devops-tooling/SESSION90.md) · [File guide](labs/02-devops-tooling/FILE_GUIDE.md) · [Presenter guide](labs/02-devops-tooling/FACILITATOR.md) |

The CI/CD lab uses an interactive pipeline dashboard: learners validate it, watch GitHub Actions build it and deploy it to GitHub Pages. The tooling lab supplies the .NET application used in class. Participants run it locally, write their own Dockerfile, and create a resource group and Azure App Service resources with simple Terraform files.

## Learning objectives

By completing the CI/CD session, you will be able to:

1. Explain continuous integration, continuous delivery, and continuous deployment.
2. Trace a change through source, test, build, artifact, and deployment stages.
3. Read a GitHub Actions workflow and diagnose a failed automated check.
4. Use a pull request as a quality gate.
5. Deploy a verified static artifact to GitHub Pages.

By completing the tooling session, you will be able to:

1. Map common tools to the DevOps lifecycle.
2. Run the .NET application at localhost:5074.
3. Write a Dockerfile and run the same application at localhost:8080.
4. Write simple Terraform files and create Azure App Service resources.
5. Explain plan, apply, Azure CLI authentication, and Terraform state.

## Prerequisites

Required for the first lab:

- A free [GitHub account](https://github.com/signup)
- Git 2.40 or later
- Node.js 24 LTS and npm
- A modern browser and a code editor such as Visual Studio Code

Additional requirements for the second lab:

- .NET 9 SDK
- Docker Desktop or Docker Engine using Linux containers; Compose is optional
- Terraform 1.9 or later and Azure CLI
- An Azure subscription with permission to create resource groups and App Service resources

The CI/CD lab needs no Azure subscription. The tooling lab's Docker exercise is local; its Terraform exercise uses your own or the facilitator-provided Azure subscription and the F1 Free App Service tier. See the participant guide for setup, verification, and cleanup.

## Quick start

```bash
git clone https://github.com/balop3e/mmaug-devops-bootcamp-labs.git
cd mmaug-devops-bootcamp-labs
npm ci
npm run check
npm start
```

Open <http://localhost:3000>. Press `Ctrl+C` in the terminal to stop the server.

## Repository map

```text
.
├── .github/workflows/ci-cd.yml   # Automated validation and gated Pages deployment
├── LIVE_LAB.md                    # 35-minute browser-only session exercise
├── FACILITATOR_RUNBOOK.md         # Presenter script, timings and recovery guidance
├── labs/
│   ├── 01-cicd-pipelines/        # Day 5 guided lab
│   └── 02-devops-tooling/        # Day 13 guided lab
├── public/                        # Sample application source
├── scripts/build.mjs              # Repeatable build step
├── test/                          # Automated unit tests
├── Dockerfile                     # Multi-stage container build
├── compose.yaml                   # Local container configuration
└── resources/                     # Reference and troubleshooting material
```

## Validation

Run the same quality gate used in continuous integration:

```bash
npm run check
```

A successful run lints the code, runs five tests (the original four plus the small tooling-app test), and produces `dist/`. The workflow stores that directory as a short-lived build artifact.

## Cost and cleanup

The CI/CD lab uses local tools, GitHub Actions on a public repository, and GitHub Pages. The tooling lab creates Azure resources using an F1 Free App Service plan. If your subscription or region cannot create that tier, ask the facilitator before choosing another tier; paid tiers incur charges. GitHub usage remains subject to your account's current limits.

Cleanup instructions are included at the end of each lab. They cover the local Node.js process, generated files, Docker containers and images, GitHub Pages, and optional learner forks.

## Help and conduct

- Start with the [troubleshooting guide](resources/troubleshooting.md).
- Ask questions during the session; copy the exact error message when possible.
- Never paste tokens, passwords, cloud keys, or `.env` contents into an issue or screenshot.
- Participation is governed by the [MMAUG Code of Conduct](https://mmaug.com/code-of-conduct).

## License

Code and written lab material are provided under the [MIT License](LICENSE).
