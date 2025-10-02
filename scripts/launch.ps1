# Relative paths used to launch apps
$apiPath = "./api";
$adminPath = "./admin";

# Launching the primary app at the root of the repository
Start-Process powershell -ArgumentList "-NoExit", "-command Write-Host 'Starting the primary app'; python -m http.server";

# Launching the backend app - in the api folder.
Start-Process powershell -ArgumentList "-NoExit", "-command cd api; Write-Host 'Starting tha backend app (in the api folder)'; npm run dev";

# Launching the frontend app - in the admin folder.
Start-Process powershell -ArgumentList "-NoExit", "-command cd admin; Write-Host 'Starting tha frontend app (in the admin folder)'; npm run dev";
