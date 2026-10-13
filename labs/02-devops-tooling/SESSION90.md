# DevOps Tooling: 90-minute session

**Balogun James · 13 October 2026**

Follow the [participant lab](README.md) for the complete commands and file contents. This session matches the .NET, Docker, and Azure Terraform demonstrations.

| Minutes | Activity | Participant checkpoint |
| --- | --- | --- |
| 0–10 | Verify tools, download source, run `dotnet run` | Styled app at localhost:5074 |
| 10–20 | Explain restore, build, publish, and Docker stages | Identify what is compiled and what runs |
| 20–45 | Create Dockerfile and .dockerignore; build and run | Same app at localhost:8080 |
| 45–55 | Sign in to Azure and select a subscription | Correct subscription and App Service registration |
| 55–75 | Create providers.tf, main.tf, outputs.tf; init, plan, apply | Three Azure resources created |
| 75–85 | Inspect Portal, repeat plan, explain state and authentication | No changes; explain why Azure CLI login works |
| 85–90 | Review cleanup and completion evidence | Know how to remove only the practice resources |

Install tools and download images before the session where possible. Participants create their own recipes; the starter contains application code only.

Docker runs the .NET application locally. Terraform creates Azure hosting infrastructure; the app code is uploaded in a later CI/CD exercise.

Compose is optional. Kubernetes, Ansible, and monitoring use the separate [Node extension](EXTENDED_NODE_LAB.md), with its [file guide](EXTENDED_NODE_FILE_GUIDE.md) and [presenter notes](EXTENDED_NODE_FACILITATOR.md). They are not prerequisites for this beginner lab.
