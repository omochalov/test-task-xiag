# test-task-xiag

## System requirements
- Docker-compose compatible system
- PostgreSQL compatible system
- Node version > 9.11 (tested on 9.11.2, 10.16.1, 12.7.0)

## How to deploy database and install dependencies
- `sudo docker-compose up`
- `npm install`
- `npm run db-init`

## How to run application
- Deploy database
- `npm start`

## How to run tests
- Deploy database
- `npm run test`
