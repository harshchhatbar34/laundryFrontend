Add-Type -AssemblyName System.Drawing
$img1 = [System.Drawing.Image]::FromFile('E:\work\laundryFrontend\assets\logo.jpg')
$img1.Save('E:\work\laundryFrontend\assets\logo.png', [System.Drawing.Imaging.ImageFormat]::Png)
$img1.Dispose()

$img2 = [System.Drawing.Image]::FromFile('E:\work\laundryFrontend\assets\splash-icon.jpg')
$img2.Save('E:\work\laundryFrontend\assets\splash-icon.png', [System.Drawing.Imaging.ImageFormat]::Png)
$img2.Dispose()

Remove-Item 'E:\work\laundryFrontend\assets\logo.jpg', 'E:\work\laundryFrontend\assets\splash-icon.jpg'
