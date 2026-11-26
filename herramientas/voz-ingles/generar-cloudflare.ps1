# Genera la voz en inglés de «Santa en vivo» con Cloudflare Workers AI (voces Deepgram Aura).
# Usa tu misma cuenta de Cloudflare. El plan gratuito da 10 000 «neuronas» al día:
# si se acaban, el programa se detiene y al día siguiente continúa donde quedó.
# La clave NUNCA va en este archivo: se lee de las variables de usuario de Windows.
#   [Environment]::SetEnvironmentVariable('CLOUDFLARE_ACCOUNT_ID','TU-ACCOUNT-ID','User')
#   [Environment]::SetEnvironmentVariable('CLOUDFLARE_AI_TOKEN','TU-TOKEN','User')
# Uso:
#   .\generar-cloudflare.ps1 -Muestras            → muestras con varias voces para elegir
#   .\generar-cloudflare.ps1 -Voz orion           → genera el anuncio y los 864 nombres
#   (opcional) -Modelo aura-2-en                  → voces Aura 2 (más naturales, gastan el doble)
param([switch]$Muestras, [string]$Voz, [string]$Modelo = 'aura-1', [switch]$Sobrescribir)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$repo = Resolve-Path (Join-Path $here '..\..')
$account = [Environment]::GetEnvironmentVariable('CLOUDFLARE_ACCOUNT_ID', 'User'); if (-not $account) { $account = $env:CLOUDFLARE_ACCOUNT_ID }
$token = [Environment]::GetEnvironmentVariable('CLOUDFLARE_AI_TOKEN', 'User'); if (-not $token) { $token = $env:CLOUDFLARE_AI_TOKEN }
if (-not $account -or -not $token) { throw 'Faltan CLOUDFLARE_ACCOUNT_ID o CLOUDFLARE_AI_TOKEN (guárdalas como variables de usuario).' }
$url = "https://api.cloudflare.com/client/v4/accounts/$($account.Trim())/ai/run/@cf/deepgram/$Modelo"

function Get-Slug([string]$s) {
  $d = $s.Normalize([Text.NormalizationForm]::FormD)
  $sb = New-Object Text.StringBuilder
  foreach ($ch in $d.ToCharArray()) { if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch) -ne 'NonSpacingMark') { [void]$sb.Append($ch) } }
  return ([regex]::Replace($sb.ToString().ToLowerInvariant(), '[^a-z0-9]+', '-')).Trim('-')
}
class LimitReached : Exception { LimitReached([string]$m) : base($m) {} }
function Invoke-Tts([string]$text, [string]$speaker, [string]$outFile) {
  $body = @{ text = $text; speaker = $speaker; encoding = 'mp3' } | ConvertTo-Json
  for ($try = 1; $try -le 4; $try++) {
    try {
      $tmp = "$outFile.part"
      $r = Invoke-WebRequest -Method Post -Uri $url -Headers @{ Authorization = "Bearer $($token.Trim())" } -ContentType 'application/json' -Body ([Text.Encoding]::UTF8.GetBytes($body)) -OutFile $tmp -PassThru -UseBasicParsing
      $bytes = [IO.File]::ReadAllBytes($tmp); Remove-Item $tmp
      if ($r.Headers['Content-Type'] -match 'json') {   # por si la respuesta llega como JSON con el audio en base64
        $j = [Text.Encoding]::UTF8.GetString($bytes) | ConvertFrom-Json
        $b64 = if ($j.result.audio) { $j.result.audio } elseif ($j.audio) { $j.audio } else { $null }
        if (-not $b64) { throw 'Respuesta sin audio.' }
        $bytes = [Convert]::FromBase64String($b64)
      }
      if ($bytes.Length -lt 500) { throw 'Audio vacío.' }
      [IO.File]::WriteAllBytes($outFile, $bytes); return
    } catch {
      $code = $_.Exception.Response.StatusCode.value__
      if ($code -eq 401 -or $code -eq 403) { throw 'Cloudflare rechazó el token o el Account ID. Revisa CLOUDFLARE_AI_TOKEN y CLOUDFLARE_ACCOUNT_ID.' }
      if ($code -eq 429 -or ("$_" -match 'neuron|limit|quota')) { throw [LimitReached]::new('Se acabó el uso gratuito de hoy. Vuelve a ejecutar mañana: continúa donde quedó.') }
      if ($try -eq 4) { throw "Cloudflare no pudo generar el audio: $($_.Exception.Message)" }
      Start-Sleep -Seconds (2 * $try)
    }
  }
}
$ANNOUNCE = "And now... the next name on Santa's nice list is..."

if ($Muestras) {
  $dir = Join-Path $here 'muestras'; New-Item -ItemType Directory -Force $dir | Out-Null
  $voces = if ($Modelo -eq 'aura-1') { 'orion','arcas','angus','helios','zeus','orpheus','perseus' } else { 'orion','orpheus','atlas','hyperion','odysseus','zeus','apollo' }
  foreach ($v in $voces) {
    $a = Join-Path $dir "a.mp3"; $b = Join-Path $dir "b.mp3"
    Invoke-Tts $ANNOUNCE $v $a; Invoke-Tts 'Sofía!' $v $b
    $out = Join-Path $dir "muestra-$Modelo-$v.mp3"
    [IO.File]::WriteAllBytes($out, [IO.File]::ReadAllBytes($a) + [IO.File]::ReadAllBytes($b)); Remove-Item $a, $b
    "Muestra: $out"
  }
  return
}

if (-not $Voz) { throw 'Indica la voz con -Voz (primero puedes crear muestras con -Muestras).' }
$annDir = Join-Path $repo 'assets\en-vivo\en'; $namesDir = Join-Path $repo 'assets\nombres-en'
New-Item -ItemType Directory -Force $annDir, $namesDir | Out-Null
$names = Import-Csv (Join-Path $here 'nombres-por-lote.csv') -Delimiter ';' -Encoding UTF8 | ForEach-Object { $_.nombre }
$hechos = 0
try {
  $annFile = Join-Path $annDir 'anuncio.mp3'
  if (-not (Test-Path $annFile) -or $Sobrescribir) { Invoke-Tts $ANNOUNCE $Voz $annFile; 'Anuncio listo.' }
  $i = 0
  foreach ($name in $names) {
    $i++; $file = Join-Path $namesDir ((Get-Slug $name) + '.mp3')
    if ((Test-Path $file) -and -not $Sobrescribir) { continue }
    Invoke-Tts "$name!" $Voz $file; $hechos++
    if ($i % 50 -eq 0) { "… $i de $($names.Count)" }
  }
  "Listo: $hechos audios nuevos. Todos los nombres tienen voz en inglés."
} catch [LimitReached] {
  $faltan = ($names | Where-Object { -not (Test-Path (Join-Path $namesDir ((Get-Slug $_) + '.mp3'))) }).Count
  "Hoy se generaron $hechos audios. Faltan ${faltan}: $($_.Exception.Message)"
}
