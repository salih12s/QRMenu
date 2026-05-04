# Comprehensive API smoke test for Uğur'um Cafe QR Menu
# Run while backend is running on http://localhost:5000

$ErrorActionPreference = 'Stop'
$base = 'http://localhost:5000/api'
$pass = 0
$fail = 0
$failed = @()

function Test-Step([string]$name, [scriptblock]$body) {
    try {
        & $body | Out-Null
        Write-Host "  PASS  $name" -ForegroundColor Green
        $script:pass++
    } catch {
        Write-Host "  FAIL  $name -> $($_.Exception.Message)" -ForegroundColor Red
        $script:failed += $name
        $script:fail++
    }
}

Write-Host "`n[Public endpoints]" -ForegroundColor Yellow
$menu = $null
Test-Step "GET /menu returns categories+settings" {
    $script:menu = Invoke-RestMethod -Uri "$base/menu"
    if ($menu.categories.Count -lt 1) { throw "no categories" }
    if (-not $menu.settings.cafeName) { throw "no settings" }
}
Test-Step "GET /categories returns array" {
    $cats = Invoke-RestMethod -Uri "$base/categories"
    if ($cats.Count -lt 1) { throw "empty" }
}
Test-Step "GET /products returns array" {
    $prods = Invoke-RestMethod -Uri "$base/products"
    if ($prods.Count -lt 1) { throw "empty" }
}
Test-Step "GET /settings exposes theme colors" {
    $s = Invoke-RestMethod -Uri "$base/settings"
    if (-not $s.themePrimaryColor) { throw "missing themePrimaryColor" }
}
Test-Step "GET /products/:slug returns single product" {
    $prods = Invoke-RestMethod -Uri "$base/products"
    $slug = $prods[0].slug
    $p = Invoke-RestMethod -Uri "$base/products/$slug"
    if ($p.id -ne $prods[0].id) { throw "slug mismatch" }
}

Write-Host "`n[Auth]" -ForegroundColor Yellow
$token = $null
Test-Step "POST /auth/login with valid creds returns token" {
    $body = @{ email = 'admin@ugurumcafe.com'; password = '123456' } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -Body $body -ContentType 'application/json'
    if (-not $r.token) { throw "no token" }
    if ($r.user.role -ne 'ADMIN') { throw "wrong role" }
    $script:token = $r.token
}
Test-Step "POST /auth/login with bad creds rejects (401)" {
    try {
        $body = @{ email = 'admin@ugurumcafe.com'; password = 'wrongpass' } | ConvertTo-Json
        Invoke-RestMethod -Uri "$base/auth/login" -Method POST -Body $body -ContentType 'application/json'
        throw "expected 401"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -ne 401) { throw "got $($_.Exception.Response.StatusCode.value__)" }
    }
}
Test-Step "Admin endpoint without token returns 401" {
    try {
        Invoke-RestMethod -Uri "$base/admin/dashboard"
        throw "expected 401"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -ne 401) { throw "got $($_.Exception.Response.StatusCode.value__)" }
    }
}

$h = @{ Authorization = "Bearer $token" }

Write-Host "`n[Admin: read]" -ForegroundColor Yellow
Test-Step "GET /admin/dashboard returns counts" {
    $d = Invoke-RestMethod -Uri "$base/admin/dashboard" -Headers $h
    if ($null -eq $d.productCount) { throw "missing productCount" }
    if ($null -eq $d.categoryCount) { throw "missing categoryCount" }
}
Test-Step "GET /admin/categories" {
    $c = Invoke-RestMethod -Uri "$base/admin/categories" -Headers $h
    if ($c.Count -lt 1) { throw "empty" }
}
Test-Step "GET /admin/products" {
    $p = Invoke-RestMethod -Uri "$base/admin/products" -Headers $h
    if ($p.Count -lt 1) { throw "empty" }
}
Test-Step "GET /admin/settings" {
    $s = Invoke-RestMethod -Uri "$base/admin/settings" -Headers $h
    if (-not $s.cafeName) { throw "no cafeName" }
}

Write-Host "`n[Admin: Category CRUD]" -ForegroundColor Yellow
$catId = $null
Test-Step "POST /admin/categories creates category" {
    $body = @{ name = 'Test Kategori'; sortOrder = 99; isActive = $true } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$base/admin/categories" -Method POST -Headers $h -Body $body -ContentType 'application/json'
    if (-not $r.id) { throw "no id" }
    $script:catId = $r.id
}
Test-Step "PUT /admin/categories/:id updates" {
    $body = @{ name = 'Test Kategori v2'; sortOrder = 100; isActive = $false } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$base/admin/categories/$catId" -Method PUT -Headers $h -Body $body -ContentType 'application/json'
    if ($r.name -ne 'Test Kategori v2') { throw "not updated" }
}
Test-Step "DELETE /admin/categories/:id" {
    Invoke-RestMethod -Uri "$base/admin/categories/$catId" -Method DELETE -Headers $h
}

Write-Host "`n[Admin: Product CRUD]" -ForegroundColor Yellow
$prodId = $null
Test-Step "POST /admin/products creates product" {
    $cats = Invoke-RestMethod -Uri "$base/admin/categories" -Headers $h
    $body = @{
        categoryId = $cats[0].id
        name = 'Test Ürün API'
        description = 'API testi'
        price = 99.50
        isActive = $true
        isPopular = $false
        isNew = $true
        isRecommended = $false
        sortOrder = 1
    } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$base/admin/products" -Method POST -Headers $h -Body $body -ContentType 'application/json'
    if (-not $r.id) { throw "no id" }
    $script:prodId = $r.id
}
Test-Step "PUT /admin/products/:id updates" {
    $body = @{ name = 'Test Urun API v2'; price = 88.00; isActive = $false } | ConvertTo-Json
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
    $r = Invoke-RestMethod -Uri "$base/admin/products/$prodId" -Method PUT -Headers $h -Body $bodyBytes -ContentType 'application/json; charset=utf-8'
    if ($r.name -ne 'Test Urun API v2') { throw "not updated (got '$($r.name)')" }
}
Test-Step "DELETE /admin/products/:id" {
    Invoke-RestMethod -Uri "$base/admin/products/$prodId" -Method DELETE -Headers $h
}

Write-Host "`n[Admin: Settings update]" -ForegroundColor Yellow
Test-Step "PUT /admin/settings updates theme" {
    $cur = Invoke-RestMethod -Uri "$base/admin/settings" -Headers $h
    $body = @{
        cafeName = $cur.cafeName
        slogan = $cur.slogan
        phone = $cur.phone
        address = $cur.address
        instagramUrl = $cur.instagramUrl
        logoUrl = $cur.logoUrl
        themePrimaryColor = $cur.themePrimaryColor
        themeBackgroundColor = $cur.themeBackgroundColor
        themeCardColor = $cur.themeCardColor
        themeTextColor = $cur.themeTextColor
        themeMutedColor = $cur.themeMutedColor
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$base/admin/settings" -Method PUT -Headers $h -Body $body -ContentType 'application/json'
}

Write-Host "`n[Upload]" -ForegroundColor Yellow
# Use curl.exe for multipart (works on PS 5.1+)
Test-Step "POST /admin/upload rejects bad file type" {
    $bad = Join-Path $env:TEMP "bad-$(Get-Random).txt"
    'not an image' | Set-Content $bad
    try {
        $out = & curl.exe -s -o NUL -w "%{http_code}" -X POST -H "Authorization: Bearer $token" -F "file=@$bad" "$base/admin/upload"
        if ($out -ne '400') { throw "expected 400, got $out" }
    } finally { Remove-Item $bad -Force }
}
Test-Step "POST /admin/upload accepts png" {
    $pngB64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
    $bytes = [Convert]::FromBase64String($pngB64)
    $f = Join-Path $env:TEMP "test-$(Get-Random).png"
    [IO.File]::WriteAllBytes($f, $bytes)
    try {
        $resp = & curl.exe -s -X POST -H "Authorization: Bearer $token" -F "file=@$f" "$base/admin/upload"
        $obj = $resp | ConvertFrom-Json
        if (-not $obj.url) { throw "no url in response: $resp" }
        if ($obj.url -notmatch '/uploads/') { throw "bad url shape: $($obj.url)" }
    } finally { Remove-Item $f -Force }
}

Write-Host "`n[404]" -ForegroundColor Yellow
Test-Step "Unknown route returns 404" {
    try {
        Invoke-RestMethod -Uri "$base/no-such-endpoint"
        throw "expected 404"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -ne 404) { throw "got $($_.Exception.Response.StatusCode.value__)" }
    }
}

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "  Pass: $pass  Fail: $fail" -ForegroundColor $(if ($fail -eq 0) { 'Green' } else { 'Red' })
if ($fail -gt 0) {
    Write-Host "  Failed: $($failed -join ', ')" -ForegroundColor Red
    exit 1
}
Write-Host "  ALL TESTS PASSED" -ForegroundColor Green
