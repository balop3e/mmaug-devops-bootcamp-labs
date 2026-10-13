# Facilitator guide: .NET, Docker, and Azure Terraform

Use [README.md](README.md) as the learner's step-by-step guide and [SESSION90.md](SESSION90.md) for timings.

## Before participants join

1. Publish or distribute the updated lab before asking participants to clone or pull it. Local changes are not automatically on GitHub.
2. Confirm the starter at `dotnet-lab/mmaugWebApp.web` includes the corrected CSS and all `wwwroot/lib` assets, with no `bin`, `obj`, Dockerfile, or Terraform solution supplied.
3. Confirm .NET 9 SDK, Git, Docker Linux containers, Terraform, and Azure CLI are available.
4. Prepare an Azure subscription with permission for resource groups and App Service. If learners share a subscription, assign a distinct suffix to every participant's resource names.
5. Confirm Microsoft.Web registration and Free-tier eligibility/capacity in the chosen region. Do not silently select a paid plan.
6. Pre-download `mcr.microsoft.com/dotnet/sdk:9.0` and `mcr.microsoft.com/dotnet/aspnet:9.0` if downloads would interrupt the session.
7. Rehearse in your own workspace: `dotnet run`, Docker build/run, and Terraform init/plan/apply. Keep the learner starter clear of completed recipes.
8. Check ports 5074 and 8080. Stop only your own practice processes and containers.

## Present the steps

First show the application running from `dotnet run` at localhost:5074. Keep the terminal running; explicitly stop it before demonstrating Docker.

Explain restore, build, and publish with the manual commands in the guide. Then ask participants to create the Dockerfile and .dockerignore. Show the SDK stage preparing the app and the runtime stage receiving the published files.

Build and run on localhost:8080. Ask participants to check the styled Home and Privacy pages. Explain image versus running container and host port versus container port. Compose is optional and follows the direct Docker commands.

Next sign in with Azure CLI, select the intended subscription, and create the three simple Terraform files. Use a different app/resource-group/plan name per participant. Show the first plan's three additions before anyone types `yes`.

After apply, show the resource group, plan, and web app in Portal. Run plan again to demonstrate no changes. Explain that Terraform created the hosting destination; uploading the .NET app belongs to the later CI/CD step.

Explain state briefly: it connects the resource blocks to the real Azure resources. Explain authentication briefly: subscription chooses where; Azure CLI login identifies who; Azure permissions authorize what.

## Completion evidence

Ask participants for:

- Their app on localhost:5074.
- The same app in Docker on localhost:8080.
- Their Azure resource group containing the App Service plan and web app.
- The repeated Terraform plan reporting no changes.

Review `terraform destroy` and targeted Docker cleanup. If apply partially fails, keep the state and use it to clean up the resources that were created.

## Optional material

Kubernetes, Ansible, and Prometheus/Grafana still use the separate Node example. Use [EXTENDED_NODE_LAB.md](EXTENDED_NODE_LAB.md), [EXTENDED_NODE_FILE_GUIDE.md](EXTENDED_NODE_FILE_GUIDE.md), and [EXTENDED_NODE_FACILITATOR.md](EXTENDED_NODE_FACILITATOR.md) only for that extension. Its local Docker provider is not the Azure exercise.
