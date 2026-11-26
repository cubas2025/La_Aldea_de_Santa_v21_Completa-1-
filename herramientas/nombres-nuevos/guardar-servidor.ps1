# Servidor local SOLO para la herramienta de corte: recibe los WAV cortados y los guarda en assets/nombres.
param([int]$Port = 8090)
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$dest = Join-Path $repo 'assets\nombres'
$out = $PSScriptRoot
$l = New-Object System.Net.HttpListener; $l.Prefixes.Add("http://127.0.0.1:$Port/"); $l.Start()
Write-Host "Guardando en $dest (puerto $Port)"
while ($l.IsListening) {
  $ctx = $l.GetContext(); $req = $ctx.Request; $res = $ctx.Response
  $res.Headers.Add('Access-Control-Allow-Origin', 'http://127.0.0.1:8080')
  $res.Headers.Add('Access-Control-Allow-Methods', 'POST, OPTIONS'); $res.Headers.Add('Access-Control-Allow-Headers', 'Content-Type')
  try {
    if ($req.HttpMethod -eq 'OPTIONS') { $res.StatusCode = 204; $res.Close(); continue }
    $name = $req.QueryString['archivo']
    if ($req.HttpMethod -ne 'POST' -or -not $name) { $res.StatusCode = 400; $res.Close(); continue }
    if ($name -match '^b4-\d{2}-\d{3}\.wav$') { $path = Join-Path $dest $name }
    elseif ($name -eq 'resultado.json') { $path = Join-Path $out $name }
    else { $res.StatusCode = 403; $res.Close(); continue }
    $ms = New-Object IO.MemoryStream; $req.InputStream.CopyTo($ms)
    [IO.File]::WriteAllBytes($path, $ms.ToArray())
    $res.StatusCode = 200; $b = [Text.Encoding]::UTF8.GetBytes('ok'); $res.OutputStream.Write($b, 0, $b.Length); $res.Close()
  } catch { try { $res.StatusCode = 500; $res.Close() } catch {} }
}
