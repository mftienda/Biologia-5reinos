$ErrorActionPreference = 'Stop'
$folder = Join-Path $PSScriptRoot 'materiales'
$items = [ordered]@{}
Get-ChildItem -LiteralPath $folder -Filter '*.html' -File | Sort-Object Name | ForEach-Object {
    $items[$_.BaseName] = [IO.File]::ReadAllText($_.FullName)
}
$json = ConvertTo-Json -InputObject $items -Compress
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'materiales.js'), "window.materialesBiologia = $json;", [Text.UTF8Encoding]::new($false))
