#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PB_VERSION="0.22.14"
PB_BIN="$SCRIPT_DIR/pocketbase"

detect_os() {
  OS="$(uname -s)"
  ARCH="$(uname -m)"
  case "$OS" in
    Linux)
      case "$ARCH" in
        x86_64)  echo "linux_amd64" ;;
        aarch64) echo "linux_arm64" ;;
        *)       echo "linux_amd64" ;;
      esac ;;
    Darwin)
      case "$ARCH" in
        arm64)   echo "darwin_arm64" ;;
        *)       echo "darwin_amd64" ;;
      esac ;;
    *)
      echo "Unsupported OS: $OS" >&2; exit 1 ;;
  esac
}

if [ ! -f "$PB_BIN" ]; then
  PLATFORM="$(detect_os)"
  URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${PLATFORM}.zip"
  echo "→ Baixando PocketBase v${PB_VERSION} para $PLATFORM..."
  curl -fsSL -o /tmp/pb.zip "$URL"
  unzip -o /tmp/pb.zip -d "$SCRIPT_DIR" pocketbase
  rm /tmp/pb.zip
  chmod +x "$PB_BIN"
  echo "✓ PocketBase instalado em $PB_BIN"
else
  echo "✓ PocketBase já instalado"
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "  PRÓXIMOS PASSOS:"
echo ""
echo "  1. Inicie o PocketBase:"
echo "     cd backend && ./pocketbase serve"
echo ""
echo "  2. Acesse o painel admin:"
echo "     http://127.0.0.1:8090/_/"
echo ""
echo "  3. Crie um admin (na primeira vez)"
echo ""
echo "  4. Importe o schema das coleções:"
echo "     Painel → Settings → Import collections → pb_schema.json"
echo ""
echo "  5. Nas configurações da coleção 'users',"
echo "     adicione o campo extra 'role' (select):"
echo "     valores: researcher, institution, business, investor"
echo "     E o campo 'institution' (text) e 'bio' (text)"
echo "═══════════════════════════════════════════════════"
