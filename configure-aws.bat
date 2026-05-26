@echo off
echo ============================================
echo AWS CLI Configuration
echo ============================================
echo.
echo You will need:
echo 1. AWS Access Key ID
echo 2. AWS Secret Access Key
echo.
echo Get these from: https://console.aws.amazon.com/iam/
echo - Users ^> Create user ^> Create access key ^> CLI
echo.
echo ============================================
echo.

aws configure

echo.
echo ============================================
echo Configuration complete!
echo.
echo Now you can deploy:
echo   cd backend
echo   serverless deploy --stage dev
echo ============================================
pause
