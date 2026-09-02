Add-Type -AssemblyName System.Drawing

$sourcePath = "e:\Insha-web\public\images\New-logo.jpeg"
$bmp = [System.Drawing.Bitmap]::FromFile($sourcePath)

$minX = $bmp.Width
$minY = $bmp.Height
$maxX = 0
$maxY = 0

# Sample pixels to find the logo bounding box
for ($y = 0; $y -lt $bmp.Height; $y += 2) {
    for ($x = 0; $x -lt $bmp.Width; $x += 2) {
        $pixel = $bmp.GetPixel($x, $y)
        # Check for non-white/near-white pixels
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

Write-Host "Detected logo bounds: X=$minX, Y=$minY, Width=$contentW, Height=$contentH"

# Make a square bounding box centered around the content with 6% comfortable margin
$side = [Math]::Max($contentW, $contentH)
$padding = [int]($side * 0.06)
$boxSide = $side + ($padding * 2)

$centerX = $minX + ($contentW / 2)
$centerY = $minY + ($contentH / 2)

$cropX = [Math]::Max(0, [int]($centerX - ($boxSide / 2)))
$cropY = [Math]::Max(0, [int]($centerY - ($boxSide / 2)))

if ($cropX + $boxSide -gt $bmp.Width) {
    $cropX = $bmp.Width - $boxSide
}
if ($cropY + $boxSide -gt $bmp.Height) {
    $cropY = $bmp.Height - $boxSide
}
if ($cropX -lt 0) { $cropX = 0 }
if ($cropY -lt 0) { $cropY = 0 }

$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, [Math]::Min($boxSide, $bmp.Width - $cropX), [Math]::Min($boxSide, $bmp.Height - $cropY))
Write-Host "Cropping square region: X=$($cropRect.X), Y=$($cropRect.Y), W=$($cropRect.Width), H=$($cropRect.Height)"

# Create cropped square logo
$cropped = New-Object System.Drawing.Bitmap($cropRect.Width, $cropRect.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gCrop = [System.Drawing.Graphics]::FromImage($cropped)
$gCrop.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gCrop.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gCrop.Clear([System.Drawing.Color]::Transparent)
$gCrop.DrawImage($bmp, 0, 0, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$gCrop.Dispose()

# Helper to resize
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

    # Transparent background
    $g.Clear([System.Drawing.Color]::Transparent)

    $destRect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $g.DrawImage($source, $destRect, 0, 0, $source.Width, $source.Height, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()

    return $destImage
}

function Get-PngBytes {
    param([System.Drawing.Bitmap]$bitmap)
    $ms = New-Object System.IO.MemoryStream
    $bitmap.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bytes = $ms.ToArray()
    $ms.Dispose()
    return $bytes
}

function Save-IcoFile {
    param(
        [string]$outputPath,
        [array]$pngEntries
    )

    $ms = New-Object System.IO.MemoryStream
    $writer = New-Object System.IO.BinaryWriter($ms)

    # Header: Reserved(2), Type(2, 1=ICO), Count(2)
    $writer.Write([uint16]0)
    $writer.Write([uint16]1)
    $writer.Write([uint16]$pngEntries.Count)

    $offset = 6 + ($pngEntries.Count * 16)

    foreach ($entry in $pngEntries) {
        $w = if ($entry.Width -ge 256) { [byte]0 } else { [byte]$entry.Width }
        $h = if ($entry.Height -ge 256) { [byte]0 } else { [byte]$entry.Height }
        $writer.Write($w)
        $writer.Write($h)
        $writer.Write([byte]0)
        $writer.Write([byte]0)
        $writer.Write([uint16]1)
        $writer.Write([uint16]32)
        $writer.Write([uint32]$entry.Bytes.Length)
        $writer.Write([uint32]$offset)
        $offset += $entry.Bytes.Length
    }

    foreach ($entry in $pngEntries) {
        $writer.Write($entry.Bytes)
    }

    $writer.Flush()
    [System.IO.File]::WriteAllBytes($outputPath, $ms.ToArray())
    $writer.Dispose()
    $ms.Dispose()
    Write-Host "Created ICO: $outputPath"
}

# Generate resolutions
$ico16 = Resize-Logo -source $cropped -size 16
$ico32 = Resize-Logo -source $cropped -size 32
$ico48 = Resize-Logo -source $cropped -size 48
$ico64 = Resize-Logo -source $cropped -size 64
$ico128 = Resize-Logo -source $cropped -size 128
$ico180 = Resize-Logo -source $cropped -size 180
$ico192 = Resize-Logo -source $cropped -size 192
$ico512 = Resize-Logo -source $cropped -size 512

$b16 = Get-PngBytes -bitmap $ico16
$b32 = Get-PngBytes -bitmap $ico32
$b48 = Get-PngBytes -bitmap $ico48
$b64 = Get-PngBytes -bitmap $ico64
$b128 = Get-PngBytes -bitmap $ico128
$b180 = Get-PngBytes -bitmap $ico180
$b192 = Get-PngBytes -bitmap $ico192
$b512 = Get-PngBytes -bitmap $ico512

$icoList = @(
    @{ Width = 16; Height = 16; Bytes = $b16 },
    @{ Width = 32; Height = 32; Bytes = $b32 },
    @{ Width = 48; Height = 48; Bytes = $b48 },
    @{ Width = 64; Height = 64; Bytes = $b64 }
)

# Output multi-size ICO
Save-IcoFile -outputPath "e:\Insha-web\app\favicon.ico" -pngEntries $icoList
Save-IcoFile -outputPath "e:\Insha-web\public\favicon.ico" -pngEntries $icoList

# Output PNG icons
[System.IO.File]::WriteAllBytes("e:\Insha-web\app\icon.png", $b32)
[System.IO.File]::WriteAllBytes("e:\Insha-web\public\icon.png", $b32)
[System.IO.File]::WriteAllBytes("e:\Insha-web\public\favicon-16x16.png", $b16)
[System.IO.File]::WriteAllBytes("e:\Insha-web\public\favicon-32x32.png", $b32)
[System.IO.File]::WriteAllBytes("e:\Insha-web\app\apple-icon.png", $b180)
[System.IO.File]::WriteAllBytes("e:\Insha-web\public\apple-icon.png", $b180)
[System.IO.File]::WriteAllBytes("e:\Insha-web\public\apple-touch-icon.png", $b180)
[System.IO.File]::WriteAllBytes("e:\Insha-web\public\icon-192.png", $b192)
[System.IO.File]::WriteAllBytes("e:\Insha-web\public\icon-512.png", $b512)

Write-Host "All Insha Collections favicons generated perfectly with centered branding!"

$bmp.Dispose()
$cropped.Dispose()
$ico16.Dispose()
$ico32.Dispose()
$ico48.Dispose()
$ico64.Dispose()
$ico128.Dispose()
$ico180.Dispose()
$ico192.Dispose()
$ico512.Dispose()
