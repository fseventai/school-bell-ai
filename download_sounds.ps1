[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$targetDir = "c:\Developments\school-bell-ai\static\sounds\only-bell-sounds"
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
cd $targetDir
Remove-Item *.m4a -ErrorAction SilentlyContinue
Remove-Item *.opus -ErrorAction SilentlyContinue
Remove-Item *.mp3 -ErrorAction SilentlyContinue

Invoke-WebRequest -Uri "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe" -OutFile "yt-dlp.exe"
.\yt-dlp.exe --no-mtime --extract-audio --audio-format mp3 --audio-quality 0 -o "%(title)s.%(ext)s" "ytsearch5:efek suara bel sekolah"
Remove-Item yt-dlp.exe
