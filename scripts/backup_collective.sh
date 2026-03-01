#!/bin/bash
# Liminal Borg: Collective Backup Script
# Snapshot entire software sprawl into archives.

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="collective_snapshot_${TIMESTAMP}.tgz"
DEST_DIR="/home/bpfur/archives/collective"

echo "🦾 SENTINEL: Initiating collective backup..."
mkdir -p "$DEST_DIR"

tar --exclude='node_modules' --exclude='.git' -czf "${DEST_DIR}/${BACKUP_NAME}" -C /home/bpfur collective

if [ $? -eq 0 ]; then
    echo "✅ SUCCESS: Collective archived at ${DEST_DIR}/${BACKUP_NAME}"
else
    echo "❌ FAILURE: Backup failed."
    exit 1
fi
