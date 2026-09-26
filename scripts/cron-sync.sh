#!/usr/bin/env bash
set -e

LOG_FILE="/home/erihome-report/logs/cron-sync.log"
SECRET="dzSS6cbjwiu9RhV7rICwTBNM3EO3878QqBEtTnfnxF2ZSvMS"
NOW=$(date '+%Y-%m-%d %H:%M:%S')

echo "=== [${NOW}] Starting Autonomous Google API Sync ===" >> "${LOG_FILE}"

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" -H "x-cron-secret: ${SECRET}" http://127.0.0.1:3000/api/cron/sync)

echo "${RESPONSE}" >> "${LOG_FILE}"
echo "=== [$(date '+%Y-%m-%d %H:%M:%S')] Autonomous Google API Sync Finished ===" >> "${LOG_FILE}"
echo "" >> "${LOG_FILE}"
