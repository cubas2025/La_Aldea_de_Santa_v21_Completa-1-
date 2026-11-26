# Guarda tu token de Cloudflare (Workers AI) en Windows sin mostrarlo en pantalla.
Write-Host ''
Write-Host 'Pega tu token de Cloudflare (clic derecho o Ctrl+V) y pulsa Enter.' -ForegroundColor Yellow
Write-Host 'No se verá lo que pegas: es normal.' -ForegroundColor Yellow
$secure = Read-Host 'Token' -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try { $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr).Trim() } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
if ($token.Length -lt 20) { Write-Host 'Eso no parece un token (muy corto). Vuelve a intentarlo.' -ForegroundColor Red; return }
[Environment]::SetEnvironmentVariable('CLOUDFLARE_AI_TOKEN', $token, 'User')
Remove-Variable token
Write-Host 'Listo: token guardado en tu PC. Ya puedes volver al chat y escribir «listo».' -ForegroundColor Green
