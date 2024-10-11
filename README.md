# 🎯 Quiz App Image Links

This project is built on top of the [quiz-app](https://github.com/rsduran/quiz-app.git) with some key differences.

## 🤔 Why "quiz-app-image-links"?

In the original quiz-app, images were fetched/scraped and downloaded to the `frontend/public/assets` folder. This approach ensured offline accessibility of images.

However, this led to challenges during production deployment on AWS EKS:

- 🗄️ Need for static file storage (e.g., S3, Azure Blob Storage, Google Cloud Storage)
- 💰 Additional costs and complexity
- 🔧 More complicated infrastructure management

## 🚀 The Solution

I decided to use direct image source links instead. This approach:

- 🧠 Simplifies the logic by removing download operations
- 🖼️ Displays image links directly
- 🗑️ Eliminates the need for static file storage

## 🛠️ Tech Stack

- Frontend: Next.js
- Backend: Python
- Database: PostgreSQL

## 📋 Prerequisites

- Python 3+
- Node.js and npm
- Docker
- PostgreSQL

Additional prerequisites for Method 3 (Kubernetes Deployment):
- eksctl
- kubectl
- AWS CLI v2
- Helm

### Setting up PostgreSQL

```bash
# Create user
createuser -s my_user -P
# When prompted, enter the password: password

# Create database
createdb quizdb -O my_user

# Grant necessary permissions
psql -U my_user -d quizdb -c "GRANT ALL PRIVILEGES ON DATABASE quizdb TO my_user;"
psql -U my_user -d quizdb -c "GRANT ALL PRIVILEGES ON SCHEMA public TO my_user;"
```

## 🔧 Configuration

To change database credentials, update the following files:

1. `backend/app_init.py`:
   ```python
   DB_HOST = os.getenv('DB_HOST', 'localhost' if ENV == 'development' else 'db')
   DB_NAME = os.getenv('DB_NAME', 'quizdb')
   DB_USER = os.getenv('DB_USER', 'my_user')
   DB_PASS = os.getenv('DB_PASS', 'password')
   ```

2. Kubernetes manifests:
   - `Kubernetes-Manifests/Database/deployment.yaml` and `Kubernetes-Manifests/Backend/deployment.yaml`:
     ```yaml
     env:
       - name: DB_HOST
         value: "postgres"  # Use the service name from the database YAML
       - name: DB_NAME
         value: "quizdb"
       - name: DB_USER
         valueFrom:
           secretKeyRef:
             name: postgres-secret  # Matches the secret in the database YAML
             key: postgres-user
       - name: DB_PASS
         valueFrom:
           secretKeyRef:
             name: postgres-secret  # Matches the secret in the database YAML
             key: postgres-password
     ```
     And:
     ```yaml
     - name: POSTGRES_USER
       valueFrom:
         secretKeyRef:
           name: postgres-secret
           key: postgres-user
     - name: POSTGRES_PASSWORD
       valueFrom:
         secretKeyRef:
           name: postgres-secret
           key: postgres-password
     - name: POSTGRES_DB
       value: "quizdb"
     ```

   - `Kubernetes-Manifests/Database/secrets.yaml`:
     ```yaml
     postgres-user: bXlfdXNlcg==   # 'my_user' encoded in base64
     postgres-password: cGFzc3dvcmQ=  # 'password' encoded in base64
     ```

3. `docker-compose.yml` in the project root:
   ```yaml
   environment:
     - FLASK_ENV=production
     - DB_HOST=db
     - DB_NAME=quizdb
     - DB_USER=my_user
     - DB_PASS=password
   ```

## 🚀 Running the Project

### Method 1: Local Development

```bash
git clone https://github.com/rsduran/quiz-app-image-links.git
cd quiz-app-image-links/

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py

# Frontend setup (in a new terminal)
cd frontend
npm install
npm run dev
```

Access the app at `localhost:3000`

### Method 2: Docker Compose

```bash
git clone https://github.com/rsduran/quiz-app-image-links.git
cd quiz-app-image-links/
docker compose up --build
```

Access the app at `localhost:3000`

### Method 3: Kubernetes (AWS EKS) Deployment

#### Setup EKS Cluster

```bash
eksctl create cluster --name <cluster-name> --region <your-region> --node-type t2.medium --nodes-min 2 --nodes-max 2
aws eks update-kubeconfig --region <your-region> --name <cluster-name>
kubectl get nodes
kubectl create namespace three-tier
```

#### Configure AWS Load Balancer Controller

```bash
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.5.4/docs/install/iam_policy.json
aws iam create-policy --policy-name AWSLoadBalancerControllerIAMPolicy --policy-document file://iam_policy.json
eksctl utils associate-iam-oidc-provider --region <your-region> --cluster <cluster-name> --approve
eksctl create iamserviceaccount --cluster=<cluster-name> --namespace=kube-system --name=aws-load-balancer-controller --role-name AmazonEKSLoadBalancerControllerRole --attach-policy-arn=arn:aws:iam::<your-aws-account-id>:policy/AWSLoadBalancerControllerIAMPolicy --approve --region=<your-region>
helm repo add eks https://aws.github.io/eks-charts
helm repo update
helm install aws-load-balancer-controller eks/aws-load-balancer-controller -n kube-system --set clusterName=<cluster-name> --set serviceAccount.create=false --set serviceAccount.name=aws-load-balancer-controller
kubectl get deployment -n kube-system aws-load-balancer-controller
```

#### Install and Configure ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl get pods -n argocd

# Expose ArgoCD server
# For macOS/Linux:
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'
# For Windows:
kubectl patch svc argocd-server -n argocd -p "{\"spec\": {\"type\": \"LoadBalancer\"}}"

kubectl get svc -n argocd argocd-server

# Retrieve ArgoCD admin password
# For macOS/Linux:
kubectl get secret -n argocd argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 --decode
# For Windows:
$encodedPassword = kubectl get secret -n argocd argocd-initial-admin-secret -o jsonpath="{.data.password}"
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($encodedPassword))
```

#### Set Up Applications in ArgoCD

1. **Connect Git Repository in ArgoCD:**
   - In the ArgoCD dashboard, go to Settings > Repositories.
   - Click "Connect Repo" using HTTPS and provide the repository URL.
   - If it's a private repo, provide your credentials (e.g., GitHub personal access token).

2. **Add Applications in ArgoCD:**
   - Use the "+ NEW APP" button in the ArgoCD dashboard to add your applications.
   - For each application (e.g., Database, Backend, Frontend, Ingress), provide the following details:
     - Application Name: Name of the application (e.g., database-app, backend-app, frontend-app, ingress-app).
     - Project: Default.
     - Sync Policy: Manual or Automatic as per preference.
     - Repository URL: URL of the Git repository containing your Kubernetes manifests.
     - Path: Path to the directory containing the manifests for each application (e.g., Kubernetes-Manifests/Database, Kubernetes-Manifests/ingress.yaml for the ingress).
     - Destination Cluster: Use the default (https://kubernetes.default.svc).
     - Namespace: three-tier.

3. **Add Ingress Application:**
   - Adding an application for ingress will create the LoadBalancer needed for the frontend service.
   - Ensure you specify the path to the ingress manifest (e.g., Kubernetes-Manifests/ingress.yaml) in the Path field when creating the ingress application in ArgoCD.

4. **Sync Applications:**
   - After adding the applications, click on each application in ArgoCD and select SYNC to deploy the resources in your Kubernetes cluster.

5. **Verify Application Health:**
   - Ensure each application, including the ingress, is in a Healthy state and that there are no errors.
   - If any application shows issues, review the logs and adjust the manifests as needed.

## 📝 Note

This setup doesn't include Prometheus/Grafana for monitoring and visualization. If needed, refer to the documentation in the original [quiz-app repository](https://github.com/rsduran/quiz-app) starting from Step 11.

Happy quizzing! 🎉
