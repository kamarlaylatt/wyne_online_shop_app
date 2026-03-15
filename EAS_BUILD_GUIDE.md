# EAS Build Guide - Building APK Files

This guide explains how to use EAS Build to create APK files for the Wyne Shop Admin app.

## Prerequisites

1. **Node.js & npm** installed
2. **EAS CLI** installed globally
3. **Expo account** (free)
4. **GitHub account** (for authentication with Expo)

## Installation Steps

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

Verify installation:
```bash
eas --version
```

### Step 2: Login to EAS

```bash
eas login
```

Follow the prompts:
- Opens browser for authentication
- Select or create Expo account
- Grant permissions to EAS CLI

Verify login:
```bash
eas whoami
```

### Step 3: Configure Project (Already Done)

The `eas.json` file is already configured in your project. No additional setup needed.

## Building APK File

### Option 1: Cloud Build (Recommended)

Cloud build is hosted on Expo's servers. No local setup required.

```bash
# Build APK for testing/preview
eas build --platform android --profile preview

# Or shorter syntax
eas build -p android --profile preview
```

**What happens:**
1. Code uploaded to Expo servers
2. Built on remote servers (takes 10-15 minutes)
3. Download link provided in terminal
4. APK ready to install on devices

### Option 2: Local Build (Faster Iteration)

Requires Android NDK/SDK installed locally.

```bash
# Build locally
eas build --platform android --profile preview --local
```

**Advantages:**
- Faster builds (5-10 minutes)
- No upload time
- Works offline

**Requirements:**
- Android SDK installed
- Android NDK installed
- Java Development Kit (JDK 11+)

### Step-by-Step Build Process

#### Using Cloud Build:

```bash
# Navigate to project directory
cd /path/to/wyne_online_shop_app

# Start build
eas build --platform android --profile preview

# Output example:
# ✔ Published
# ✔ Build queued
# ✔ Build started...
#
# View this build in Expo dashboard:
# https://expo.dev/accounts/your-username/projects/wyne_online_shop_app/builds/...
```

**Wait for completion:**
- Terminal shows real-time build progress
- Typically takes 10-15 minutes
- You can close terminal; build continues on server

**When build finishes:**
```
✔ Build finished
✔ Output APK: https://your-download-link.apk

Download: https://your-download-link.apk
```

#### Using Local Build:

```bash
# Start local build
eas build --platform android --profile preview --local

# First run: downloads build tools (might take 5-10 min)
# Subsequent builds: faster

# When done, APK saved locally:
# Build output: ./dist/app-name.apk
```

## After Build Completes

### Download APK

**Cloud Build:**
- Click the download link in terminal
- Or visit Expo dashboard and download

**Local Build:**
- APK automatically saved in `./dist/` folder

### Install on Device

```bash
# Using ADB
adb install /path/to/app.apk

# Or with replacement
adb install -r /path/to/app.apk
```

Or transfer manually to phone and tap to install.

## Useful EAS Commands

```bash
# View all builds
eas builds

# Check specific build status
eas builds -p android

# View build logs
eas logs --build-id <BUILD_ID>

# Cancel build
eas builds:view <BUILD_ID> --cancel

# Rebuild last build
eas build --platform android --profile preview --repack
```

## Troubleshooting

### "Not logged in" Error

```bash
eas login
# or
eas auth:login
```

### Build Fails with Environment Error

Check that all environment variables are set:
```bash
# View env vars used in build
eas build --platform android --profile preview --display-logs
```

If missing `EXPO_PUBLIC_API_BASE_URL`:
1. Create `.env` file with: `EXPO_PUBLIC_API_BASE_URL=http://localhost:3000`
2. Rebuild: `eas build --platform android --profile preview`

### Build Queue Full

```bash
# Check current builds
eas builds

# Wait a few minutes or try again
# Free account has limited concurrent builds
```

### "Local build requires Android SDK"

Install Android SDK:
```bash
# Via Android Studio (recommended)
# Download: https://developer.android.com/studio
# OR via command line

# Set ANDROID_SDK_ROOT
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk  # macOS
# or
export ANDROID_SDK_ROOT=$HOME/Android/Sdk  # Linux/Windows
```

### APK Installation Fails on Device

```bash
# Uninstall old version first
adb uninstall com.wyneonlineshop

# Then install new APK
adb install your-app.apk
```

## Build Profiles Explained

```json
{
  "preview": {
    "android": {
      "buildType": "apk"
    }
  },
  "production": {
    "android": {
      "buildType": "aab"
    }
  }
}
```

- **preview APK**: For testing/distribution to QA or users (direct installation)
- **production AAB**: For Google Play Store (requires signing & publishing)

## Common Workflow

```bash
# 1. Make changes to code
# 2. Commit changes
git add .
git commit -m "Your changes"

# 3. Build APK
eas build --platform android --profile preview

# 4. Wait for completion (10-15 min)
# 5. Download APK from link provided

# 6. Install on device
adb install ./app.apk

# 7. Test on device
# 8. Repeat from step 1
```

## Tips & Best Practices

✅ **Do:**
- Use `--profile preview` for testing
- Keep commits clean before building
- Test on physical device before sharing
- Save download links for bug reference

❌ **Don't:**
- Build directly from main branch (use develop)
- Share APKs from incomplete builds
- Ignore build logs if something fails
- Build without committing code changes

## Next Steps

1. Run: `eas build --platform android --profile preview`
2. Wait for build to complete
3. Download APK from provided link
4. Install: `adb install app.apk`
5. Test on Android device
6. Report issues or iterate on code

For more info: https://docs.expo.dev/eas-update/introduction/
