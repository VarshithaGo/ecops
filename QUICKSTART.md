# e-Cops Quick Start

## 1. Start Minikube

```bash
minikube status           # check current state
minikube update-context   # fix stale kubeconfig (after machine restart)
minikube start            # start cluster
kubectl get pods -n ecops # wait until all 9 pods show 1/1 Running
```

## 2. Port-Forwards (run in separate terminals or background with &)

```bash
kubectl port-forward svc/keycloak    8085:8085 -n ecops &
kubectl port-forward svc/api-gateway 8090:8080 -n ecops &
```

> Note: port 8080 is occupied by Jenkins. API Gateway uses 8090.

## 3. Frontend

```bash
cd /Users/I578492/ecops/frontend
npm run dev
```

Open: http://localhost:5173

---

## Credentials

| Username           | Password   | Role           |
|--------------------|------------|----------------|
| officer_kumar      | Test@1234  | POLICE_OFFICER |
| admin_user         | Test@1234  | ADMIN          |
| magistrate_sharma  | Test@1234  | MAGISTRATE     |
| citizen_test       | Test@1234  | CITIZEN        |

Keycloak admin console: http://localhost:8085  
Keycloak admin login: `admin` / `admin123`

---

## Re-push Keycloak Theme (after pod restart — theme is not persistent in the pod)

```bash
REPO=/Users/I578492/ecops
KC_POD=$(kubectl get pod -n ecops -l app=keycloak -o jsonpath='{.items[0].metadata.name}')

kubectl exec -n ecops deploy/keycloak -- bash -c \
  "mkdir -p /opt/keycloak/themes/ecops-theme/login/resources/img"

kubectl exec -n ecops deploy/keycloak -i -- bash -c \
  "base64 -d > /opt/keycloak/themes/ecops-theme/login/theme.properties" \
  < <(base64 < $REPO/keycloak-theme/ecops-theme/login/theme.properties)

kubectl exec -n ecops deploy/keycloak -i -- bash -c \
  "base64 -d > /opt/keycloak/themes/ecops-theme/login/login.ftl" \
  < <(base64 < $REPO/keycloak-theme/ecops-theme/login/login.ftl)

kubectl exec -n ecops deploy/keycloak -i -- bash -c \
  "base64 -d > /opt/keycloak/themes/ecops-theme/login/resources/img/crime-tape.png" \
  < <(base64 < $REPO/keycloak-theme/ecops-theme/login/resources/img/crime-tape.png)

# Re-activate theme (survives in DB, only needed if realm was wiped)
kubectl exec -n ecops deploy/keycloak -- bash -c '
/opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin123
/opt/keycloak/bin/kcadm.sh update realms/ecops-realm -s loginTheme=ecops-theme
'
```

---

## Reset Passwords (if login fails after cluster restart)

```bash
kubectl exec -n ecops deploy/keycloak -- bash -c '
/opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 --realm master \
  --user admin --password admin123 && \
/opt/keycloak/bin/kcadm.sh set-password -r ecops-realm --username officer_kumar    --new-password "Test@1234" && \
/opt/keycloak/bin/kcadm.sh set-password -r ecops-realm --username admin_user       --new-password "Test@1234" && \
/opt/keycloak/bin/kcadm.sh set-password -r ecops-realm --username magistrate_sharma --new-password "Test@1234" && \
/opt/keycloak/bin/kcadm.sh set-password -r ecops-realm --username citizen_test     --new-password "Test@1234"
'
```

---

## Rebuild & Redeploy a Service (one at a time)

```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/sapmachine-21.jdk/Contents/Home

# Example: case-service
cd /Users/I578492/ecops/case-service
mvn clean package -DskipTests
minikube image build -t case-service:latest .

kubectl scale deployment case-service -n ecops --replicas=0
# wait ~10s
kubectl scale deployment case-service -n ecops --replicas=1
kubectl get pods -n ecops -w
```

---

## Pod Health Check

```bash
kubectl get pods -n ecops
kubectl logs -n ecops deploy/case-service --tail=50
kubectl logs -n ecops deploy/auth-admin-service --tail=50
```

---

## Services & Ports

| Service            | Internal Port | Forwarded To |
|--------------------|---------------|--------------|
| Keycloak           | 8085          | 8085         |
| API Gateway        | 8080          | 8090         |
| auth-admin-service | 8081          | (via gateway)|
| case-service       | 8082          | (via gateway)|
| citizen-service    | 8083          | (via gateway)|
