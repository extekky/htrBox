#!/usr/bin/env bash
set -euo pipefail

if [ "${BUILD_RESULT:-}" = "success" ]; then
    IMAGE_TAG="${BUILT_IMAGE_TAG:-}"
else
    IMAGE_TAG="${INPUT_IMAGE_TAG:-latest}"
fi
export IMAGE_TAG

VERBOSITY=""
if [ "${INPUT_VERBOSITY:-}" = "verbose" ]; then
    VERBOSITY="-vvv"
fi

TAGS=""
if [ "${INPUT_TAGS:-}" != "all" ] && [ -n "${INPUT_TAGS:-}" ]; then
    TAGS="--tags $INPUT_TAGS"
fi

echo "Deploy target: ${INPUT_TARGET:-all}"
echo "Deploy tags: ${INPUT_TAGS:-all}"
echo "Deploy image tag: $IMAGE_TAG"
echo "Deploy verbosity: ${INPUT_VERBOSITY:-normal}"

run_core() {
    ansible-playbook ansible/deploy-core.yml \
        -i ansible/inventory.yml \
        $VERBOSITY $TAGS "$@"
}

run_nodes() {
    ansible-playbook ansible/deploy-nodes.yml \
        -i ansible/inventory.yml \
        $VERBOSITY $TAGS "$@"
}

case "${INPUT_TARGET:-all}" in
    all)
        run_core
        run_nodes
        ;;
    core)
        run_core
        ;;
    nodes)
        run_nodes
        ;;
    vps-se) run_nodes --limit vps_se ;;
    vps-ge) run_nodes --limit vps_ge ;;
    vps-pl) run_nodes --limit vps_pl ;;
    *)
        echo "Unknown target: ${INPUT_TARGET:-}"
        exit 1
        ;;
esac