$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Get-ChildItem -LiteralPath $PSScriptRoot -Filter '*-10장.zip' | ForEach-Object {
  $folder = Join-Path $PSScriptRoot ($_.BaseName -replace '-10장$','')
  New-Item -ItemType Directory -Path $folder -Force | Out-Null
  $archive = [System.IO.Compression.ZipFile]::OpenRead($_.FullName)
  try {
    foreach ($entry in $archive.Entries) {
      if ($entry.Name -notmatch '^\d{2}-\d{2}\.png$' -or $entry.FullName -ne $entry.Name) { throw 'Unexpected archive entry' }
      [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry,(Join-Path $folder $entry.Name),$true)
    }
  } finally { $archive.Dispose() }
}
Write-Output '7편의 사진을 모두 풀었습니다. 같은 폴더의 index.html을 열어주세요.'
