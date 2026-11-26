# Genera la voz en inglés de «Santa en vivo» con Google Cloud Text-to-Speech.
# La clave NUNCA va en este archivo: se lee de la variable de usuario GOOGLE_TTS_KEY.
#   Guardarla (una vez):  [Environment]::SetEnvironmentVariable('GOOGLE_TTS_KEY','TU-CLAVE','User')
# Uso:
#   .\generar-google.ps1 -Muestras            → crea muestras con varias voces masculinas para elegir
#   .\generar-google.ps1 -Voz en-US-Studio-Q  → genera el anuncio y los 864 nombres con esa voz
param([switch]$Muestras, [string]$Voz, [switch]$Sobrescribir)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$repo = Resolve-Path (Join-Path $here '..\..')
$key = [Environment]::GetEnvironmentVariable('GOOGLE_TTS_KEY', 'User')
if (-not $key) { $key = $env:GOOGLE_TTS_KEY }
if (-not $key) { throw 'Falta la clave: guarda GOOGLE_TTS_KEY como variable de usuario.' }
$api = 'https://texttospeech.googleapis.com/v1'
$headers = @{ 'X-Goog-Api-Key' = $key }

function Get-Slug([string]$s) {
  $d = $s.Normalize([Text.NormalizationForm]::FormD)
  $sb = New-Object Text.StringBuilder
  foreach ($ch in $d.ToCharArray()) { if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch) -ne 'NonSpacingMark') { [void]$sb.Append($ch) } }
  return ([regex]::Replace($sb.ToString().ToLowerInvariant(), '[^a-z0-9]+', '-')).Trim('-')
}
function Esc([string]$s) { return [Security.SecurityElement]::Escape($s) }
function Invoke-Tts([string]$voice, [string]$input, [bool]$ssml, [string]$outFile) {
  $lang = ($voice -split '-')[0..1] -join '-'
  $body = @{
    input = if ($ssml) { @{ ssml = $input } } else { @{ text = $input } }
    voice = @{ languageCode = $lang; name = $voice }
    audioConfig = @{ audioEncoding = 'MP3'; sampleRateHertz = 24000; effectsProfileId = @('headphone-class-device') }
  } | ConvertTo-Json -Depth 5
  for ($try = 1; $try -le 4; $try++) {
    try {
      $r = Invoke-RestMethod -Method Post -Uri "$api/text:synthesize" -Headers $headers -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($body))
      [IO.File]::WriteAllBytes($outFile, [Convert]::FromBase64String($r.audioContent)); return
    } catch {
      if ($try -eq 4) { throw "Google rechazó la solicitud ($voice): $($_.Exception.Message)" }
      Start-Sleep -Seconds (2 * $try)
    }
  }
}
# Las voces «Chirp» solo aceptan texto simple; las demás aceptan SSML (pausas y entonación).
function Announce-Input([string]$voice) {
  if ($voice -match 'Chirp') { return @("And now... the next name on Santa's nice list is...", $false) }
  return @('<speak><prosody rate="92%" pitch="-1st">And now... <break time="350ms"/> the next name on Santa''s nice list is...</prosody></speak>', $true)
}
function Name-Input([string]$voice, [string]$name) {
  if ($voice -match 'Chirp') { return @("$name!", $false) }
  return @("<speak><prosody rate=`"88%`"><emphasis level=`"moderate`">$(Esc $name)!</emphasis></prosody></speak>", $true)
}

$available = (Invoke-RestMethod -Uri "$api/voices?languageCode=en" -Headers $headers).voices | ForEach-Object { $_.name }

if ($Muestras) {
  $dir = Join-Path $here 'muestras'; New-Item -ItemType Directory -Force $dir | Out-Null
  $candidatas = 'en-US-Chirp3-HD-Charon','en-US-Chirp3-HD-Orus','en-US-Chirp3-HD-Fenrir','en-US-Studio-Q','en-US-Neural2-J','en-GB-Neural2-B','en-GB-Studio-B' | Where-Object { $available -contains $_ }
  foreach ($v in $candidatas) {
    $a = Announce-Input $v; $n = Name-Input $v 'Sofía'
    $tmpA = Join-Path $dir "$v-a.mp3"; $tmpN = Join-Path $dir "$v-b.mp3"
    Invoke-Tts $v $a[0] $a[1] $tmpA; Invoke-Tts $v $n[0] $n[1] $tmpN
    # Une anuncio + nombre en una sola muestra (los MP3 se pueden concatenar).
    $out = Join-Path $dir "muestra-$v.mp3"
    [IO.File]::WriteAllBytes($out, [IO.File]::ReadAllBytes($tmpA) + [IO.File]::ReadAllBytes($tmpN))
    Remove-Item $tmpA, $tmpN
    "Muestra: $out"
  }
  return
}

if (-not $Voz) { throw 'Indica la voz con -Voz (primero puedes crear muestras con -Muestras).' }
if ($available -notcontains $Voz) { throw "La voz $Voz no está disponible en tu cuenta." }
$annDir = Join-Path $repo 'assets\en-vivo\en'; $namesDir = Join-Path $repo 'assets\nombres-en'
New-Item -ItemType Directory -Force $annDir, $namesDir | Out-Null
$a = Announce-Input $Voz; Invoke-Tts $Voz $a[0] $a[1] (Join-Path $annDir 'anuncio.mp3'); 'Anuncio listo.'
$names = Import-Csv (Join-Path $here 'nombres-por-lote.csv') -Delimiter ';' -Encoding UTF8 | ForEach-Object { $_.nombre }
$i = 0; $hechos = 0
foreach ($name in $names) {
  $i++; $file = Join-Path $namesDir ((Get-Slug $name) + '.mp3')
  if ((Test-Path $file) -and -not $Sobrescribir) { continue }
  $n = Name-Input $Voz $name; Invoke-Tts $Voz $n[0] $n[1] $file; $hechos++
  if ($i % 50 -eq 0) { "… $i de $($names.Count)" }
}
"Listo: $hechos audios nuevos en assets\nombres-en (de $($names.Count) nombres)."
