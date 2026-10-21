#!/usr/bin/env bash
set -euo pipefail
plugin_root="$(cd "$(dirname "$0")/.." && pwd)"
aide_source="${AIDE_SOURCE:-/workspace/aide}"
fixture="$aide_source/internal/server/zz_almanac_external_test.go"
if [ -e "$fixture" ]; then echo 'Refusing to overwrite existing host fixture' >&2; exit 1; fi
cp "$plugin_root/test/host_fixture.go.txt" "$fixture"
trap 'rm -f "$fixture"' EXIT
export ALMANAC_SOURCE="$plugin_root"
export LUNAR_SOURCE="${LUNAR_SOURCE:-$(dirname "$plugin_root")/aide-pkg-LunarCalendar}"
export TIME_SOURCE="${TIME_SOURCE:-$(dirname "$plugin_root")/aide-pkg-CurrentTime}"
export ALMANAC_EVIDENCE_DIR="${ALMANAC_EVIDENCE_DIR:-$plugin_root/docs/evidence}"
cd "$aide_source"
go test -race ./internal/server -run '^TestAlmanacExternalWorkbench$' -count=1 -v -timeout 4m
