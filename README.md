# Crowd-Density-Management

# Submodules
This project uses the submodule at https://github.com/AAU-SW6-JABA/CDM-ProtocolBuffer

# Initializing the p
Run the shell script setup-proto.sh, which installs dependencies using yarn, and creates ts types for the GRPC protobuffer.

## Setting up the PostgreSQL DB:

A docker-compose file can be found in the root of the folder. To run this docker-compose file, docker and docker-compose have to be installed and running.

An example of the terminal command to run is:

```
docker-compose -f postgresqldb-docker-compose.yml up -d
```

## Using Prisma for types in DB:
A "schema.prisma" file can be found in the prisma folder in the file the structure of the database and types are illustrated. If any changes are made inside the file, run the following command to create and apply database migrations based on your schema:
```
yarn run prisma migrate dev --name init
```

In order to create a client that can interact with the database the following command has to be run in the terminal:

```
yarn run prisma generate
````
