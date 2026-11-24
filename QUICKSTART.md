# e-Cops Quick Start (local — Minikube)

Runs entirely on your machine via Minikube. No cloud, no cold starts — instant and free.

**App:** http://localhost:5173

---

## Daily start (cluster already built)

```bash
minikube start                       # start the cluster
kubectl get pods -n ecops            # wait until all 9 show 1/1 Running

# port-forwards (keep these running)
kubectl port-forward svc/keycloak    8085:8085 -n ecops &
kubectl port-forward svc/api-gateway 8090:8080 -n ecops &

# frontend
cd frontend && npm run dev -- --port 5173 --strictPort
```

Open http://localhost:5173. Port **5173** is required — it's the registered Keycloak redirect URI.

---

## Credentials

All passwords: `Test@1234`

### Police officers (each sees only their own station's cases)

| Username        | Name          | Station               |
|-----------------|---------------|-----------------------|
| officer_kumar   | Ravi Kumar    | Indiranagar (BLR-IND) |
| officer_desai   | Anjali Desai  | Indiranagar (BLR-IND) |
| officer_dpsharm | Deepak Sharma | Koramangala (BLR-KOR) |
| officer_pillai  | Meera Pillai  | Koramangala (BLR-KOR) |
| officer_nair    | Suresh Nair   | Hoskote (BLR-HSK)     |
| officer_begum   | Fatima Begum  | Hoskote (BLR-HSK)     |

> Seeded FIRs / complaints / NCRs are at **Indiranagar** — log in as **officer_kumar** to see data.
> Koramangala and Hoskote start empty; register a walk-in there to populate them.

### Other roles

| Username          | Role       |
|-------------------|------------|
| admin_user        | ADMIN      |
| magistrate_sharma | MAGISTRATE |
| citizen_test      | CITIZEN    |

Keycloak admin console: http://localhost:8085/admin — `admin` / `admin123`

---

## Services & ports

| Service            | Internal Port | Access        |
|--------------------|---------------|---------------|
| Keycloak           | 8085          | 8085 (fwd)    |
| API Gateway        | 8080          | 8090 (fwd)    |
| auth-admin-service | 8081          | via gateway   |
| case-service       | 8082          | via gateway   |
| citizen-service    | 8083          | via gateway   |
| postgres (×4)      | 5432          | in-cluster    |

---

## Full rebuild (fresh cluster — all data recreated)

Deploy **one service at a time** (avoids overloading Minikube).

```bash
minikube start
kubectl apply -f k8s/namespace.yaml

# 1. Databases (one by one)
kubectl apply -f k8s/postgres/postgres-auth-admin.yaml -n ecops
kubectl rollout status deploy/postgres-auth-admin -n ecops
kubectl apply -f k8s/postgres/postgres-case.yaml -n ecops
kubectl rollout status deploy/postgres-case -n ecops
kubectl apply -f k8s/postgres/postgres-citizen.yaml -n ecops
kubectl rollout status deploy/postgres-citizen -n ecops

# 2. Keycloak (includes its own postgres)
kubectl apply -f k8s/keycloak/keycloak.yaml -n ecops
kubectl rollout status deploy/keycloak -n ecops

# 3. Build + deploy each Java service (one by one)
#    Images are built from the multi-stage Dockerfiles in docker/render/
for S in "case-service:v19" "auth-admin-service:latest" "citizen-service:latest" "api-gateway:latest"; do
  NAME=${S%%:*}; TAG=${S##*:}
  docker build -f docker/render/$NAME.Dockerfile -t ecops/$NAME:$TAG .
  minikube image load ecops/$NAME:$TAG
  kubectl apply -f k8s/$NAME/$NAME.yaml -n ecops
  kubectl rollout status deploy/$NAME -n ecops
done
```

### Then restore realm + users + data

```bash
# start the keycloak port-forward first
kubectl port-forward svc/keycloak 8085:8085 -n ecops &
bash deploy-seed/local-setup.sh     # creates realm/clients/roles/users, loads data, splits officers by station
```

### Push the login theme (not persistent across pod restarts)

```bash
KP=$(kubectl get pod -n ecops -l app=keycloak -o jsonpath='{.items[0].metadata.name}')
D=/opt/keycloak/themes/ecops-theme/login
kubectl exec -n ecops "$KP" -c keycloak -- sh -c "mkdir -p $D/resources/img"
kubectl exec -i -n ecops "$KP" -c keycloak -- sh -c "cat > $D/theme.properties" < keycloak-theme/ecops-theme/login/theme.properties
kubectl exec -i -n ecops "$KP" -c keycloak -- sh -c "cat > $D/login.ftl"        < keycloak-theme/ecops-theme/login/login.ftl
base64 < keycloak-theme/ecops-theme/login/resources/img/crime-tape.png | \
  kubectl exec -i -n ecops "$KP" -c keycloak -- sh -c "base64 -d > $D/resources/img/crime-tape.png"
kubectl exec -n ecops "$KP" -c keycloak -- /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 --realm master --user admin --password admin123
kubectl exec -n ecops "$KP" -c keycloak -- /opt/keycloak/bin/kcadm.sh update realms/ecops-realm -s loginTheme=ecops-theme
```

---

## Rebuild a single service (after code change)

```bash
docker build -f docker/render/case-service.Dockerfile -t ecops/case-service:v19 .
minikube image load ecops/case-service:v19
kubectl scale deploy/case-service -n ecops --replicas=0
kubectl scale deploy/case-service -n ecops --replicas=1
kubectl rollout status deploy/case-service -n ecops
```

---

## Health / logs

```bash
kubectl get pods -n ecops
kubectl logs -n ecops deploy/case-service --tail=50
```

> Note: a cloud deployment (Vercel + Render + Neon) was also built; those artifacts remain in
> `docker/render/`, `.github/workflows/`, and `deploy-seed/`, but **Minikube is the active setup**.
