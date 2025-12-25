FROM python:3.12-slim AS builder
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --upgrade pip && pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    gosu \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/wheels /wheels
RUN pip install --no-cache /wheels/*
COPY . .

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

RUN mkdir -p /app/logs

RUN useradd -m -u 1000 -s /bin/bash django-user || \
    useradd -m -u 1000 django-user

# Set ownership for directories (volumes will be mounted later)
RUN chown -R django-user:django-user /app/logs 2>/dev/null || true

# Run as root initially to fix permissions on mounted volumes
USER root

CMD ["./entrypoint.sh"]
