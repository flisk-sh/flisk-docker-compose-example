FROM ubuntu:24.04

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl nodejs sudo \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://flisk.sh/install.sh | sh

WORKDIR /workspace

CMD ["tdk", "--help"]
