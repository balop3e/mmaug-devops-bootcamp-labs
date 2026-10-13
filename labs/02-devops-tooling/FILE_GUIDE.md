# The files you create in this lab

Use the [participant guide](README.md) to create these files inside `dotnet-lab`. Only the .NET application's source is supplied there initially.

## Application source

| File or folder | Purpose |
| --- | --- |
| `mmaugWebApp.web.csproj` | Declares the .NET 9 web project. |
| `Program.cs` | Starts the web server, serves static files, and configures page routes. |
| `Controllers/` and `Views/` | Handle page requests and produce the HTML. |
| `wwwroot/` | CSS, JavaScript, Bootstrap, and other browser assets. |
| `Properties/launchSettings.json` | Local launch settings: `dotnet run` uses port 5074. |

## Dockerfile

Dockerfile is a build recipe, not YAML.

| Instruction in this lab | Simple meaning |
| --- | --- |
| `FROM .../sdk:9.0 AS build` | Start a stage with the .NET build tools. |
| `WORKDIR /src` | Choose the stage's working directory. |
| `COPY ...csproj ...` | Copy the project definition first. |
| `RUN dotnet restore ...` | Resolve dependencies during image construction. |
| `COPY mmaugWebApp.web/ ...` | Copy the app source and browser assets. |
| `RUN dotnet publish ...` | Compile and prepare deployment files. |
| `-c Release` | Use the Release build configuration. |
| `-o /app/publish` | Put the deployment files here inside the build stage. |
| `--no-restore` | Reuse the earlier restore. Publishing still builds. |
| `/p:UseAppHost=false` | Run the DLL with `dotnet` rather than creating a separate executable launcher. |
| `FROM .../aspnet:9.0 AS runtime` | Start the final stage with the ASP.NET runtime. |
| `ENV ASPNETCORE_HTTP_PORTS=8080` | Configure the app's container HTTP port. |
| `ENV ASPNETCORE_ENVIRONMENT=Production` | Choose the Production environment. |
| `EXPOSE 8080` | Document the port; `docker run -p` provides the host connection. |
| `COPY --from=build /app/publish .` | Copy the published app into the runtime stage. |
| `USER $APP_UID` | Use the image's non-root application user. |
| `ENTRYPOINT ["dotnet", "...dll"]` | Start the published app when a container runs. |

`mcr.microsoft.com` is Microsoft Container Registry, also called Microsoft Artifact Registry. The image name contains a registry, repository, and tag.

The SDK builds the app; the runtime runs it. Two stages produce one final application image. `RUN` executes during the build; `ENTRYPOINT` executes when the container starts.

## .dockerignore and .gitignore

`.dockerignore` excludes local files from the Docker build context. We exclude `bin`, `obj`, and `publish` because Docker makes fresh build output; it still includes the source and `wwwroot`.

`.gitignore` controls which untracked local files Git normally considers for version control. The repository includes the app's vendor CSS/JavaScript and ignores generated .NET build files.

## Optional compose.yaml

Compose is YAML that records how to build and run the app. `services.web` describes one web service. `build` selects the Dockerfile and context; `image` names the image; `ports` connects host port 8080 to container port 8080.

`docker compose up --build -d` builds and starts it in the background. The participant guide also shows the direct `docker build` and `docker run` commands.

## Terraform: three small files

Terraform uses HCL: blocks with braces and `argument = value`.

| File | Purpose |
| --- | --- |
| `providers.tf` | Select the Azure plugin and your subscription; use the Azure CLI sign-in. |
| `main.tf` | Describe the resource group, Free App Service plan, and web app. |
| `outputs.tf` | Display the web app's address after creation. |

In `resource "azurerm_resource_group" "demo"`, the first string is the resource type and `demo` is a label used in Terraform references. The `name` property is the actual name visible in Azure Portal.

`azurerm_resource_group.demo.name` connects resources to the group. `azurerm_service_plan.demo.id` connects the app to its plan. Terraform follows these references; the filenames are not an execution sequence.

`F1` is the Free hosting tier. Leave `always_on = false` and `use_32_bit_worker = true` for this plan. `dotnet_version = "9.0"` matches the supplied app.

## Terraform commands and authentication

| Command | Meaning |
| --- | --- |
| `init` | Install the provider and initialize the working directory. |
| `plan` | Preview the changes. |
| `apply` | Perform the reviewed changes. |
| `output` | Display saved output values. |
| `destroy` | Remove the resources Terraform manages, after review. |

The subscription ID chooses **where** to deploy. `az login` establishes **who** is deploying. Azure permissions determine **what** that identity can do. Terraform uses that CLI session, so this interactive lab does not need a client secret.

## Generated files

- `.terraform/`: downloaded plugins; Git ignored.
- `.terraform.lock.hcl`: selected provider version and checksums; commit with your own Terraform code.
- `terraform.tfstate`: Terraform's record linking your code to Azure resource IDs. Keep it between runs; Git ignored because state can contain sensitive values.

The Azure resources are a future CI/CD destination. Terraform in this lab creates infrastructure; it does not upload the application's code.
