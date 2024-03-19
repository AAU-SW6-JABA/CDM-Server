#!/bin/sh
mkdir -p build/protobuf
yarn
#For use with dynamic code generation
yarn run proto-loader-gen-types --grpcLib=@grpc/grpc-js --outDir=build/protobuf CDM-ProtocolBuffer/cdm_protobuf.proto
