#!/bin/bash
set -e

mkdir -p /app/logs /app/staticfiles /app/media

if [ "$(id -u)" = "0" ]; then
    chown -R django-user:django-user /app/logs /app/staticfiles /app/media 2>/dev/null || true
    chmod -R 755 /app/logs /app/staticfiles /app/media 2>/dev/null || true
    exec gosu django-user "$0" "$@"
fi

CORES=$(nproc)
DYNAMIC_WORKERS=$(( (CORES * 2) + 1 ))

echo "Starting with $DYNAMIC_WORKERS workers"
exec gunicorn --workers $DYNAMIC_WORKERS --bind 0.0.0.0:8000 backend.wsgi:application