@echo off
echo Setting up Gradle Wrapper...
echo.

REM Check if gradle is installed
where gradle >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Found Gradle installation
    gradle wrapper --gradle-version 8.5
    echo.
    echo Gradle wrapper setup complete!
    echo You can now run: .\gradlew.bat tasks
) else (
    echo Gradle not found in PATH
    echo.
    echo Please install Gradle or download manually:
    echo 1. Download: https://services.gradle.org/distributions/gradle-8.5-bin.zip
    echo 2. Extract to C:\gradle-8.5
    echo 3. Run: C:\gradle-8.5\bin\gradle wrapper
)

pause
