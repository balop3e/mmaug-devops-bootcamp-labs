> Archived Node.js extension: the current participant lab is [README.md](README.md). This material uses a separate Node app and local Docker resources.

# DevOps Tooling: one small application

**Balogun James · 13 October 2026 · 90 minutes**

Docker and Terraform are the main learner exercises. Kubernetes is a presenter demonstration. Ansible and Prometheus/Grafana are lighter demos. Git/GitHub gets a recap because the bootcamp already covered it.

## The project

A tiny Node.js app displays a message, hostname and request count. It exposes `/health` and `/metrics`. There are no npm dependencies, database or cloud subscription requirements.

| Tool | Its actual job | File |
| --- | --- | --- |
| Git/GitHub | Version the app and configuration | This repository |
| Docker | Package the app and run its image | `Dockerfile` |
| Terraform | Create a local Docker network and container | `terraform/*.tf` |
| Kubernetes | Run the same image as two Pods | `kubernetes/*.yaml` |
| Ansible | Generate a message input for Terraform | `ansible/playbook.yml` |
| Prometheus | Collect numeric measurements from the app | `monitoring/prometheus.yml` |
| Grafana | Display those measurements | Provisioning YAML and dashboard JSON |

Terraform and Kubernetes use **separate runtime routes**. Terraform does not create this Kubernetes cluster. Prometheus monitors the Terraform-created container in this lab. Ansible generates a Terraform input, and Terraform changes the container.

## Session timing

| Minutes | Activity |
| --- | --- |
| 0–5 | Project and connected tools |
| 5–8 | Git/GitHub recap |
| 8–33 | Docker explanation and guided exercise |
| 33–58 | Terraform explanation and guided exercise |
| 58–73 | Kubernetes explanation and demonstration |
| 73–78 | Ansible demonstration |
| 78–85 | Prometheus/Grafana demonstration |
| 85–90 | Recap, questions and cleanup |

Installation and downloads happen **before** the 90 minutes. If time slips, preserve Docker and Terraform and shorten the demos.

## Before the session

Learners need Git, Docker running **Linux containers**, Terraform 1.9 or later, a browser and an editor. Node.js is optional outside Docker. Use the presenter's supplied copy of the repository. The presenter prepares `kubectl`, `kind`, the local cluster and demo images separately.

From the repository root:

```text
cd labs/02-devops-tooling
git status
docker version
terraform version
docker context show
```

Docker should print Client and Server information. Check that ports 3000, 3001, 3002 and 9090 are free. Preserve existing Git changes. Use a **local** Docker context, never a production one. Configure Terraform to use that same context:

**Windows PowerShell:**

```powershell
$env:DOCKER_CONTEXT = (docker context show)
```

**Bash:**

```bash
export DOCKER_CONTEXT="$(docker context show)"
```

## 1. Docker (25 minutes including explanation)

Open `Dockerfile`. Explain each instruction using [EXTENDED_NODE_FILE_GUIDE.md](EXTENDED_NODE_FILE_GUIDE.md).

From the lab directory:

```text
docker build -t mmaug-tooling:1.0 .
docker image ls mmaug-tooling
```

`build` packages the app. `-t` gives it a name and tag. `.` supplies the build context. **Expected:** an image named `mmaug-tooling` with tag `1.0`. It is a package, not a running process.

```text
docker run -d --name mmaug-tooling-manual -p 127.0.0.1:3000:3000 mmaug-tooling:1.0
docker ps --filter name=mmaug-tooling-manual
```

`-d` runs in the background. `--name` labels this container. `-p` maps your computer's port 3000 to the container's port 3000. `127.0.0.1` restricts access to your computer.

Open <http://localhost:3000>. Press **Send one request**. Inspect the message, hostname and count.

```text
docker logs --tail 5 mmaug-tooling-manual
docker stop mmaug-tooling-manual
docker start mmaug-tooling-manual
```

**Expected:** stop makes the site unavailable, start makes it available. The image remains. The in-memory counter resets on process restart.

Remove **only** your disposable manual container before Terraform takes over port 3000:

```text
docker rm -f mmaug-tooling-manual
```

Keep the image. Do not manually create Terraform's container.

## 2. Terraform (25 minutes)

Open `main.tf` and `variables.tf`. Terraform uses **HCL**, not YAML. Identify `terraform`, `required_providers`, `provider`, `data`, `resource`, `variable` and `output`.

```text
cd terraform
terraform init
terraform fmt -check
terraform validate
terraform plan
```

`init` downloads the plugin. `fmt` checks formatting. `validate` checks consistency. `plan` previews changes without creating the container.

**Expected first plan:** two resources to add, the lab network and container. The data source reads the image you already built. The Docker provider talks to the local Docker API. No cloud access key is needed.

```text
terraform apply
```

Read the plan. Type `yes` only if it names the lab network/container. Open the printed `app_url`. **Expected:** **Hello from Terraform**, served by `mmaug-tooling-tf`.

Change one input:

```text
terraform plan '-var=app_message=I changed the app with Terraform'
terraform apply '-var=app_message=I changed the app with Terraform'
```

Review and confirm the replacement. Refresh the browser. Then repeat the same plan command. **Expected:** no changes for identical input values.

Command-line variables apply only to that invocation. A later plain apply returns to defaults unless a variable file supplies a value. Container replacement resets the counter. Keep `.terraform.lock.hcl` in Git, but keep state, plan files and `.terraform/` out. State records ownership and may contain sensitive data.

## 3. Kubernetes (15-minute presenter demo)

Use a **prepared local kind cluster named `mmaug-tooling`**, not a production context. From the lab directory (leave `terraform` with `cd ..`):

```text
kind load docker-image mmaug-tooling:1.0 --name mmaug-tooling
kubectl --context kind-mmaug-tooling apply -f kubernetes/namespace.yaml
kubectl --context kind-mmaug-tooling apply -f kubernetes/
kubectl --context kind-mmaug-tooling -n mmaug-tooling rollout status deployment/tooling-web
kubectl --context kind-mmaug-tooling -n mmaug-tooling get pods
kubectl --context kind-mmaug-tooling -n mmaug-tooling port-forward service/tooling-web 3002:80
```

Leave port-forward running and open <http://localhost:3002>. **Expected:** two ready Pods and **Hello from Kubernetes**. Port-forward normally selects one backing Pod, so repeated refreshes do not demonstrate balancing across Pods.

Read the Deployment and Service files. Match `app: tooling-web` across selectors and Pod labels. `containerPort` alone does not expose the application. The Service and port-forward provide the local browser route.

In another terminal:

```text
kubectl --context kind-mmaug-tooling -n mmaug-tooling scale deployment/tooling-web --replicas=3
kubectl --context kind-mmaug-tooling -n mmaug-tooling get pods
kubectl --context kind-mmaug-tooling apply -f kubernetes/deployment.yaml
```

Scaling changes live desired state to three. The file still says two. Reapplying it restores two. Explain control plane, API server, worker, Pod, Deployment and Service. Modern Kubernetes uses a runtime such as containerd, and does not require Docker Engine.

## 4. Ansible (5-minute presenter demo)

Run the prebuilt Linux controller container from the lab directory.

**PowerShell:**

```powershell
docker run --rm -v "${PWD}:/work" mmaug-ansible:lab -i ansible/inventory.ini ansible/playbook.yml
```

**Bash:**

```bash
docker run --rm -v "$PWD:/work" mmaug-ansible:lab -i ansible/inventory.ini ansible/playbook.yml
```

Ansible targets `localhost` inside the controller container. No SSH server is needed. The bind mount lets its template write `terraform/message.auto.tfvars.json` in this project.

Read the generated file, then:

```text
cd terraform
terraform plan
terraform apply
cd ..
```

Refresh the app: **Hello from Ansible**. Ansible wrote an input. Terraform changed the container. Repeating the same playbook should report no template change. Explain `hosts`, `vars`, `tasks`, `template`, `src`, `dest` and the Jinja placeholder. The sample stores only a harmless message.

## 5. Prometheus/Grafana (7-minute presenter demo)

Keep the Terraform app/network running. From the lab directory:

```text
docker compose -f monitoring/compose.yaml up -d
```

Open <http://localhost:9090>, inspect the Targets page (or Status / Target health), and query:

```promql
tooling_requests_total
```

**Expected:** target `tooling-web` is UP. Open <http://localhost:3001/d/mmaug-tooling> for the provisioned Grafana dashboard. No login is required in this localhost-only teaching setup.

Press **Send one request** several times. Wait 5–10 seconds. The counter and graph increase. Prometheus collects the metric. Grafana queries Prometheus and draws it.

`up = 1` means scrape success, not proof that every app feature works. The counter excludes `/metrics` scrapes but includes other requests such as `/health`. Each process has its own counter, which resets on restart. Anonymous Grafana viewer access is a demo convenience, not production security.

## Evidence and cleanup

Keep an image listing, a working page, a Terraform plan and an explanation of each tool's role. Presenter demos add ready Pods, the generated Ansible input and a responsive Grafana graph.

Stop port-forward with `Ctrl+C`. Stop monitoring **before** Terraform removes the shared network:

```text
docker compose -f monitoring/compose.yaml down
kubectl --context kind-mmaug-tooling delete namespace mmaug-tooling
cd terraform
terraform plan -destroy
terraform destroy
cd ..
docker image rm mmaug-tooling:1.0
```

Review destruction and confirm only this lab's objects. Do not run a broad Docker prune or delete another namespace. Delete a cluster only if created solely for this session:

```text
kind delete cluster --name mmaug-tooling
```

The downloaded demo/controller images may remain cached. Source files remain. Do not delete state as a cleanup shortcut. To repeat Terraform's default message, inspect and remove the generated non-secret `terraform/message.auto.tfvars.json`, or change its value.

## Troubleshooting

| Symptom | First check |
| --- | --- |
| Docker connection failure | Is Docker running with the correct local context and Linux containers? |
| Port allocated | Remove only the manual lab container, or choose a free `external_port`. |
| Terraform image missing | Build the image on the same Docker context first. |
| `ErrImageNeverPull` | Load the image into the named kind cluster. |
| Kubernetes connection refused | Start the prepared local cluster. Do not switch to production. |
| Prometheus target DOWN | Check the Terraform container, network and `/metrics`. |
| Grafana no data | Wait for collection, then check target health and datasource URL. |

Read [EXTENDED_NODE_FILE_GUIDE.md](EXTENDED_NODE_FILE_GUIDE.md) for file keys and [EXTENDED_NODE_FACILITATOR.md](EXTENDED_NODE_FACILITATOR.md) for presenter rehearsal.
