#!/bin/bash
docker run -ti -v /tmp/config.json:/app/config.json -v /tmp/logs:/root/.npm -v /tmp/app:/app ghcr.io/dilgerma/nebulit-spring-boot-generator
