# Script para corregir encoding UTF-8 en archivos Vue de administración
# Ejecutar desde la raíz del proyecto CafeSanJuanVue

Write-Host "?? Corrigiendo encoding UTF-8 en páginas de administración..." -ForegroundColor Cyan

$files = @(
    "pages/admin-facturacion/+Page.vue",
    "pages/admin-mesas/+Page.vue",
    "pages/admin-menu/+Page.vue",
    "pages/admin-clientes/+Page.vue",
    "pages/admin-promociones/+Page.vue"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
 
    if (Test-Path $fullPath) {
        Write-Host "  ? Procesando: $file" -ForegroundColor Green
     
 # Leer contenido con UTF-8
      $content = Get-Content $fullPath -Raw -Encoding UTF8
        
        # Reescribir con UTF-8 sin BOM
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($fullPath, $content, $utf8NoBom)
  
     Write-Host "    ? Archivo actualizado con UTF-8 sin BOM" -ForegroundColor Gray
  } else {
        Write-Host "  ? No encontrado: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "? Encoding UTF-8 corregido exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "?? Caracteres especiales corregidos:" -ForegroundColor Yellow
Write-Host "  • Gestión ? Gestión" -ForegroundColor White
Write-Host "  • Facturación ? Facturación" -ForegroundColor White
Write-Host "  • Menú ? Menú" -ForegroundColor White
Write-Host "  • Búsqueda ? Búsqueda" -ForegroundColor White
Write-Host "  • Promoción ? Promoción" -ForegroundColor White
Write-Host "  • Descripción ? Descripción" -ForegroundColor White
