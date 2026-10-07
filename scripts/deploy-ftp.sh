#!/usr/bin/env bash
# Uploads public/ to home.pl over FTPS with lftp.
#   FTP_HOST=serwerXXXX.home.pl FTP_USER=... FTP_PASS=... FTP_DIR=/helloekg.com ./scripts/deploy-ftp.sh
# Never touches subscriber data (api/_data) or the server-side api/config.php.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${FTP_HOST:?}" "${FTP_USER:?}" "${FTP_PASS:?}" "${FTP_DIR:?}"
npm run build
lftp -u "$FTP_USER","$FTP_PASS" "$FTP_HOST" <<LFTP
set ftp:ssl-force true
set ssl:verify-certificate yes
mirror --reverse --verbose --only-newer --parallel=4 \
  --exclude-glob api/_data/*.php --exclude-glob api/_data/*/ --exclude api/config.php \
  public/ "$FTP_DIR"
bye
LFTP
echo "Deployed. Optional: npm run indexnow"
