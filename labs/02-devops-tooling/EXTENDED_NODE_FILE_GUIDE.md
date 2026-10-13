> Archived Node.js extension: the current participant lab is [README.md](README.md). This material uses a separate Node app and local Docker resources.

# File formats explained

The complete files here run the project. Slides split them into teaching excerpts. YAML is a format, not a universal schema. Each tool defines the meaning of its own fields.

## Dockerfile

| Instruction | Meaning here |
| --- | --- |
| `FROM node:24-alpine` | Base image containing Node.js. `24-alpine` is a tag. |
| `WORKDIR /app` | Working directory for later instructions and startup. |
| `COPY app/server.mjs app/index.html ./` | Copy these two files into the image. |
| `ENV PORT=3000` | Default environment value. Runtime configuration can override it. |
| `EXPOSE 3000` | Document the port. It does not publish a host port. |
| `USER node` | Run the app as the base image's non-root user. |
| `CMD ["node", "server.mjs"]` | Default startup command, with arguments in JSON-array syntax. |

Dockerfile is **not YAML**. `.dockerignore` excludes everything except the two app files and build recipe. The app uses Node's standard library, so it needs no npm install. `docker build` makes an image. `dotnet build` compiles a .NET project. The commands do different work.

VMs typically have a guest OS/kernel above a hypervisor. Containers share their host kernel. On Windows/macOS, Docker Desktop runs Linux containers in a Linux VM. Avoid fixed claims that VMs always use GB, containers always use MB, or every container starts in seconds.

The CLI is a client that sends requests through the Docker API. The daemon manages images, containers, networks and volumes. A registry distributes images. Our local image does not need a registry. `build` creates an image, `run` creates/starts a container, `stop` stops it, `start` starts that same container and `rm` removes it. `tag`, `push`, `pull`, `save` and `load` concern images. This lab uses a versioned Dockerfile, not `docker commit` as its normal build process.

## Terraform HCL

HCL uses named blocks, braces and `argument = value`. These `.tf` files are **not YAML**.

| Part | Meaning |
| --- | --- |
| `terraform`, `required_version` | CLI compatibility settings. |
| `required_providers` | Plugin source and pinned version. Here it is Docker, not an Azure provider. |
| `provider "docker" {}` | API connection. `DOCKER_CONTEXT` chooses our local context. |
| `data "docker_image" "app"` | Read an image already on the host. It does not create/pull it. |
| `resource "docker_network" "lab"` | Create/manage the lab network. |
| `resource "docker_container" "app"` | Create/manage the app container. |
| `data.docker_image.app.id` | Reference the existing image ID. |
| `env` | Runtime environment input. Changing it replaces this container. |
| `ports.internal` | App port inside the container. |
| `ports.external`, `ports.ip` | Browser-facing host port and bind address. `127.0.0.1` is local-only. |
| `networks_advanced.name` | Connect the app to the network. The reference creates a dependency. |
| `variable`, `type`, `default` | An input's name, type and fallback value. |
| `validation` | Restrict the port to the declared range. |
| `var.app_message`, `${...}` | Read the variable and insert its value into a string. |
| `output` | Display the resulting local URL. |

`init` installs plugins. `plan` compares configuration, observations and state. `apply` performs approved changes. `destroy` removes managed resources after review. State records object identity/ownership and may contain secrets. The lock file records plugin selections/checksums. Do not confuse them.

Ansible's optional `message.auto.tfvars.json` is an automatically loaded **JSON variable file**. It supplies `app_message`, while HCL still defines the resources. Docker API access is powerful, so use the local teaching context.

## Kubernetes YAML

Indentation nests fields. `key: value` sets a field. `-` starts a list item. Use spaces rather than tabs.

| Deployment field | Meaning |
| --- | --- |
| `apiVersion: apps/v1` | API group/version for this object. |
| `kind: Deployment` | Resource type to create. |
| `metadata.name`, `namespace` | Object name and lab namespace. |
| `spec` | Desired configuration. |
| `replicas: 2` | Maintain two Pods through the Deployment's ReplicaSet. |
| `selector.matchLabels` | Labels identifying the Deployment's Pods. |
| `template` | Recipe for each Pod. |
| `template.metadata.labels` | Pod labels, which must match the selector. |
| `containers` | List of containers inside each Pod. We have one. |
| `image` | Image name/tag to run. |
| `imagePullPolicy: Never` | Use the node's local image. Load it into kind first. |
| `env.name`, `env.value` | Literal environment input for the message. |
| `containerPort` | Document the app port. This alone does not expose it. |
| `readinessProbe.httpGet` | Check `/health` before treating this Pod as ready for Service traffic. It does not restart the container. |
| `resources.requests`, `limits` | Scheduling requests and runtime upper limits. `50m` is 0.05 CPU. `32Mi` is 32 mebibytes. |

| Service field | Meaning |
| --- | --- |
| `apiVersion: v1`, `kind: Service` | A Service in the core API. |
| `selector.app` | Match the Deployment's Pod label. |
| `port: 80` | Service port inside the cluster. |
| `targetPort: 3000` | App port on selected Pods. |
| `type: ClusterIP` | Internal cluster access. Port-forward supplies temporary local browser access. |

`kubectl apply` sends desired objects to the API server. Controllers reconcile them. The scheduler assigns Pods to nodes. A worker's kubelet works with a runtime such as containerd. **Control plane** replaces the older “master” label. Modern Kubernetes does not require Docker Engine. `env.value` is literal: Kubernetes does not automatically expand `$SOME_ENV` in a YAML file.

## Ansible YAML and Jinja

| Part | Meaning |
| --- | --- |
| `inventory.ini` | Target hosts, with group `local` and a local connection. This is INI, not YAML. |
| `- name` | Descriptive name of this play. A playbook is a list of plays. |
| `hosts: local` | Inventory group to target, here localhost inside the controller. |
| `gather_facts: false` | Skip system-information collection. |
| `vars.app_message` | Value to insert in the template. |
| `tasks` | Ordered operations. |
| `ansible.builtin.template` | Module to render a Jinja template into a file. |
| `src`, `dest` | Input template and output path. `playbook_dir` anchors the output path. |
| `mode: "0644"` | Quoted permissions in the Linux controller context. |
| `{{ app_message | to_json }}` | Jinja placeholder with safe JSON encoding. |

The result is a Terraform input file. Repeating the same playbook leaves its content unchanged. Ansible has no mandatory graphical UI. The slide visual explains this workflow and does not pretend to be Ansible Automation Platform.

## Prometheus YAML and PromQL

| Part | Meaning |
| --- | --- |
| `global.scrape_interval: 5s` | Default collection frequency. |
| `scrape_configs` | List of scrape jobs. |
| `job_name` | Label identifying these targets. |
| `metrics_path` | HTTP endpoint to collect, here `/metrics`. |
| `static_configs.targets` | Targets reachable from Prometheus. |
| `mmaug-tooling-tf:3000` | Container name/internal port on the shared network. It is not localhost inside Prometheus. |

The app emits text measurements. `# HELP` describes a metric, `# TYPE` declares counter/gauge, and the next line supplies a value. **PromQL** queries stored data. `tooling_requests_total` reads the counter. `up{job="tooling-web"}` measures scrape success.

## Grafana provisioning and dashboard JSON

Grafana has several formats, not one universal “Grafana YAML”.

| Part | Meaning |
| --- | --- |
| Datasource YAML | Configure where Grafana queries measurements. |
| `apiVersion: 1` | Grafana provisioning version, not a Kubernetes API version. |
| `datasources`, `name`, `uid` | Data-source list, display name and stable ID. |
| `type: prometheus` | Plugin type. |
| `access: proxy` | Grafana's server queries the datasource. |
| `url: http://prometheus:9090` | Internal Docker-network address, not the browser's localhost address. |
| `isDefault`, `editable` | Default selection and whether UI edits are allowed. |
| Dashboard provider YAML | Points to the dashboard-file directory. |
| `tooling.json` | Complete dashboard JSON: title, UID, refresh, time range and panels. |
| `targets[].expr` | PromQL query for each panel. |
| `datasource.uid` | Connect a panel to the provisioned datasource. |
| `gridPos` | Panel layout coordinates. |

Compose YAML starts the two services, publishes localhost ports and mounts config read-only. `networks.lab.external` means Terraform already owns the network. Stop Compose before destroying it.

## Official references

- [Dockerfile](https://docs.docker.com/build/concepts/dockerfile/)
- [Terraform local Docker tutorial](https://developer.hashicorp.com/terraform/tutorials/docker-get-started)
- [Docker provider](https://registry.terraform.io/providers/kreuzwerker/docker/4.6.0/docs)
- [Kubernetes Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes Service](https://kubernetes.io/docs/concepts/services-networking/service/)
- [Ansible playbooks](https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_intro.html)
- [Prometheus config](https://prometheus.io/docs/prometheus/latest/configuration/configuration/)
- [Grafana provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/)
