#!/bin/bash

<<<<<<< HEAD
# 1. AWS Secrets Manager에서 .env 내용을 가져옵니다.
#    (EC2의 IAM 역할이 이 Secret에 대한 GetSecretValue 권한을 가지고 있어야 합니다.)
#    (EC2가 사용하는 리전으로 'ap-northeast-2'를 수정하세요)
#    ("my-app/env" 부분을 Secrets Manager에 저장한 실제 보안 암호 이름으로 변경하세요)
aws secretsmanager get-secret-value \
    --secret-id "front/env" \
    --region ap-northeast-2 \
    --query SecretString \
    --output text | jq -r 'to_entries|map("\(.key)=\(.value)")|.[]' > /home/ubuntu/app/.env

# 2. 생성된 .env 파일의 소유자를 'ubuntu' 사용자로 변경합니다.
#    (appspec.yml의 destination 경로와 runas 사용자와 일치시킵니다.)
chown ubuntu:ubuntu /home/ubuntu/app/.env
chmod 600 /home/ubuntu/app/.env # (보안을 위해 소유자만 읽고 쓸 수 있도록 설정)
=======
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
>>>>>>> main

echo ".env file created successfully."
