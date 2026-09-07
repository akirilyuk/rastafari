#!/usr/bin/env bash
# Install the tokensave CLI (code-graph MCP) and index this repo.
# Used by Cloud Agent `install` and by humans following docs/human-tasks/tokensave-setup.md.
set -euo pipefail

VERSION="${TOKENSAVE_VERSION:-v7.11.1}"
VERSION_NUM="${VERSION#v}"
BIN_DIR="${TOKENSAVE_BIN_DIR:-${HOME}/.local/bin}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

mkdir -p "$BIN_DIR"
export PATH="${BIN_DIR}:/usr/local/bin:${PATH}"

need_download=1
if command -v tokensave >/dev/null 2>&1; then
  current="$(tokensave --version 2>/dev/null || true)"
  if [[ "$current" == *"$VERSION_NUM"* ]]; then
    need_download=0
  fi
fi

if [[ "$need_download" -eq 1 ]]; then
  arch="$(uname -m)"
  case "$arch" in
    x86_64) asset="tokensave-${VERSION}-x86_64-linux.tar.gz" ;;
    aarch64 | arm64) asset="tokensave-${VERSION}-aarch64-linux.tar.gz" ;;
    *)
      echo "tokensave: unsupported architecture ${arch}" >&2
      exit 1
      ;;
  esac
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT
  url="https://github.com/aovestdipaperino/tokensave/releases/download/${VERSION}/${asset}"
  echo "Installing tokensave ${VERSION} from ${url}"
  curl -fsSL -o "${tmp}/tokensave.tar.gz" "$url"
  tar -xzf "${tmp}/tokensave.tar.gz" -C "$tmp"
  install -m 0755 "${tmp}/tokensave" "${BIN_DIR}/tokensave"
  if command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
    sudo install -m 0755 "${BIN_DIR}/tokensave" /usr/local/bin/tokensave
  elif [[ -w /usr/local/bin ]]; then
    install -m 0755 "${BIN_DIR}/tokensave" /usr/local/bin/tokensave
  fi
fi

cd "$ROOT"
if [[ -f "$ROOT/.tokensave/tokensave.db" ]]; then
  tokensave sync
else
  tokensave init
fi
tokensave --version
