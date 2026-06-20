#!/bin/sh

set -ex

# Push the Prisma schema to the database (which is mounted at /data)
npx prisma db push --skip-generate

# Start the Next.js server
exec node server.js
