# Suma los nombres cortados (resultado.json) al catálogo name-audio-data.js con su género.
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$utf8 = New-Object Text.UTF8Encoding($false)
$ninos = @'
Abner Abdías Abiel Adair Airam Anderson Andrey Antón Arián Arley Arnoldo Artemio Aziel Bayron Dáel Darel Darián Darwin Dayron Derian Diago Dilán Dorian Ediel Elam Eliud Emil Erwin Fabio Fabricio Favian Fredy Gadiel Giancarlo Gibrán Giuliano Haziel Heber Hiram Ilian Irving Ithiel Jaciel Jadiel Jamir Jassiel Jerson Jireh Joab Jomar Jostin Jován Juvenal Kael Keylor Lemuel Maikel Marvin Obed Odín Oriel Osiris Oziel Piero Remiel Romel Said Samir Elior Eriel Farid Gino Jeyson Kadir Lander Liel Luan Nahim Nayan Neylan Remi Roan Salim Vander Yahel Yaser Yeriel Zian Zarek Zamir Zahir Zayán Jhonatan Jibril Yunis Wilbert William Vito Urias Uzair Tamir Shamir Silvio Ander Eben Emeric Eren Fares Francesco Frank Kamil Malcom Maxen Meir Nicolai Orson Rainier Zuriel Sacha Shaddai Sander Santiel Zahid Atlas Zidan Steven Vittorio Ari Kiran Levy Lior Michel Ray Richard Franklin Douglas Danny Alí Elvis Elio Alirio Edwin Roger Eddy Anthony Nerio Edward Edixon Yorman Rómulo John Hermes Jackson Denny Euclides Jaziel Nathan Alessandro Paulo Dominic Jayden Jeremy Osmar Yosuani Kylian Vladimir Andrew Nael Lex Aarav Denzel Edrian Zayne Ezekiel Jaden Arden Jalen Bradley Imanol Estevan Fénix Gianmarco Gianfranco Helio Ilan Juliano Kaio Kairo Karlo Kenan Kian Leovanni Lyan
'@ -split '\s+' | Where-Object { $_ }
$boys = New-Object 'System.Collections.Generic.HashSet[string]'
foreach ($n in $ninos) { [void]$boys.Add($n) }
$items = Get-Content (Join-Path $PSScriptRoot 'resultado.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$path = Join-Path $repo 'name-audio-data.js'
$data = [IO.File]::ReadAllText($path, $utf8)
if ($data.Contains('assets/nombres/b4-')) { throw 'Ya se agregaron.' }
$entries = foreach ($it in $items) {
  $g = if ($boys.Contains($it.name)) { 'boy' } else { 'girl' }
  '{"name":' + (ConvertTo-Json $it.name) + ',"gender":"' + $g + '","src":"' + $it.src + '","duration":' + ([string]$it.duration).Replace(',', '.') + ',"lead":0.025}'
}
$end = $data.LastIndexOf(']')
$data = $data.Substring(0, $end) + ',' + ($entries -join ',') + $data.Substring($end)
[IO.File]::WriteAllText($path, $data, $utf8)
$b = ($items | Where-Object { $boys.Contains($_.name) }).Count
"Agregados: $($items.Count) (niños: $b, niñas: $($items.Count - $b))"
