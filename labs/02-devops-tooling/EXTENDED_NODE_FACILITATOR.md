> Archived Node.js extension: the current participant lab is [README.md](README.md). This material uses a separate Node app and local Docker resources.

# Presenter preparation and 90-minute script

## Teaching goal

Every tool has a clear job in one small application. Say: **“Docker packages the app. Terraform describes the container we want. Kubernetes demonstrates another runtime. Ansible prepares a configuration value. Prometheus collects measurements. Grafana displays them.”**

Git/GitHub already has its own session. Recap repository history and file ownership for three minutes only. No Jenkins, cloud provisioning, database, registry login or GitHub Actions deep dive is needed.

## Preparation, before learners join

1. Review [EXTENDED_NODE_LAB.md](EXTENDED_NODE_LAB.md) and [EXTENDED_NODE_FILE_GUIDE.md](EXTENDED_NODE_FILE_GUIDE.md). Use the revised presentation beside them.
2. Publish or distribute the updated lab files before telling learners to pull them. Local files are not automatically available on GitHub.
3. Confirm Docker uses Linux containers and a **local** context. Save existing learner changes rather than forcing Git operations.
4. Check ports 3000, 3001, 3002 and 9090. Pause unrelated demos without deleting their data.
5. Rehearse Docker build/run, Terraform create/change and cleanup. Read every plan before applying it.
6. Pre-download/build these images from the lab directory:

   ```text
   docker build -t mmaug-tooling:1.0 .
   docker build -t mmaug-ansible:lab ansible/
   docker compose -f monitoring/compose.yaml pull
   ```

7. Install kind/kubectl before the session and create the dedicated local cluster. kind is only the cluster setup helper, not another lesson:

   ```text
   kind create cluster --name mmaug-tooling
   kind load docker-image mmaug-tooling:1.0 --name mmaug-tooling
   kubectl --context kind-mmaug-tooling get nodes
   ```

   If that exact cluster already exists, inspect it and reuse it only if it belongs to this lab. Do not overwrite kubeconfig entries or delete other clusters. Installing a cluster during the talk can consume the Kubernetes timebox.

8. Run `terraform init` beforehand to cache the provider. Commit the provider lock file, not the cache or state. Set `DOCKER_CONTEXT` to the correct local Docker context in the terminal running Terraform.
9. Ansible runs inside the prebuilt Linux controller container. This avoids a native Windows Ansible installation. Rehearse the bind mount command with PowerShell quotes.
10. For a clean opening, stop the monitoring stack, destroy only the lab Terraform objects and remove the generated **non-secret** message variable file after inspection. Keep the image caches and prepared cluster. Otherwise the first plan may not show the expected two creations.

Do not promise every participant will complete all installations in 90 minutes. Pair anyone without Docker/Terraform with someone whose setup works.

## Live running order

### 0–5: one project and the map

Show the final app and the interconnected diagram. Click **Send one request**. Say: “The code is deliberately tiny. We are learning the tools around it.” Point out the two runtime routes. Terraform manages the Docker container. Kubernetes manages its separate Deployment. Do not draw Terraform as creating the Kubernetes cluster in this lab.

### 5–8: Git/GitHub recap

Show the lab folder in the repository. Point to Dockerfile, HCL, YAML and JSON. Run `git status` and `git log --oneline -3`. Say: “We version the recipes so another person can repeat them.” No branching exercise is needed.

### 8–33: Docker

1. Use the VM/container diagram to explain the kernel boundary. Linux containers on Docker Desktop still use a Linux VM on Windows/macOS.
2. Explain CLI, API and daemon. The registry is optional for our locally built app.
3. Read the seven Dockerfile instructions. Emphasize `EXPOSE` documents, while `-p` publishes.
4. Demonstrate build, pause, let learners build. Demonstrate run, pause, check the page.
5. Stop/start the container. Ask: “Did the image disappear?” It did not.
6. Remove only `mmaug-tooling-manual`, keeping the image and freeing port 3000.

**Checkpoint:** image exists, container runs, browser works. If pull/download delays occur, explain with the prepared app and let the learner continue after the session.

### 33–58: Terraform

1. Explain HCL and read provider/data/resource blocks. Show that this provider calls the local Docker API, not Azure.
2. Distinguish the existing image data source from the two resources Terraform owns.
3. Read variables, references and output. Explain state and provider lock file without opening sensitive state on screen.
4. Run init, validate, plan. Ask learners to name the two objects before anyone approves.
5. Apply, type `yes`, inspect the page. Change `app_message` with the same CLI input for plan/apply. Watch the replacement and changed message.
6. Repeat the identical plan and explain the no-change result. CLI input values are not saved as permanent defaults.

**Checkpoint:** Terraform owns the lab network/container and learners can explain plan versus apply. Avoid `-auto-approve` during teaching.

### 58–73: Kubernetes

1. Use the control-plane/worker graphic. A Pod is Kubernetes' smallest deployable unit and may hold multiple containers. This one holds one.
2. Explain apiVersion, kind, metadata, spec, replicas, selector and Pod template. Follow matching labels.
3. Explain image, env, containerPort and Service port/targetPort. Readiness is a traffic-readiness check, not a restart trigger.
4. Load the image, apply the files, show two Pods and port-forward. Open the app at 3002.
5. Scale to three and reapply the file to restore two. Keep the browser demo short.

**Fallback:** if the local cluster is unavailable, use the verified YAML and diagram. Do not spend ten minutes changing cluster configuration live. Do not switch to a production context.

### 73–78: Ansible

Show the graphical file flow first. Read hosts, vars, tasks and the template module. Run the prebuilt controller, open the generated JSON and let Terraform apply the message. Say: “Ansible prepared this input. Terraform made the container change.” Run the playbook again only if time allows, showing unchanged template content.

No SSH, VM configuration or Ansible Automation Platform setup is required.

### 78–85: Prometheus/Grafana

Start the pre-pulled stack. Read the seven-line scrape configuration and the datasource YAML. Show the network target name and explain why `localhost` inside Prometheus would mean Prometheus itself.

Open the dashboard. Generate a few app requests and wait 5–10 seconds. Point to the rising request counter/graph. Explain scrape success versus application correctness and counter reset after container replacement. Use the prepared dashboard screenshot if a browser or scrape fails.

### 85–90: recap and cleanup

Ask six short questions:

- Which tool built the image?
- Which tool described the Docker container?
- Which tool maintained the Kubernetes Pods?
- Which tool wrote the message input?
- Which tool collected metrics?
- Which tool drew the graph?

Answers: Docker, Terraform, Kubernetes, Ansible, Prometheus, Grafana. Refer learners to the cleanup section. Stop monitoring before removing Terraform's network. Do not prune Docker or delete unrelated namespaces.

## Why the source screenshots were adapted

The supplied screenshots inform the VM/container, engine, image lifecycle and Kubernetes visuals. The revised diagrams use the session's branding and correct three common misconceptions: fixed GB/MB/startup comparisons, “master” terminology and Docker as a mandatory Kubernetes runtime. YAML values do not automatically expand shell variables. Ansible's graphic is explanatory, while the Grafana screenshot comes from the actual lab dashboard.
