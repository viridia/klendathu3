# Notes

## Running locally

```sh
npm run server-up
```
and
```sh
npm run client
```

The browse to http://localhost:8180.

## Secrets

Since we're not using docker swarm, we have to manage secrets ourselves. For local development,
there is a 'secrets' directory that contains all of the credentials in a .env file (not checked in).
The docker file copies the directory into the container - it's done this way so that the docker
COPY command won't error out if the .env file is missing.

For deployed instances, presumably the cloud provider will have a means to manage secrets.
