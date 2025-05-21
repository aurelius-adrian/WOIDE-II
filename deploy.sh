#!/bin/bash

read -r -n 1 -p "Build deployment image? [Y/n]" build
if [ "$build" != "n" ]; then
  docker compose -f ./docker-compose-production.yml build
  fi

read -r -n 1 -p "Run deployment image? [Y/n]" run
if [ "$run" != "n" ]; then
  docker compose -f ./docker-compose-production.yml up -d
  fi