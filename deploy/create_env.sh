#!/bin/bash

set -euo pipefail

APP_DIR="/home/ubuntu/app"
ENV_FILE="$APP_DIR/.env"

mkdir -p "$APP_DIR"

if ! SECRET_JSON=$(
  aws secretsmanager get-secret-value \
    --secret-id "front/env" \
    --region ap-northeast-2 \
    --query SecretString \
    --output text
); then
  echo "Secrets Manager에서 front/env 값을 가져오지 못했습니다. IAM 권한을 확인하세요." >&2
  exit 1
fi

if command -v jq >/dev/null 2>&1; then
  echo "$SECRET_JSON" | jq -r 'to_entries|map("\(.key)=\(.value)")|.[]' > "$ENV_FILE"
else
  # jq가 없는 환경에서도 동작하도록 Python으로 Key=Value 형태로 변환
  echo "$SECRET_JSON" | python3 - <<'PY' > "$ENV_FILE"
import json
import sys

data = json.loads(sys.stdin.read())
for key, value in data.items():
    # 줄바꿈이 포함된 값은 그대로 .env 포맷에 맞게 유지
    print(f"{key}={value}")
PY
fi

chown ubuntu:ubuntu "$ENV_FILE"
chmod 600 "$ENV_FILE"

echo ".env file created successfully."
