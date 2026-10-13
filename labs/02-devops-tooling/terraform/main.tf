terraform {
  required_version = ">= 1.9, < 2.0"
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "4.6.0"
    }
  }
}

provider "docker" {}

# Read the image you built with Docker. Terraform does not build or pull it.
data "docker_image" "app" {
  name = "mmaug-tooling:1.0"
}

resource "docker_network" "lab" {
  name = "mmaug-tooling-lab"
}

resource "docker_container" "app" {
  name  = "mmaug-tooling-tf"
  image = data.docker_image.app.id
  env   = ["APP_MESSAGE=${var.app_message}"]

  ports {
    internal = 3000
    external = var.external_port
    ip       = "127.0.0.1"
  }

  networks_advanced {
    name = docker_network.lab.name
  }
}

output "app_url" {
  value = "http://localhost:${var.external_port}"
}
