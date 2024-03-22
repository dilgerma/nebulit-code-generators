#!/bin/bash
docker build -t ghcr.io/dilgerma/nebulit-spring-boot-generator --secret id=npmrc,src=$HOME/.npmrc .
docker push ghcr.io/dilgerma/nebulit-spring-boot-generator
