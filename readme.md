#How to launch the application
1. Open a powershell prompt and navigate to the root directory of the repo
    - This can be made easier by navigating to the QR-App folder in a file explorer and then typing "powershell" in the address bar
2. In the powersehll promot execute the following command: `./scripts/launch.ps1`
  - Using a custom launch script, this will start all 3 apps in separate powershell prompts
3. You can view the apps in a web browser here:
 - Primary app:  [http://localhost:8000](http://localhost:8000)
 - frontend app (in the admin folder): [http://localhost:5173/](http://localhost:5173/)

## SQLite database for the API
1. Copy `api/.env.example` to `api/.env` and adjust the values as needed. The default `DATABASE_URL` points Prisma at a SQLite database stored at `api/prisma/dev.db`.
2. From the repo root, run `npm install` to ensure Prisma is available.
3. When you start the API (`npm --workspace api run dev`), it will automatically create the SQLite database if it is missing or apply any Prisma migrations present in `api/prisma/migrations`. You can still reset/seed manually with `npm run prisma:reset` if needed.