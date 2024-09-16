# Advanced End-to-End DevSecOps Kubernetes Three-Tier Project using AWS EKS, Jenkins, ArgoCD, Prometheus, and Grafana

## Overview
This project involves the comprehensive deployment of a three-tier application using advanced DevSecOps practices. It utilizes containerization, static code analysis, vulnerability scanning, and Kubernetes orchestration. The project sets up a robust CI/CD pipeline with Jenkins and ArgoCD, automated infrastructure provisioning using Terraform, and incorporates monitoring and visualization with Prometheus and Grafana.

## Tools Used
- **Docker**: Containerization
- **SonarQube**: Code Quality and Security Analysis
- **Trivy**: Container Image Scanning
- **OWASP Dependency Check**: Dependency Vulnerability Scanning
- **Kubernetes**: Container Orchestration
- **Jenkins**: Continuous Integration (CI)
- **ArgoCD**: Continuous Deployment (CD)
- **Prometheus/Grafana**: Monitoring and Visualization

## Table of Contents
1. [Initial Setup](#1-initial-setup)
2. [Setting Up the Application Code](#2-setting-up-the-application-code)
3. [Building and Dockerizing the Application](#3-building-and-dockerizing-the-application)
4. [Launching Jenkins Server Using Terraform](#4-launching-jenkins-server-using-terraform)
5. [Configuring Jenkins](#5-configuring-jenkins)
6. [Setting Up SonarQube](#6-setting-up-sonarqube)
7. [Creating Jenkins Pipelines](#7-creating-jenkins-pipelines)
8. [Deploying EKS Cluster](#8-deploying-eks-cluster)
9. [Configuring AWS Load Balancer Controller](#9-configuring-aws-load-balancer-controller)
10. [Installing and Configuring ArgoCD](#10-installing-and-configuring-argocd)
11. [Setting Up Monitoring with Prometheus and Grafana](#11-setting-up-monitoring-with-prometheus-and-grafana)

---

## 1. Initial Setup

1. **Pick Your Tech Stack:** Choose the frontend and backend technologies. For this guide, we use:
   - **Frontend:** Next.js
   - **Backend:** Python
   - **Database:** PostgreSQL

2. **Create Directory Structure:** Organize your project using the following directory tree:
   ```plaintext
   your-app
   ├── backend
   │   ├── Dockerfile.backend
   │   ├── [Backend Code]
   ├── frontend
   │   ├── Dockerfile.frontend
   │   ├── [Frontend Code]
   ├── Jenkins-Server-TF
   │   ├── [Terraform .tf files]
   │   ├── install.sh
   ├── Jenkins-Pipeline-Code
   │   ├── Jenkinsfile-Backend
   │   ├── Jenkinsfile-Frontend
   ├── Kubernetes-Manifests
   │   ├── Backend
   │   │   ├── deployment.yaml
   │   │   ├── service.yaml
   │   ├── Database
   │   │   ├── deployment.yaml
   │   │   ├── pv.yaml
   │   │   ├── pvc.yaml
   │   │   ├── secrets.yaml
   │   │   ├── service.yaml
   │   ├── Frontend
   │   │   ├── deployment.yaml
   │   │   ├── service.yaml
   │   ├── ingress.yaml
   ```
---
   
## 2. Setting Up the Application Code

1. **Write Backend and Frontend Code:** Create the application code in the `backend` and `frontend` folders.

2. **Run Locally:** Test both the backend and frontend on your local machine using the command line or terminal:
   - For the frontend, use:
     ```bash
     npm run dev
     ```
   - For the backend, use:
     ```bash
     python <backend file>
     ```

3. **Dockerize Both Services:** Create Dockerfiles (`Dockerfile.backend` and `Dockerfile.frontend`) in their respective directories. Use Docker commands or `docker-compose` to run both services simultaneously.

---

## 3. Building and Dockerizing the Application

1. **Build Docker Images:**
   - Use the Dockerfiles you created in the previous step to build the backend and frontend images.
   - Navigate to the `backend` directory and run:
     ```bash
     docker build -t your-backend-image-name -f Dockerfile.backend .
     ```
   - Navigate to the `frontend` directory and run:
     ```bash
     docker build -t your-frontend-image-name -f Dockerfile.frontend .
     ```

2. **Test Docker Containers:** Use Docker commands or `docker-compose` to bring up both services simultaneously:
   - If using `docker-compose`, create a `docker-compose.yml` file and run:
     ```bash
     docker-compose up
     ```
   - If not using `docker-compose`, start each container individually:
     ```bash
     docker run -p 3000:3000 your-frontend-image-name
     docker run -p 5000:5000 your-backend-image-name
     ```

3. **Verify Local Functionality:** Ensure that both containers are up and running without issues before proceeding. Access the frontend and backend using their respective ports to test functionality.

---

## 4. Launching Jenkins Server Using Terraform

1. **Instance Type:** Use `t2.large` for a balanced cost-performance ratio. If resources permit, `t2.2xlarge` can be used for enhanced performance.

2. **Automated Jenkins Setup:**
   - Navigate to the `Jenkins-Server-TF` directory.
   - **Configure AWS CLI:** Run the following command and provide your AWS credentials:
     ```bash
     aws configure
     ```
     Provide the access key ID, secret access key, and default region when prompted.
   - **Deploy Jenkins Server with Terraform:** Use the following commands to launch Jenkins on an Ubuntu EC2 instance:
     ```bash
     terraform init
     terraform validate
     terraform plan -var-file="variables.tfvars"
     terraform apply -var-file="variables.tfvars" -auto-approve
     ```
   - The Terraform files will automatically set up Jenkins, VPC, security groups, and other necessary components.

3. **Wait for Setup to Complete:** Allow time for the EC2 instance to show a "2/2 checks passed" status in the AWS console.

4. **Access Jenkins:** Copy the public IP of the EC2 instance and navigate to: `http://<public-ip>:8080`

5. **Retrieve Jenkins Admin Password:** SSH into the instance and retrieve the admin password using the command below:
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```
---

## 5. Configuring Jenkins

1. **Install Required Plugins:**
   - In the Jenkins dashboard, navigate to `Manage Jenkins > Manage Plugins > Available Plugins`.
   - Search for and install the following plugins:
     - `AWS Credentials`
     - `Pipeline: AWS Steps`
     - `Docker`
     - `Docker Commons`
     - `Docker Pipeline`
     - `SonarQube Scanner`
     - `OWASP Dependency-Check`
     - `NodeJS`
     - `Eclipse Temurin installer`
   - After selecting the plugins, click `Install without restart` and wait for the installation to complete.

2. **Restart Jenkins:** Once all plugins are installed, restart Jenkins by clicking the `Restart Jenkins when installation is complete and no jobs are running` option.

3. **Set Up Jenkins Credentials:**
   - In the Jenkins dashboard, go to `Manage Jenkins > Manage Credentials`.
   - Click on `System > Global credentials (unrestricted) > Add Credentials`.
   - Add the following credentials:
     - **DockerHub:** 
       - Kind: Username with password
       - Username: `rsduran`
       - Password: DockerHub token
       - ID: `docker`
     - **GitHub:** 
       - Kind: Username with password
       - Username: `rsduran`
       - Password: GitHub personal access token
       - ID: `github`
     - **AWS:** 
       - Kind: AWS Credentials
       - Access Key ID: `<your-access-key-id>`
       - Secret Access Key: `<your-secret-access-key>`
       - ID: `aws-key`
     - **SonarQube:** 
       - Kind: Secret text
       - Secret: SonarQube token (generated in the next step)
       - ID: `sonar-token`

---

## 6. Setting Up SonarQube

1. **Run SonarQube in Docker:**
   - The `docker run` command to start the SonarQube server is already included in the `install.sh` script. When the Jenkins server starts, wait a few minutes for the SonarQube container to be up and running.
   - **Check SonarQube Status:** 
     - Access SonarQube by navigating to:
       ```
       http://<jenkins-server-public-ip>:9000
       ```
     - If SonarQube is not running, use the following command to start it manually:
       ```bash
       docker run -d --name sonarqube -p 9000:9000 sonarqube
       ```
   - The default login credentials are:
     - Username: `admin`
     - Password: `admin`
   - You will be prompted to change the default password. Do this before proceeding.

2. **Generate SonarQube Token:**
   - In the SonarQube dashboard, go to `Administration > Security > Users`.
   - Click on your user profile and go to the `Security` tab.
   - Click `Generate Tokens` and name the token (e.g., `sonar-token`).
   - Copy the generated token and save it, as this will be used later in Jenkins.

3. **Configure SonarQube Webhook:** 
   - In the SonarQube dashboard, navigate to `Administration > Configuration > Webhooks`.
   - Click `Create` to add a new webhook.
   - Name the webhook (e.g., `Jenkins Webhook`) and set the URL to:
     ```
     http://<jenkins-server-public-ip>:8080/sonarqube-webhook/
     ```
   - Ensure the URL ends with a `/` to avoid webhook errors.

4. **Set Up SonarQube in Jenkins:**
   - Go to the Jenkins dashboard, then `Manage Jenkins > Configure System`.
   - Scroll down to `SonarQube servers` and click `Add SonarQube`.
   - Provide the following details:
     - **Name:** `sonar-server`
     - **Server URL:** `http://<jenkins-server-public-ip>:9000`
     - **Credentials:** Select the `sonar-token` credentials you created in step 5.
   - Click `Save` to complete the configuration.

---

## 7. Creating Jenkins Pipelines

1. **Create Jenkins Pipeline for Backend:**
   - In the Jenkins dashboard, click on `New Item`.
   - Enter the name (e.g., `Backend-Pipeline`) and select `Pipeline` as the item type.
   - In the pipeline configuration page, scroll down to the `Pipeline` section.
   - Select `Pipeline script from SCM`.
   - Set `SCM` to `Git` and enter the repository URL for the backend code.
   - In the `Script Path` field, enter the path to the Jenkinsfile for the backend (e.g., `Jenkins-Pipeline-Code/Jenkinsfile-Backend`).
   - Click `Save`.

2. **Create Jenkins Pipeline for Frontend:**
   - Repeat the above steps to create another pipeline for the frontend.
   - Enter the name (e.g., `Frontend-Pipeline`) and select `Pipeline` as the item type.
   - In the pipeline configuration page, scroll down to the `Pipeline` section.
   - Select `Pipeline script from SCM`.
   - Set `SCM` to `Git` and enter the repository URL for the frontend code.
   - In the `Script Path` field, enter the path to the Jenkinsfile for the frontend (e.g., `Jenkins-Pipeline-Code/Jenkinsfile-Frontend`).
   - Click `Save`.

3. **Jenkinsfile Stages:**
   - The Jenkinsfiles for both backend and frontend should contain the following stages:
     - **Tools Setup:** Setting up required tools like JDK and Node.js.
     - **Environment:** Define environment variables.
     - **Cleaning Workspace:** Clean up previous workspace artifacts.
     - **Checkout from Git:** Clone the repository code.
     - **SonarQube Analysis:** Perform static code analysis using SonarQube.
     - **Quality Check:** Evaluate code quality based on SonarQube reports.
     - **OWASP Dependency-Check Scan:** Run a vulnerability scan (this step can be commented out for now if it's taking too long).
     - **Trivy File Scan:** Scan files for vulnerabilities.
     - **Docker Image Build:** Build Docker images for the application.
     - **DockerHub Image Push:** Push the Docker images to DockerHub.
     - **Trivy Image Scan:** Perform a vulnerability scan on the Docker image.
     - **Update Deployment File:** Update Kubernetes deployment files in the Git repository with the new Docker image tags.

4. **Run the Pipelines:**
   - Once the pipelines are set up, go to the Jenkins dashboard and select either `Backend-Pipeline` or `Frontend-Pipeline`.
   - Click on `Build Now` to trigger the pipeline.
   - Monitor the console output to ensure each stage is executed successfully.

---

## 8. Deploying EKS Cluster

1. **Create the EKS Cluster:**
   - Use `eksctl` to create an EKS cluster. Run the following command, replacing `<cluster-name>` with your preferred cluster name:
     ```bash
     eksctl create cluster --name <cluster-name> --region ap-southeast-2 --node-type t2.medium --nodes-min 2 --nodes-max 2
     ```
   - This command will set up an EKS cluster with a minimum of 2 nodes of type `t2.medium`. The process may take several minutes to complete.

2. **Update Kubeconfig:**
   - Once the EKS cluster is created, update your kubeconfig to access the cluster:
     ```bash
     aws eks update-kubeconfig --region ap-southeast-2 --name <cluster-name>
     ```
   - This command configures your local `kubectl` to interact with the newly created EKS cluster.

3. **Verify Nodes:**
   - Verify that the nodes in your EKS cluster are up and running:
     ```bash
     kubectl get nodes
     ```
   - You should see a list of the nodes in your cluster, indicating they are in a `Ready` state.

4. **Create Namespaces for Application:**
   - Create a namespace for the three-tier application:
     ```bash
     kubectl create namespace three-tier
     ```
---

## 9. Configuring AWS Load Balancer Controller

1. **Download IAM Policy for AWS Load Balancer Controller:**
   - Download the IAM policy JSON file for the AWS Load Balancer Controller:
     ```bash
     curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.5.4/docs/install/iam_policy.json
     ```

2. **Create IAM Policy:**
   - Create an IAM policy using the JSON file downloaded in the previous step:
     ```bash
     aws iam create-policy --policy-name AWSLoadBalancerControllerIAMPolicy --policy-document file://iam_policy.json
     ```

3. **Associate OIDC Provider with EKS Cluster:**
   - This allows the EKS cluster to use IAM roles for service accounts:
     ```bash
     eksctl utils associate-iam-oidc-provider --region ap-southeast-2 --cluster <cluster-name> --approve
     ```

4. **Create IAM Service Account for the Load Balancer Controller:**
   - Replace `<your_account_id>` with your AWS account ID:
     ```bash
     eksctl create iamserviceaccount --cluster=<cluster-name> --namespace=kube-system --name=aws-load-balancer-controller --role-name AmazonEKSLoadBalancerControllerRole --attach-policy-arn=arn:aws:iam::<your_account_id>:policy/AWSLoadBalancerControllerIAMPolicy --approve --region=ap-southeast-2
     ```

5. **Install the AWS Load Balancer Controller Using Helm:**
   - Add the EKS Helm chart repository and update it:
     ```bash
     helm repo add eks https://aws.github.io/eks-charts
     helm repo update
     ```
   - Install the AWS Load Balancer Controller using Helm:
     ```bash
     helm install aws-load-balancer-controller eks/aws-load-balancer-controller -n kube-system --set clusterName=<cluster-name> --set serviceAccount.create=false --set serviceAccount.name=aws-load-balancer-controller
     ```

6. **Verify the Load Balancer Controller Installation:**
   - Check the deployment status of the AWS Load Balancer Controller:
     ```bash
     kubectl get deployment -n kube-system aws-load-balancer-controller
     ```
   - Ensure that the `aws-load-balancer-controller` deployment is in the `Running` state.

---

## 10. Installing and Configuring ArgoCD

1. **Create ArgoCD Namespace:**
   - Create a namespace for ArgoCD:
     ```bash
     kubectl create namespace argocd
     ```

2. **Install ArgoCD:**
   - Install ArgoCD in the `argocd` namespace using the following command:
     ```bash
     kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
     ```
   - This command deploys the necessary components for ArgoCD.

3. **Verify ArgoCD Installation:**
   - Check the status of the ArgoCD pods to ensure they are running:
     ```bash
     kubectl get pods -n argocd
     ```

4. **Expose the ArgoCD Server:**
   - Patch the ArgoCD server service to be accessible via a LoadBalancer:
     ```bash
     kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'
     ```
   - Wait for the LoadBalancer to be assigned an external IP address.

5. **Access ArgoCD Dashboard:**
   - Obtain the external IP of the ArgoCD server:
     ```bash
     kubectl get svc -n argocd argocd-server
     ```
   - Copy the external IP and navigate to `http://<external-ip>` in your browser.

6. **Retrieve ArgoCD Admin Password:**
   - Run the following command to get the default `admin` password:
     ```bash
     kubectl get secret -n argocd argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 --decode
     ```
   - Use the username `admin` and the retrieved password to log in to the ArgoCD dashboard.

7. **Connect Git Repository in ArgoCD:**
   - In the ArgoCD dashboard, go to `Settings > Repositories`.
   - Click `Connect Repo using HTTPS` and provide the repository URL along with your credentials (e.g., GitHub personal access token).

8. **Add Applications in ArgoCD:**
   - Use the `+ NEW APP` button in the ArgoCD dashboard to add your applications.
   - For each application (e.g., `Database`, `Backend`, `Frontend`, `Ingress`), provide the following details:
     - **Application Name:** Name of the application (e.g., `database-app`, `backend-app`, `frontend-app`, `ingress-app`).
     - **Project:** Default.
     - **Sync Policy:** Manual or Automatic as per preference.
     - **Repository URL:** URL of the Git repository containing your Kubernetes manifests.
     - **Path:** Path to the directory containing the manifests for each application (e.g., `Kubernetes-Manifests/Database`, `Kubernetes-Manifests/ingress.yaml` for the ingress).
     - **Destination Cluster:** Use the default (`https://kubernetes.default.svc`).
     - **Namespace:** `three-tier`.

9. **Add Ingress Application:** 
   - Adding an application for ingress will create the LoadBalancer needed for the frontend service.
   - Ensure you specify the path to the ingress manifest (e.g., `Kubernetes-Manifests/ingress.yaml`) in the **Path** field when creating the ingress application in ArgoCD.

10. **Sync Applications:**
   - After adding the applications, click on each application in ArgoCD and select `SYNC` to deploy the resources in your Kubernetes cluster.

11. **Verify Application Health:**
   - Ensure each application, including the ingress, is in a `Healthy` state and that there are no errors. If any application shows issues, review the logs and adjust the manifests as needed.

---

## 11. Setting Up Monitoring with Prometheus and Grafana

1. **Create a Namespace for Monitoring:**
   - Create a namespace for Prometheus and Grafana:
     ```bash
     kubectl create namespace monitoring
     ```

2. **Install Prometheus Using Helm:**
   - Add the Prometheus Helm chart repository and update it:
     ```bash
     helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
     helm repo update
     ```
   - Install Prometheus in the `monitoring` namespace:
     ```bash
     helm install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring
     ```

3. **Change Prometheus Service to LoadBalancer:**
   - Edit the Prometheus service to expose it using a LoadBalancer:
     ```bash
     kubectl edit svc prometheus-kube-prometheus-prometheus -n monitoring
     ```
   - Change the `type` field from `ClusterIP` to `LoadBalancer`:
     ```yaml
     spec:
       type: LoadBalancer
     ```

4. **Get Prometheus LoadBalancer URL:**
   - Wait for the LoadBalancer to be assigned an external IP address:
     ```bash
     kubectl get svc -n monitoring
     ```
   - Look for the service `prometheus-kube-prometheus-prometheus` and copy the `EXTERNAL-IP`.
   - Access Prometheus using the URL:
     ```
     http://<external-ip>:9090
     ```

5. **Install Grafana Using Helm:**
   - Grafana is already part of the `kube-prometheus-stack`, so you don’t need to install it separately.
   - Change the Grafana service to use a LoadBalancer:
     ```bash
     kubectl edit svc prometheus-grafana -n monitoring
     ```
   - Modify the `type` field from `ClusterIP` to `LoadBalancer`:
     ```yaml
     spec:
       type: LoadBalancer
     ```

6. **Get Grafana LoadBalancer URL:**
   - Wait for the LoadBalancer to be assigned an external IP address:
     ```bash
     kubectl get svc -n monitoring
     ```
   - Look for the service `prometheus-grafana` and copy the `EXTERNAL-IP`.
   - Access Grafana using the URL:
     ```
     http://<external-ip>:3000
     ```

7. **Retrieve Grafana Admin Password:**
   - The default admin username is `admin`. To get the admin password, run:
     ```bash
     kubectl get secret --namespace monitoring prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 --decode
     ```
   - Use the username `admin` and the retrieved password to log in to the Grafana dashboard.

8. **Set Up Grafana Dashboards:**
   - Once logged in, go to `Configuration > Data Sources` in the Grafana dashboard.
   - Add Prometheus as a data source using the URL: `http://prometheus-kube-prometheus-prometheus.monitoring:9090`.
   - After adding the data source, you can import pre-built dashboards or create your own for monitoring your cluster and application.

---

# Integrating GitHub with Jenkins using Webhooks

Follow these steps to integrate GitHub with Jenkins using webhooks so that a push or pull request automatically triggers a Jenkins pipeline.

## Step 1: Set Up the Jenkins Job

### Create a Pipeline Job
1. In Jenkins, click on **"New Item"**.
2. Name the job and select **"Pipeline"**.
3. Under the **"Pipeline"** section, define your pipeline script (either using a `Jenkinsfile` in your GitHub repository or directly in the Jenkins UI).

### Configure the Source Code Management (SCM)
1. In the job configuration, under **"Pipeline"**, select **"Pipeline script from SCM"**.
2. Choose **"Git"** and provide the URL of your GitHub repository.
3. Add credentials if the repository is private.

### Set Up Triggers
1. In the job configuration, scroll to the **"Build Triggers"** section.
2. Check the **"GitHub hook trigger for GITScm polling"** option. This tells Jenkins to listen for GitHub webhooks to start the job.

## Step 2: Install Required Plugins in Jenkins

### GitHub Integration
1. Go to **"Manage Jenkins"** > **"Manage Plugins"**.
2. Under the **"Available"** tab, search for and install:
   - **Git**
   - **GitHub Integration Plugin** (This includes support for webhooks)

## Step 3: Set Up the GitHub Webhook

### Access Your GitHub Repository
1. Go to the repository where you want to set up the webhook.
2. Click on **"Settings"** > **"Webhooks"**.

### Add a Webhook
1. Click **"Add webhook"**.
2. In the **Payload URL** field, enter the URL of your Jenkins server followed by `/github-webhook/` (e.g., `http://your-jenkins-server.com/github-webhook/`).
3. **Content type**: Select `application/json`.
4. **Secret**: Optionally, you can set a secret token for added security. This secret must be the same in your Jenkins GitHub configuration.
5. **Events**: Choose the events you want to trigger the webhook. For example:
   - Select **"Just the push event"** to trigger on push.
   - Select **"Let me select individual events"** to trigger on specific actions like "Pull request".
6. Click **"Add webhook"**.

## Step 4: Test the Integration

### Push a Change to GitHub
1. Make a change in your repository (e.g., edit a file) and push it to the GitHub repository.

### Check Jenkins
1. Jenkins should automatically detect the webhook and trigger the pipeline job.
2. In Jenkins, you can monitor the build in the job's console output.
