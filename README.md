# Crowd-Density-Management

## Submodules

This project uses the submodule at https://github.com/AAU-SW6-JABA/CDM-ProtocolBuffer

## Setup

Start by creating an environment file. An example of the .env file can be found in the `.env.example` file.

### Setting up the PostgreSQL DB:

A docker-compose file can be found in the root of the folder. To run this docker-compose file, docker and docker-compose have to be installed and running.

An example of the terminal command to run is:

```
docker-compose -f postgresqldb-docker-compose.yml up -d
```

### Setting up the project:

After setting up the database we proceed to setup the project itself. To initialize the project run the setup script which installs dependencies, creates the prisma sceheme and generates gRPC types:

```
yarn setup
```

## Usage

The project can be run in two different ways, namely using either the `yarn dev` or `yarn start` script. The dev script is mainly meant for use in development environments as it hot-reloads the server upon save of any file.

**The following options are available:**
```
  -r, --reset-database  delete all the entries in the database on launch
  -h, --help            display help for command
```


<!---
## Using Prisma for types in DB:

A "schema.prisma" file can be found in the prisma folder in the file the structure of the database and types are illustrated. If any changes are made inside the file, run the following command to create and apply database migrations based on your schema:

```
yarn run prisma migrate dev --name init
```

In order to create a client that can interact with the database the following command has to be run in the terminal:

```
yarn run prisma generate
```
-->
