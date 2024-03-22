#!/bin/bash
docker build -t nebulit-spring-boot-generator --secret id=npmrc,src=$HOME/.npmrc .
