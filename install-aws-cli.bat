@echo off
echo Installing AWS CLI...
echo.
echo The installer has been downloaded to your Downloads folder.
echo.

REM Try to install from Downloads
if exist "%USERPROFILE%\Downloads\AWSCLIV2.msi" (
    echo Running installer from Downloads...
    msiexec.exe /i "%USERPROFILE%\Downloads\AWSCLIV2.msi"
) else (
    echo Downloading AWS CLI installer...
    curl -o "%USERPROFILE%\Downloads\AWSCLIV2.msi" https://awscli.amazonaws.com/AWSCLIV2.msi
    echo.
    echo Running installer...
    msiexec.exe /i "%USERPROFILE%\Downloads\AWSCLIV2.msi"
)

echo.
echo After installation completes, RESTART YOUR TERMINAL and run:
echo aws configure
pause
