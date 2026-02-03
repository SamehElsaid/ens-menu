# Clean Next.js cache script
Write-Host "Cleaning Next.js cache..." -ForegroundColor Yellow

# Remove .next folder
if (Test-Path .next) {
    Write-Host "Removing .next folder..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host ".next folder removed successfully!" -ForegroundColor Green
} else {
    Write-Host ".next folder not found, skipping..." -ForegroundColor Gray
}

# Optional: Clear node_modules/.cache if it exists
if (Test-Path "node_modules\.cache") {
    Write-Host "Removing node_modules/.cache..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction SilentlyContinue
    Write-Host "node_modules/.cache removed successfully!" -ForegroundColor Green
}

Write-Host "`nCache cleanup complete! You can now restart your dev server with 'npm run dev'" -ForegroundColor Green
