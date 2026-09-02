Add-Type -AssemblyName System.Drawing

$sourcePath = "e:\Insha-web\public\images\New-logo.jpeg"
$bmp = [System.Drawing.Bitmap]::FromFile($sourcePath)

# Find content bounds
$minX = $bmp.Width
$minY = $bmp.Height
$maxX = 0
$maxY = 0

for ($y = 0; $y -lt $bmp.Height; $y += 2) {
    for ($x = 0; $x -lt $bmp.Width; $x += 2) {
        $pixel = $bmp.GetPixel($x, $y)
        if ($pixel.R -lt 242 -or $pixel.G -lt 242 -or $pixel.B -lt 242) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$contentW = $maxX - $minX
$contentH = $maxY - $minY

$side = [Math]::Max($contentW, $contentH)
$padding = [int]($side * 0.06)
$boxSide = $side + ($padding * 2)

$centerX = $minX + ($contentW / 2)
$centerY = $minY + ($contentH / 2)

$cropX = [Math]::Max(0, [int]($centerX - ($boxSide / 2)))
$cropY = [Math]::Max(0, [int]($centerY - ($boxSide / 2)))

if ($cropX + $boxSide -gt $bmp.Width) { $cropX = $bmp.Width - $boxSide }
if ($cropY + $boxSide -gt $bmp.Height) { $cropY = $bmp.Height - $boxSide }
if ($cropX -lt 0) { $cropX = 0 }
if ($cropY -lt 0) { $cropY = 0 }

$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, [Math]::Min($boxSide, $bmp.Width - $cropX), [Math]::Min($boxSide, $bmp.Height - $cropY))

$cropped = New-Object System.Drawing.Bitmap($cropRect.Width, $cropRect.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gCrop = [System.Drawing.Graphics]::FromImage($cropped)
$gCrop.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gCrop.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gCrop.Clear([System.Drawing.Color]::Transparent)
$gCrop.DrawImage($bmp, 0, 0, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$gCrop.Dispose()

function Resize-Logo {
    param(
        [System.Drawing.Bitmap]$source,
        [int]$size
    )

    $destImage = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($destImage)
    $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $g.Clear([System.Drawing.Color]::Transparent)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $g.DrawImage($source, $destRect, 0, 0, $source.Width, $source.Height, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()

    return $destImage
}

# Generate 32x32, 16x16, 180x180, 192x192, 512x512
$bmp32 = Resize-Logo -source $cropped -size 32
$bmp16 = Resize-Logo -source $cropped -size 16
$bmp180 = Resize-Logo -source $cropped -size 180
$bmp192 = Resize-Logo -source $cropped -size 192
$bmp512 = Resize-Logo -source $cropped -size 512

# Save Standard Windows Icon (.ico) using standard Win32 HICON
$hIcon = $bmp32.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)

$fsApp = [System.IO.File]::Create("e:\Insha-web\app\favicon.ico")
$icon.Save($fsApp)
$fsApp.Close()

$fsPub = [System.IO.File]::Create("e:\Insha-web\public\favicon.ico")
$icon.Save($fsPub)
$fsPub.Close()

$icon.Dispose()

# Save PNG assets
$bmp32.Save("e:\Insha-web\app\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp32.Save("e:\Insha-web\public\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp32.Save("e:\Insha-web\public\favicon-32x32.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp16.Save("e:\Insha-web\public\favicon-16x16.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp180.Save("e:\Insha-web\app\apple-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp180.Save("e:\Insha-web\public\apple-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp180.Save("e:\Insha-web\public\apple-touch-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp192.Save("e:\Insha-web\public\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp512.Save("e:\Insha-web\public\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)

Write-Host "Standard ICO and PNG icons successfully saved!"

$bmp.Dispose()
$cropped.Dispose()
$bmp32.Dispose()
$bmp16.Dispose()
$bmp180.Dispose()
$bmp192.Dispose()
$bmp512.Dispose()
