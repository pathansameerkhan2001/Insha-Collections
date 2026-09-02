Add-Type -AssemblyName System.Drawing

$sourcePath = "e:\Insha-web\public\images\New-logo.jpeg"
if (-not (Test-Path $sourcePath)) {
    $sourcePath = "e:\Insha-web\public\new-logo.png"
}

Write-Host "Source image: $sourcePath"

$srcImage = [System.Drawing.Bitmap]::FromFile($sourcePath)
Write-Host "Original dimensions: $($srcImage.Width) x $($srcImage.Height)"

# Function to resize bitmap with high quality
function Resize-Image {
    param(
        [System.Drawing.Bitmap]$source,
        [int]$width,
        [int]$height,
        [bool]$makeCircular = $false
    )

    $destRect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
    $destImage = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    $graphics = [System.Drawing.Graphics]::FromImage($destImage)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Transparent background
    $graphics.Clear([System.Drawing.Color]::Transparent)

    # Maintain aspect ratio within target bounding box
    $scale = [Math]::Min([double]$width / $source.Width, [double]$height / $source.Height)
    $drawWidth = [int]($source.Width * $scale)
    $drawHeight = [int]($source.Height * $scale)
    $drawX = [int](($width - $drawWidth) / 2)
    $drawY = [int](($height - $drawHeight) / 2)

    $wrapMode = New-Object System.Drawing.Imaging.ImageAttributes
    $wrapMode.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)

    $drawRect = New-Object System.Drawing.Rectangle($drawX, $drawY, $drawWidth, $drawHeight)
    $graphics.DrawImage($source, $drawRect, 0, 0, $source.Width, $source.Height, [System.Drawing.GraphicsUnit]::Pixel, $wrapMode)
    $graphics.Dispose()

    return $destImage
}

# Function to convert bitmap to PNG byte array
function Get-PngBytes {
    param([System.Drawing.Bitmap]$bitmap)
    $ms = New-Object System.IO.MemoryStream
    $bitmap.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bytes = $ms.ToArray()
    $ms.Dispose()
    return $bytes
}

# Function to create multi-resolution ICO file from PNG byte arrays
function Save-IcoFile {
    param(
        [string]$outputPath,
        [array]$pngEntries # array of hashtables @{ Width=16; Height=16; Bytes=@(...) }
    )

    $ms = New-Object System.IO.MemoryStream
    $writer = New-Object System.IO.BinaryWriter($ms)

    # Header: Reserved(2), Type(2, 1=ICO), Count(2)
    $writer.Write([uint16]0)
    $writer.Write([uint16]1)
    $writer.Write([uint16]$pngEntries.Count)

    # Calculate starting offset for image data
    # Header = 6 bytes, Directory entry = 16 bytes each
    $offset = 6 + ($pngEntries.Count * 16)

    # Write Directory Entries
    foreach ($entry in $pngEntries) {
        $w = if ($entry.Width -ge 256) { [byte]0 } else { [byte]$entry.Width }
        $h = if ($entry.Height -ge 256) { [byte]0 } else { [byte]$entry.Height }
        $writer.Write($w)             # Width
        $writer.Write($h)             # Height
        $writer.Write([byte]0)        # Color count
        $writer.Write([byte]0)        # Reserved
        $writer.Write([uint16]1)      # Color planes
        $writer.Write([uint16]32)     # Bits per pixel
        $writer.Write([uint32]$entry.Bytes.Length) # Image size in bytes
        $writer.Write([uint32]$offset) # Offset
        $offset += $entry.Bytes.Length
    }

    # Write Image Data
    foreach ($entry in $pngEntries) {
        $writer.Write($entry.Bytes)
    }

    $writer.Flush()
    [System.IO.File]::WriteAllBytes($outputPath, $ms.ToArray())
    $writer.Dispose()
    $ms.Dispose()
    Write-Host "Created ICO file: $outputPath"
}

# Create resized images
$img16 = Resize-Image -source $srcImage -width 16 -height 16
$img32 = Resize-Image -source $srcImage -width 32 -height 32
$img48 = Resize-Image -source $srcImage -width 48 -height 48
$img64 = Resize-Image -source $srcImage -width 64 -height 64
$img180 = Resize-Image -source $srcImage -width 180 -height 180
$img192 = Resize-Image -source $srcImage -width 192 -height 192
$img512 = Resize-Image -source $srcImage -width 512 -height 512

$bytes16 = Get-PngBytes -bitmap $img16
$bytes32 = Get-PngBytes -bitmap $img32
$bytes48 = Get-PngBytes -bitmap $img48
$bytes64 = Get-PngBytes -bitmap $img64
$bytes180 = Get-PngBytes -bitmap $img180
$bytes192 = Get-PngBytes -bitmap $img192
$bytes512 = Get-PngBytes -bitmap $img512

$icoEntries = @(
    @{ Width = 16; Height = 16; Bytes = $bytes16 },
    @{ Width = 32; Height = 32; Bytes = $bytes32 },
    @{ Width = 48; Height = 48; Bytes = $bytes48 },
    @{ Width = 64; Height = 64; Bytes = $bytes64 }
)

# Save ICO to app and public
Save-IcoFile -outputPath "e:\Insha-web\app\favicon.ico" -pngEntries $icoEntries
Save-IcoFile -outputPath "e:\Insha-web\public\favicon.ico" -pngEntries $icoEntries

# Save PNGs
[System.IO.File]::WriteAllBytes("e:\Insha-web\app\icon.png", $bytes32)
[System.IO.File]::WriteAllBytes("e:\Insha-web\public\icon.png", $bytes32)
[System.IO.File]::WriteAllBytes("e:\Insha-web\app\apple-icon.png", $bytes180)
[System.IO.File]::WriteAllBytes("e:\Insha-web\public\apple-icon.png", $bytes180)
[System.IO.File]::WriteAllBytes("e:\Insha-web\public\icon-192.png", $bytes192)
[System.IO.File]::WriteAllBytes("e:\Insha-web\public\icon-512.png", $bytes512)

Write-Host "All favicon and icon assets successfully generated from Insha Collections logo!"

$srcImage.Dispose()
$img16.Dispose()
$img32.Dispose()
$img48.Dispose()
$img64.Dispose()
$img180.Dispose()
$img192.Dispose()
$img512.Dispose()
