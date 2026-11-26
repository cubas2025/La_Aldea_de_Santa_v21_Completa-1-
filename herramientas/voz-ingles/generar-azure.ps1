# Genera la voz en inglés de «Santa en vivo» con Microsoft Azure Speech (voces neuronales).
# La clave NUNCA va en este archivo: se lee de las variables de usuario de Windows.
#   Guardarlas (una vez):
#     [Environment]::SetEnvironmentVariable('AZURE_SPEECH_KEY','TU-CLAVE','User')
#     [Environment]::SetEnvironmentVariable('AZURE_SPEECH_REGION','eastus','User')
# Uso:
#   .\generar-azure.ps1 -Muestras                → muestras con varias voces masculinas para elegir
#   .\generar-azure.ps1 -Voz en-US-AndrewNeural  → genera el anuncio y los 864 nombres con esa voz
param([switch]$Muestras, [string]$Voz, [switch]$Sobrescribir)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$repo = Resolve-Path (Join-Path $here '..\..')
$key = [Environment]::GetEnvironmentVariable('AZURE_SPEECH_KEY', 'User'); if (-not $key) { $key = $env:AZURE_SPEECH_KEY }
$region = [Environment]::GetEnvironmentVariable('AZURE_SPEECH_REGION', 'User'); if (-not $region) { $region = $env:AZURE_SPEECH_REGION }
if (-not $key -or -not $region) { throw 'Faltan AZURE_SPEECH_KEY o AZURE_SPEECH_REGION (guárdalas como variables de usuario).' }
$region = $region.Trim().ToLowerInvariant() -replace '\s', ''
$base = "https://$region.tts.speech.microsoft.com/cognitiveservices"

function Get-Slug([string]$s) {
  $d = $s.Normalize([Text.NormalizationForm]::FormD)
  $sb = New-Object Text.StringBuilder
  foreach ($ch in $d.ToCharArray()) { if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch) -ne 'NonSpacingMark') { [void]$sb.Append($ch) } }
  return ([regex]::Replace($sb.ToString().ToLowerInvariant(), '[^a-z0-9]+', '-')).Trim('-')
}
function Esc([string]$s) { return [Security.SecurityElement]::Escape($s) }
function Ssml([string]$voice, [string]$inner) {
  $lang = ($voice -split '-')[0..1] -join '-'
  return "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='$lang'><voice name='$voice'>$inner</voice></speak>"
}
# Entonación: anuncio cálido y pausado; el nombre con énfasis y un tono alegre (si la voz lo admite).
function Announce([string]$voice) { Ssml $voice "<mstts:express-as style='friendly'><prosody rate='-8%' pitch='-2%'>And now... <break time='350ms'/> the next name on Santa's nice list is...</prosody></mstts:express-as>" }
function NameSsml([string]$voice, [string]$name) { Ssml $voice "<mstts:express-as style='cheerful' styledegree='0.8'><prosody rate='-12%'><emphasis level='moderate'>$(Esc $name)!</emphasis></prosody></mstts:express-as>" }
function Invoke-Tts([string]$ssml, [string]$outFile) {
  $headers = @{ 'Ocp-Apim-Subscription-Key' = $key; 'X-Microsoft-OutputFormat' = 'audio-24khz-96kbitrate-mono-mp3'; 'User-Agent' = 'aldea-santa-tts' }
  for ($try = 1; $try -le 5; $try++) {
    try {
      Invoke-WebRequest -Method Post -Uri "$base/v1" -Headers $headers -ContentType 'application/ssml+xml; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($ssml)) -OutFile $outFile -UseBasicParsing | Out-Null
      if ((Get-Item $outFile).Length -gt 500) { return }
    } catch {
      $code = $_.Exception.Response.StatusCode.value__
      if ($code -eq 401 -or $code -eq 403) { throw 'Azure rechazó la clave o la región. Revisa AZURE_SPEECH_KEY y AZURE_SPEECH_REGION.' }
      if ($try -eq 5) { throw "Azure no pudo generar el audio: $($_.Exception.Message)" }
    }
    Start-Sleep -Seconds (2 * $try)   # el plan gratuito limita la velocidad: espera y reintenta
  }
}

$available = (Invoke-RestMethod -Uri "$base/voices/list" -Headers @{ 'Ocp-Apim-Subscription-Key' = $key } -UseBasicParsing) | ForEach-Object { $_.ShortName }

if ($Muestras) {
  $dir = Join-Path $here 'muestras'; New-Item -ItemType Directory -Force $dir | Out-Null
  $candidatas = 'en-US-AndrewNeural','en-US-GuyNeural','en-US-DavisNeural','en-US-BrianNeural','en-US-ChristopherNeural','en-GB-RyanNeural' | Where-Object { $available -contains $_ }
  foreach ($v in $candidatas) {
    $inner = "<mstts:express-as style='friendly'><prosody rate='-8%' pitch='-2%'>And now... <break time='350ms'/> the next name on Santa's nice list is...</prosody></mstts:express-as><break time='300ms'/><mstts:express-as style='cheerful' styledegree='0.8'><prosody rate='-12%'><emphasis level='moderate'>Sofía!</emphasis></prosody></mstts:express-as>"
    $out = Join-Path $dir "muestra-$v.mp3"
    Invoke-Tts (Ssml $v $inner) $out
    "Muestra: $out"
  }
  return
}

if (-not $Voz) { throw 'Indica la voz con -Voz (primero puedes crear muestras con -Muestras).' }
if ($available -notcontains $Voz) { throw "La voz $Voz no está disponible en la región $region." }
$annDir = Join-Path $repo 'assets\en-vivo\en'; $namesDir = Join-Path $repo 'assets\nombres-en'
New-Item -ItemType Directory -Force $annDir, $namesDir | Out-Null
Invoke-Tts (Announce $Voz) (Join-Path $annDir 'anuncio.mp3'); 'Anuncio listo.'
$names = Import-Csv (Join-Path $here 'nombres-por-lote.csv') -Delimiter ';' -Encoding UTF8 | ForEach-Object { $_.nombre }
$i = 0; $hechos = 0
foreach ($name in $names) {
  $i++; $file = Join-Path $namesDir ((Get-Slug $name) + '.mp3')
  if ((Test-Path $file) -and -not $Sobrescribir) { continue }
  Invoke-Tts (NameSsml $Voz $name) $file; $hechos++
  Start-Sleep -Milliseconds 250
  if ($i % 50 -eq 0) { "… $i de $($names.Count)" }
}
"Listo: $hechos audios nuevos en assets\nombres-en (de $($names.Count) nombres)."
