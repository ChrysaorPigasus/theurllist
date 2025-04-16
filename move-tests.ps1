# PowerShell script to move tests to the appropriate directories and organize them properly

# Ensure target directories exist
New-Item -ItemType Directory -Force -Path "tests\unit\features\list-management"
New-Item -ItemType Directory -Force -Path "tests\unit\features\sharing"
New-Item -ItemType Directory -Force -Path "tests\unit\features\url-management"
New-Item -ItemType Directory -Force -Path "tests\unit\stores"
New-Item -ItemType Directory -Force -Path "tests\unit\stores\lists"
New-Item -ItemType Directory -Force -Path "tests\unit\ui"
New-Item -ItemType Directory -Force -Path "tests\mocks"
New-Item -ItemType Directory -Force -Path "tests\api"

Write-Host "Created organized folder structure in tests directory" -ForegroundColor Green

# Create a function to ensure we don't have duplicate copies
function Move-TestFile {
    param (
        [string]$SourcePath,
        [string]$DestinationPath
    )
    
    # Create the destination directory if it doesn't exist
    $destinationDir = Split-Path -Path $DestinationPath -Parent
    if (-not (Test-Path $destinationDir)) {
        New-Item -ItemType Directory -Force -Path $destinationDir | Out-Null
    }
    
    # Copy the file to the new location
    Copy-Item $SourcePath -Destination $DestinationPath -Force
    
    # Check if copy was successful
    if (Test-Path $DestinationPath) {
        Write-Host "Moved $SourcePath to $DestinationPath" -ForegroundColor Cyan
        
        # Delete the original file if it exists
        if (Test-Path $SourcePath) {
            Remove-Item $SourcePath -Force
            Write-Host "Removed original file: $SourcePath" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "Failed to move $SourcePath to $DestinationPath" -ForegroundColor Red
    }
}

# Move API tests
Write-Host "Moving API tests to tests\api directory..." -ForegroundColor Green
if (Test-Path "src\pages\api\lists.test.js") {
    Move-TestFile -SourcePath "src\pages\api\lists.test.js" -DestinationPath "tests\api\lists.test.js"
}

# Move test mocks to their own directory
Write-Host "Moving test mocks to tests\mocks directory..." -ForegroundColor Green
if (Test-Path "src\test\storeMocks.js") {
    Move-TestFile -SourcePath "src\test\storeMocks.js" -DestinationPath "tests\mocks\storeMocks.js"
}
if (Test-Path "tests\unit\storeMocks.js") {
    Move-TestFile -SourcePath "tests\unit\storeMocks.js" -DestinationPath "tests\mocks\storeMocks.js"
}

# Update references to storeMocks.js in all test files
Write-Host "Updating import references to mocks in test files..." -ForegroundColor Green
$testFiles = Get-ChildItem -Path "tests" -Filter "*.test.*" -Recurse
foreach ($file in $testFiles) {
    $depth = ($file.FullName.Split('\') | Where-Object { $_ -ne "" }).Count - 3
    $relativePath = "../" * $depth + "mocks/storeMocks"
    
    $content = Get-Content $file.FullName -Raw
    $updatedContent = $content -replace "from ['""](\.\.\/)*storeMocks['""](;)?", "from '$relativePath'`$2"
    
    if ($content -ne $updatedContent) {
        Set-Content -Path $file.FullName -Value $updatedContent
        Write-Host "Updated mocks import in $($file.FullName)" -ForegroundColor Cyan
    }
}

# Move and organize UI Component tests
Write-Host "Organizing UI tests..." -ForegroundColor Green
$uiComponentTests = Get-ChildItem -Path "src\components\ui\*.test.jsx" -Recurse
foreach ($file in $uiComponentTests) {
    $fileName = $file.Name
    Move-TestFile -SourcePath $file.FullName -DestinationPath "tests\unit\ui\$fileName"
}
# Move UI tests from flat structure to folder structure
$flatUiTests = Get-ChildItem -Path "tests\unit\ui-*.test.jsx"
foreach ($file in $flatUiTests) {
    $originalName = $file.Name -replace "^ui-", ""
    Move-TestFile -SourcePath $file.FullName -DestinationPath "tests\unit\ui\$originalName"
}

# Move and organize Store tests
Write-Host "Organizing Store tests..." -ForegroundColor Green
$storeTests = Get-ChildItem -Path "src\stores\*.test.js" -Recurse
foreach ($file in $storeTests) {
    $fileName = $file.Name
    $relativePath = $file.FullName -replace [regex]::Escape("$pwd\src\stores\"), ""
    $targetDir = "tests\unit\stores"
    
    # Handle nested folder structure
    if ($relativePath -match "\\") {
        $folder = Split-Path $relativePath -Parent
        $targetDir = Join-Path $targetDir $folder
        New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
    }
    
    Move-TestFile -SourcePath $file.FullName -DestinationPath "$targetDir\$fileName"
}
# Move store tests from flat structure to folder structure
$flatStoreTests = Get-ChildItem -Path "tests\unit\store-*.test.js"
foreach ($file in $flatStoreTests) {
    if ($file.Name -match "^store-lists-(.+)$") {
        $originalName = $Matches[1]
        Move-TestFile -SourcePath $file.FullName -DestinationPath "tests\unit\stores\lists\$originalName"
    } elseif ($file.Name -match "^store-(.+)$") {
        $originalName = $Matches[1]
        Move-TestFile -SourcePath $file.FullName -DestinationPath "tests\unit\stores\$originalName"
    }
}

# Move and organize Feature tests
Write-Host "Organizing Feature tests..." -ForegroundColor Green
$featureTests = Get-ChildItem -Path "src\components\features\**\*.test.jsx" -Recurse
foreach ($file in $featureTests) {
    $fileName = $file.Name
    $dirPath = Split-Path $file.FullName -Parent
    
    $category = ""
    if ($dirPath -match "sharing") {
        $category = "sharing"
    }
    elseif ($dirPath -match "url-management") {
        $category = "url-management"
    }
    elseif ($dirPath -match "list-management") {
        $category = "list-management"
    }
    
    Move-TestFile -SourcePath $file.FullName -DestinationPath "tests\unit\features\$category\$fileName"
}
# Move feature tests from flat structure to folder structure
$flatFeatureTests = Get-ChildItem -Path "tests\unit\feature-*.test.jsx"
foreach ($file in $flatFeatureTests) {
    if ($file.Name -match "^feature-([^-]+)-(.+)$") {
        $category = $Matches[1]
        $originalName = $Matches[2]
        Move-TestFile -SourcePath $file.FullName -DestinationPath "tests\unit\features\$category\$originalName"
    }
}

# Move test setup files
Write-Host "Moving test setup files..." -ForegroundColor Green
if (Test-Path "src\test\setup.ts") {
    Move-TestFile -SourcePath "src\test\setup.ts" -DestinationPath "tests\unit\setup.ts"
}

# Example test
if (Test-Path "src\test\example.test.js") {
    Move-TestFile -SourcePath "src\test\example.test.js" -DestinationPath "tests\unit\example.test.js"
}

# Update any test configuration files to point to new locations
Write-Host "Checking for test configuration updates needed..." -ForegroundColor Green
$configFiles = @("vitest.config.ts", "package.json")
foreach ($configFile in $configFiles) {
    if (Test-Path $configFile) {
        Write-Host "You may need to update test paths in $configFile to reflect the new structure" -ForegroundColor Yellow
    }
}

Write-Host "All tests have been moved and organized successfully!" -ForegroundColor Green
Write-Host "New test directory structure:" -ForegroundColor Green
Write-Host "tests/" -ForegroundColor White
Write-Host "├── api/" -ForegroundColor White
Write-Host "├── mocks/" -ForegroundColor White
Write-Host "└── unit/" -ForegroundColor White
Write-Host "    ├── features/" -ForegroundColor White
Write-Host "    │   ├── list-management/" -ForegroundColor White
Write-Host "    │   ├── sharing/" -ForegroundColor White
Write-Host "    │   └── url-management/" -ForegroundColor White
Write-Host "    ├── stores/" -ForegroundColor White
Write-Host "    │   └── lists/" -ForegroundColor White
Write-Host "    └── ui/" -ForegroundColor White