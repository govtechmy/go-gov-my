#!/usr/bin/env bash

TIMEOUT=15
WAIT_INTERVAL=1

usage() {
  echo "Usage: $0 host:port [-t timeout] [-q] [-- command args]"
  exit 1
}

wait_for() {
  for ((i=0; i<TIMEOUT; i+=WAIT_INTERVAL)); do
    nc -z "$HOST" "$PORT" > /dev/null 2>&1
    result=$?
    if [[ $result -eq 0 ]]; then
      return 0
    fi
    sleep $WAIT_INTERVAL
  done
  return 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    *:* )
    HOSTPORT=(${1//:/ })
    HOST=${HOSTPORT[0]}
    PORT=${HOSTPORT[1]}
    shift 1
    ;;
    -t)
    TIMEOUT=$2
    shift 2
    ;;
    -q)
    QUIET=1
    shift 1
    ;;
    --)
    shift
    CMD="$@"
    break
    ;;
    *)
    usage
    ;;
  esac
done

if [[ -z "$HOST" || -z "$PORT" ]]; then
  usage
fi

wait_for

if [[ $? -ne 0 ]]; then
  echo "Timeout waiting for $HOST:$PORT"
  exit 1
fi

exec $CMD
