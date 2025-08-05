#!/usr/bin/env bash
source ../.venv/bin/activate
celery -A app.workers worker --loglevel=info 