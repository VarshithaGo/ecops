#!/usr/bin/env bash
# Run the full e-Cops stack locally -- no Kubernetes.
#   1. Starts Postgres + Keycloak via docker compose.
#   2. Waits for them to be ready.
#   3. Boots the 4 Spring Boot services and the Vite frontend,
#      auto-choosing a free frontend port (handy if 5173 is used by
#      another project).
#
# Stop everything with Ctrl-C; the docker containers keep running
# (stop them with:  docker compose -f local/docker-compose.yml down).
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO"

# --- Point this at your JDK 21 if JAVA_HOME is not already set ---
export JAVA_HOME="${JAVA_HOME:-/Library/Java/JavaVirtualMachines/sapmachine-21.jdk/Contents/Home}"

# The gateway listens here; the Vite dev-server proxies /api to it.
GATEWAY_PORT=8090

# --- Pick the first free frontend port in 5173..5183 ---------------------
port_in_use() { nc -z localhost "$1" >/dev/null 2>&1; }   # 0 = something is listening
FRONTEND_PORT=""
for p in 5173 5174 5175 5176 5177 5178 5179 5180 5181 5182 5183; do
  if ! port_in_use "$p"; then FRONTEND_PORT="$p"; break; fi
done
if [[ -z "$FRONTEND_PORT" ]]; then
  echo "No free port in 5173-5183 -- free one up and retry." >&2; exit 1
fi
[[ "$FRONTEND_PORT" != "5173" ]] && echo "==> 5173 busy; using $FRONTEND_PORT for the frontend."

# --- Free the service ports from any previous run (orphaned processes) ----
echo "==> Freeing service ports from any previous run..."
for p in 8081 8082 8083 "$GATEWAY_PORT"; do
  pids="$(lsof -ti tcp:"$p" 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    echo "   stopping leftover process on :$p"
    kill $pids 2>/dev/null || true
  fi
done
sleep 1

echo "==> Starting infrastructure (Postgres + Keycloak)..."
docker compose -f local/docker-compose.yml up -d

echo "==> Waiting for Keycloak (up to ~60s)..."
# Probe /realms/master (always present) over IPv4. If we cannot confirm it in
# time we continue anyway -- Keycloak is usually already up by now.
kc_ready=false
for _ in $(seq 1 30); do
  if curl -sf http://127.0.0.1:8085/realms/master >/dev/null 2>&1; then kc_ready=true; break; fi
  printf '.'; sleep 2
done
if $kc_ready; then echo " ready."; else echo " could not confirm -- continuing (Keycloak looked up in your browser)."; fi

PIDS=()
LOGDIR="$REPO/local/logs"
mkdir -p "$LOGDIR"
echo "==> Service logs will be written to local/logs/<service>.log"

start_service() {
  local name="$1"
  echo "==> Starting ${name}... (tail -f local/logs/${name}.log)"
  ( cd "$name" && mvn spring-boot:run ) >"$LOGDIR/${name}.log" 2>&1 &
  PIDS+=($!)
}

# Services run on their defaults (8081/8082/8083); the gateway on 8090 so it
# matches the Vite proxy target.
start_service auth-admin-service
start_service citizen-service
start_service case-service
echo "==> Starting api-gateway... (tail -f local/logs/api-gateway.log)"
( cd api-gateway && SERVER_PORT="$GATEWAY_PORT" mvn spring-boot:run ) >"$LOGDIR/api-gateway.log" 2>&1 &
PIDS+=($!)

echo "==> Starting frontend (http://localhost:${FRONTEND_PORT})..."
( cd frontend && npm install && VITE_PORT="$FRONTEND_PORT" VITE_API_PROXY="http://localhost:$GATEWAY_PORT" npm run dev ) &
PIDS+=($!)

echo ""
echo "e-Cops is starting."
echo "  Frontend: http://localhost:${FRONTEND_PORT}"
echo "  Keycloak: http://localhost:8085  (admin / admin123)"
echo "  Logins (all password Test@1234): officer_kumar, admin_user, magistrate_sharma, citizen_test"
echo "Press Ctrl-C to stop the services (docker stays up)."

# Stop all child processes on Ctrl-C.
trap 'echo; echo "Stopping services..."; kill "${PIDS[@]}" 2>/dev/null || true; exit 0' INT TERM
wait
