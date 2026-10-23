param([int]$col, [int]$row, [string]$out)
Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile('D:\code\AI_video\tianjie-cauchy\.film\cache\look\0-148s.png')
$cellW = 480; $cellH = [math]::Round($cellW * 1920 / 1080)
$pad = 6; $top = 12
$x0 = 6 + $col * ($cellW + $pad); $y0 = $top + $row * ($cellH + $pad)
$crop = New-Object System.Drawing.Bitmap($cellW, $cellH)
$g = [System.Drawing.Graphics]::FromImage($crop)
$g.DrawImage($b, [System.Drawing.Rectangle]::new(0, 0, $cellW, $cellH), [System.Drawing.Rectangle]::new($x0, $y0, $cellW, $cellH), [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose(); $crop.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$crop.Dispose(); $b.Dispose()
Write-Output "saved $out"
