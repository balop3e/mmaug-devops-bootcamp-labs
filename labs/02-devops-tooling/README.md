# Lab 2: run a .NET app, containerize it, and create Azure resources

**Beginner lab · DevOps Tooling · Balogun James**

You will use the same ASP.NET Core application demonstrated in class:

1. Run the app locally at **http://localhost:5074**.
2. Create your own Dockerfile and run it at **http://localhost:8080**.
3. Create three simple Terraform files and deploy a resource group, a Free App Service plan, and a web app to Azure.

The repository supplies the application source in `dotnet-lab/mmaugWebApp.web`. You create the Docker and Terraform files by following this guide. Begin in `dotnet-lab`; the older Node examples elsewhere in this lab folder are optional [extensions](EXTENDED_NODE_LAB.md).

## 1. Prepare your tools

Install these before the lab:

| Tool | What you use it for | Installation |
| --- | --- | --- |
| Git | Download the lab | [Git](https://git-scm.com/downloads) |
| .NET 9 SDK | Run and build the supplied app | [.NET 9 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/9.0) |
| Docker Desktop or Engine | Build and run the container | [Docker](https://docs.docker.com/get-started/get-docker/) |
| Terraform 1.9 or later | Create Azure resources from code | [Terraform](https://developer.hashicorp.com/terraform/install) |
| Azure CLI | Sign in to your Azure account | [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) |
| Editor and browser | Create files and check results | VS Code or another plain-text editor |

You need an Azure subscription with permission to create resource groups and App Service resources. Use your own subscription or the one assigned by the facilitator. Docker can be completed without Azure.

Start Docker Desktop and select **Linux containers**. Check the tools in a terminal:

```text
git --version
dotnet --list-sdks
docker version
terraform version
az version
```

**Checkpoint:** the SDK list includes 9.0; Docker reports both Client and Server. Resolve missing tools before proceeding.

The commands below work in PowerShell. Basic Git, .NET, Docker, and Terraform commands also work in Bash; the editor steps use the same file contents.

## 2. Download the supplied app

If this is your first time using the repository:

```text
git clone https://github.com/balop3e/mmaug-devops-bootcamp-labs.git
cd mmaug-devops-bootcamp-labs
```

If you already have a clone, open its root folder and run `git pull`. Keep any existing work; resolve Git's messages rather than resetting your files.

From the repository root:

```text
cd labs/02-devops-tooling/dotnet-lab
```

This is your **lab working directory**. Initially it contains:

```text
dotnet-lab/
  mmaugWebApp.web/
    mmaugWebApp.web.csproj
    Program.cs
    Controllers/
    Views/
    Properties/launchSettings.json
    wwwroot/
```

The project includes its Bootstrap CSS and JavaScript files. Do not copy the instructor's build folders, subscription ID, Terraform state, or completed recipes.

## 3. Run the app locally first

From `dotnet-lab`, enter the project directory:

```text
cd mmaugWebApp.web
dotnet run
```

Wait for:

```text
Now listening on: http://localhost:5074
```

Open **http://localhost:5074**. You should see the styled Welcome page. Click Privacy and return to Home.

**Keep the terminal running while you browse.** Ctrl+C stops the web server.

**Checkpoint:** both pages load with CSS. You have proved that the application works before adding Docker.

Stop it with Ctrl+C, then return to the lab working directory:

```text
cd ..
```

### Connect this to restore, build, and publish

These are the manual .NET preparation steps, still from `dotnet-lab`:

```text
dotnet restore mmaugWebApp.web/mmaugWebApp.web.csproj
dotnet build mmaugWebApp.web/mmaugWebApp.web.csproj -c Release --no-restore
dotnet publish mmaugWebApp.web/mmaugWebApp.web.csproj -c Release -o publish --no-build
```

- `restore` resolves dependencies.
- `build` compiles the code.
- `publish` prepares the files to deploy, including `wwwroot`.
- Plain `dotnet run` automatically performs the preparation it needs and starts the app.

These manual commands help explain the Dockerfile. Docker will build its own copy inside the SDK image.

## 4. Create your Dockerfile

In your editor, create a file called **`Dockerfile`**, with no extension, directly inside `dotnet-lab`. Paste:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY mmaugWebApp.web/mmaugWebApp.web.csproj mmaugWebApp.web/
RUN dotnet restore mmaugWebApp.web/mmaugWebApp.web.csproj

COPY mmaugWebApp.web/ mmaugWebApp.web/
RUN dotnet publish mmaugWebApp.web/mmaugWebApp.web.csproj \
    -c Release -o /app/publish --no-restore /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
COPY --from=build /app/publish .
USER $APP_UID
ENTRYPOINT ["dotnet", "mmaugWebApp.web.dll"]
```

The SDK stage restores, builds, and publishes. `dotnet publish` builds automatically, so the Dockerfile does not need a separate `dotnet build` command.

The runtime stage receives the published files and starts the DLL. `mcr.microsoft.com` is Microsoft's image registry. Two stages produce one final application image.

Read the short [file guide](FILE_GUIDE.md) for each instruction.

## 5. Create .dockerignore

Create **`.dockerignore`** beside your Dockerfile and paste:

```text
.git
**/bin
**/obj
**/publish
**/.vs
**/node_modules
infra
.env
.env.*
```

This prevents local build output and unrelated files from being sent to the Docker builder. It leaves the source and `wwwroot` available. Docker creates fresh publish output inside the build stage; that output is copied into the final image.

Your directory should now contain:

```text
dotnet-lab/
  Dockerfile
  .dockerignore
  mmaugWebApp.web/
```

## 6. Build and run the Docker image

Run from `dotnet-lab`, where your Dockerfile is located:

```text
docker build -t mmaug-bootcamp:local .
docker image ls mmaug-bootcamp
docker run -d --name mmaug-bootcamp-lab -p 127.0.0.1:8080:8080 mmaug-bootcamp:local
docker ps --filter name=mmaug-bootcamp-lab
```

The final `.` is the build context: your current directory. `-t` names the image. `-d` runs the container in the background. `-p` connects localhost port 8080 to the container's port 8080.

Open **http://localhost:8080**. Check Home and Privacy again. The local `dotnet run` process is stopped, but the same app works inside Docker.

Inspect the logs:

```text
docker logs --tail 20 mmaug-bootcamp-lab
```

**Checkpoint:** the container is running and the page is styled. Container HTTP uses port 8080; local `dotnet run` uses 5074.

### Optional: use Docker Compose

Compose saves your build and run settings in a file. To try it, first remove your manual container to free port 8080:

```text
docker stop mmaug-bootcamp-lab
docker rm mmaug-bootcamp-lab
```

Create **`compose.yaml`** inside `dotnet-lab`:

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    image: mmaug-bootcamp:local
    ports:
      - "127.0.0.1:8080:8080"
```

Then run:

```text
docker compose up --build -d
docker compose ps
docker compose logs web
```

Open **http://localhost:8080** again. Compose builds the image, starts the web container, creates its network, and applies the port mapping.

## 7. Sign in to your own Azure environment

From your lab terminal:

```text
az login
az account list --query "[].{Name:name,SubscriptionId:id}" -o table
```

Complete the browser sign-in. Choose the subscription supplied for the lab or your own subscription. Replace the placeholder below:

```text
az account set --subscription "YOUR-SUBSCRIPTION-ID"
az account show --query "{Name:name,SubscriptionId:id}" -o table
az provider show --namespace Microsoft.Web --query registrationState -o tsv
```

**Checkpoint:** the selected subscription is correct and Microsoft.Web says `Registered`. If it is not registered, enable App Service once:

```text
az provider register --namespace Microsoft.Web --wait
```

If your account cannot register it or create resources, ask the facilitator to provide the required access.

Terraform will use this Azure CLI login. Your subscription ID selects where to deploy; the login and Azure permissions authorize the deployment. You do not need to enter a client secret for this interactive exercise.

## 8. Create the three Terraform files

Inside `dotnet-lab`, create and enter a folder named **`infra`**:

```text
mkdir infra
cd infra
```

Create each file below in that folder. Use your editor; do not run the HCL file contents as terminal commands.

### providers.tf: connect Terraform to Azure

Paste this, replacing `YOUR-SUBSCRIPTION-ID` with the ID you selected in Step 7:

```hcl
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "= 4.81.0"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id                 = "YOUR-SUBSCRIPTION-ID"
  resource_provider_registrations = "none"
}
```

AzureRM is the plugin that lets Terraform work with Azure.

### main.tf: describe the resources

Paste this. Replace **`yourname` in all three names** with your own lowercase name and some digits, for example `alex731`. The web app name must be globally unique. A personal suffix also keeps participant resource groups separate when sharing a subscription.

```hcl
resource "azurerm_resource_group" "demo" {
  name     = "rg-mmaug-tf-yourname"
  location = "eastus"
}

resource "azurerm_service_plan" "demo" {
  name                = "asp-mmaug-tf-yourname"
  resource_group_name = azurerm_resource_group.demo.name
  location            = azurerm_resource_group.demo.location
  os_type             = "Linux"
  sku_name            = "F1"
}

resource "azurerm_linux_web_app" "demo" {
  name                = "mmaug-tf-yourname-2026"
  resource_group_name = azurerm_resource_group.demo.name
  location            = azurerm_resource_group.demo.location
  service_plan_id     = azurerm_service_plan.demo.id
  https_only          = true

  site_config {
    always_on         = false
    use_32_bit_worker = true

    application_stack {
      dotnet_version = "9.0"
    }
  }
}
```

These three blocks create:

- A resource group: groups your resources.
- An App Service plan: supplies hosting capacity. `F1` selects Free.
- A web app: the website resource, configured for .NET 9.

Leave the two Free-plan settings as shown. References such as `azurerm_service_plan.demo.id` connect the resources and give Terraform the creation order.

### outputs.tf: print the result

```hcl
output "web_app_url" {
  value = "https://${azurerm_linux_web_app.demo.default_hostname}"
}
```

Terraform reads the three `.tf` files together. Their names help organize the lesson.

## 9. Preview and deploy

Run from **`dotnet-lab/infra`**:

```text
terraform init
terraform fmt
terraform validate
terraform plan
```

- `init` downloads the Azure plugin.
- `fmt` formats your files.
- `validate` checks the configuration.
- `plan` previews the changes.

**Checkpoint:** validation succeeds, and the plan says **`3 to add, 0 to change, 0 to destroy`**. Check your subscription, personal names, region, and Free tier.

Then deploy:

```text
terraform apply
```

Review the plan and type **`yes`**. Wait for **`Apply complete! Resources: 3 added`**.

```text
terraform output
```

This exercise creates hosting resources. It does **not** upload the .NET app or your Docker image; deploying application code is the next CI/CD step. The new Azure site may show its default page, rather than your local Welcome page.

## 10. Prove Terraform created the resources

1. Open [Azure Portal](https://portal.azure.com).
2. Select the same subscription used in the lab.
3. Open **Resource groups**, then your `rg-mmaug-tf-...` group.
4. Show the App Service plan and web app inside it.
5. Return to the terminal and run `terraform plan` again.

**Checkpoint:** Terraform reports **No changes**. Your written configuration matches the resources it manages in Azure.

`terraform.tfstate` is Terraform's record connecting your code to the actual Azure resources. Keep it between runs. The repository ignores state and local caches; it allows the provider lock file to be committed.

Save three pieces of completion evidence: the local page on 5074, the Docker page on 8080, and your Azure resource group with its plan and web app.

## 11. Clean up your practice resources

From `dotnet-lab/infra`:

```text
terraform plan -destroy
terraform destroy
```

Confirm that only your three demo resources are listed. Type `yes` to delete them. Keep the state file until Terraform has completed cleanup.

Return to `dotnet-lab`:

```text
cd ..
```

If you used Compose:

```text
docker compose down
```

If you used only the manual container:

```text
docker stop mmaug-bootcamp-lab
docker rm mmaug-bootcamp-lab
```

The source and your recipes remain, so you can repeat the lab. Do not use broad Docker cleanup commands.

## Common problems

| Problem | What to do |
| --- | --- |
| `dotnet run` cannot find a project | Run it inside `dotnet-lab/mmaugWebApp.web`. |
| MSB1009 with `--project` | You may have repeated the project folder name; use plain `dotnet run` inside the project. |
| Local app starts and stops | Keep its terminal open. Ctrl+C stops it; a shutdown line alone does not identify the trigger. |
| Docker cannot connect | Start Docker Desktop, use Linux containers, and check `docker version`. |
| Docker build cannot find the project | Build from `dotnet-lab`; check Dockerfile spelling and the COPY paths. |
| Port 8080 is occupied | Inspect `docker ps`. Stop your earlier lab container, or use `-p 127.0.0.1:8081:8080` and browse port 8081. |
| CSS is missing | Keep the supplied `wwwroot/lib` files. The recipe must publish and copy the full app output. |
| Terraform reports missing subscription/login | Replace the provider placeholder and run `az login`. |
| Azure web app name is taken | Add unique digits to your app name, then plan again. |
| Azure quota, policy, or F1 capacity blocks creation | Ask the facilitator. Do not change to paid hosting automatically. |
| Apply created only some resources before an error | Keep state, fix the reported problem, and plan again. Use `terraform destroy` for cleanup. |

## Official references

- [.NET container images](https://learn.microsoft.com/en-us/dotnet/core/docker/container-images)
- [Docker build context and .dockerignore](https://docs.docker.com/build/concepts/context/)
- [Terraform Azure CLI authentication](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/guides/azure_cli)
- [Azure App Service with Terraform](https://learn.microsoft.com/en-us/azure/app-service/provision-resource-terraform)
