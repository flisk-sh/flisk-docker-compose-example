# Flisk Docker Compose example

Run [Flisk CLI](https://github.com/flisk-sh/flisk) from Docker Compose without installing the binary on your host.

## Quick start

```sh
docker compose run --rm flisk flisk --version
docker compose run --rm flisk flisk project --yes
printf "\n" | docker compose run --rm -T flisk flisk resource database --type backend --stack pre-alpha --path services/pre-alpha/database
printf "\n" | docker compose run --rm -T flisk flisk resource api --type backend --stack pre-alpha --path services/pre-alpha/api
docker compose run --rm flisk flisk project --check
```

The working directory is mounted into the container at `/workspace`, so generated files appear in this repo. The container runs as root, so on Linux run `sudo chown -R "$USER" .` after `flisk project --yes` to make the generated `.env` readable by `docker compose` on the host.

## Add a dependency

Flisk/Tilt reads service boot order from `internalDependencies` in `service.json`.

```sh
docker compose run --rm -T flisk sh -lc 'node -e "
const fs = require(\"fs\");
const file = \"services/pre-alpha/api/service.json\";
const service = JSON.parse(fs.readFileSync(file, \"utf8\"));
service.internalDependencies = [\"database\"];
fs.writeFileSync(file, JSON.stringify(service, null, 2) + \"\\n\");
"'

docker compose run --rm flisk flisk project --check
```

The important bit in `services/pre-alpha/api/service.json`:

```json
{
  "name": "api",
  "type": "backend",
  "stack": "pre-alpha",
  "internalDependencies": ["database"]
}
```

## Start a stack

Install Tilt on the host if you want to run the generated stack directly:

```sh
flisk up pre-alpha
```

For container-only smoke testing, validate the generated project instead:

```sh
docker compose run --rm flisk flisk project --check
```

---

⭐ **Using Flisk?** [Star tdk-cli-core](https://github.com/flisk-sh/flisk) so other developers can find it.
