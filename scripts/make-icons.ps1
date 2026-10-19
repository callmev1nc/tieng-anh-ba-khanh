# Generates PWA icons (pwa-192.png, pwa-512.png, apple-touch-icon.png)
# Blue tile, white circle, blue scissors — no dependencies beyond .NET GDI+.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$public = Join-Path $root 'public'
if (-not (Test-Path $public)) { New-Item -ItemType Directory -Path $public | Out-Null }

function New-ScissorsIcon([string]$path, [int]$size) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $blue = [System.Drawing.Color]::FromArgb(255, 29, 78, 216)   # #1D4ED8
    $white = [System.Drawing.Color]::White
    $g.Clear($blue)

    # white circle
    $circleBrush = New-Object System.Drawing.SolidBrush($white)
    $cd = [int]($size * 0.72)
    $cx = [int](($size - $cd) / 2)
    $g.FillEllipse($circleBrush, $cx, $cx, $cd, $cd)

    # scissors: two blades crossing + two handle rings
    $penWidth = [float]($size * 0.052)
    $pen = New-Object System.Drawing.SolidBrush($blue)
    $linePen = New-Object System.Drawing.Pen($blue, $penWidth)
    $linePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $linePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    $s = [float]$size
    $g.DrawLine($linePen, $s * 0.40, $s * 0.32, $s * 0.58, $s * 0.66)
    $g.DrawLine($linePen, $s * 0.60, $s * 0.32, $s * 0.42, $s * 0.66)

    $ringPen = New-Object System.Drawing.Pen($blue, $penWidth)
    $ringPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $ringPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $rr = $s * 0.07
    $g.DrawEllipse($ringPen, $s * 0.60 - $rr, $s * 0.72 - $rr, $rr * 2, $rr * 2)
    $g.DrawEllipse($ringPen, $s * 0.40 - $rr, $s * 0.72 - $rr, $rr * 2, $rr * 2)

    $g.Dispose()
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "made $path ($size px)"
}

New-ScissorsIcon (Join-Path $public 'pwa-192.png') 192
New-ScissorsIcon (Join-Path $public 'pwa-512.png') 512
New-ScissorsIcon (Join-Path $public 'apple-touch-icon.png') 180
