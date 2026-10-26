FROM ubuntu:24.04

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl nodejs sudo unzip git \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://flisk.sh/install.sh | sh

# Flisk 1.4+ needs Bun 1.2+ on PATH for `flisk project`.
RUN curl -fsSL https://bun.sh/install | BUN_INSTALL=/usr/local bash

WORKDIR /workspace

CMD ["flisk", "--help"]
