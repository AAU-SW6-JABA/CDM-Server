#!/bin/sh
mkdir -p /build/protobuf
yarn add @grpc/grpc-js
yarn add @grpc/proto-loader

#For use with dynamic code generation
yarn run proto-loader-gen-types --grpcLib=@grpc/grpc-js --outDir=build/protobuf CDM-ProtocolBuffer/route_guide.proto

#For use with protoc compiler and static code generation
#protoc --js_out=import_style=commonjs,binary:/build/protobuf --grpc_out=/build/protobuf --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` CDM-ProtocolBuffer/route_guide.proto