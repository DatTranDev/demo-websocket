# Expo Setup Guide

## 🚀 Quick Start with Expo

### Step 1: Install Expo Go on Your Phone

**Android:**

- Open Google Play Store
- Search for "Expo Go"
- Install the app

**iOS:**

- Open App Store
- Search for "Expo Go"
- Install the app

### Step 2: Find Your Computer's IP Address

**Windows PowerShell:**

```powershell
ipconfig
```

Look for "IPv4 Address" under your active network (WiFi or Ethernet).
Example: `192.168.1.100`

### Step 3: Update Socket URL in Code

Open `mobile/App.js` and change line 38:

```javascript
const SOCKET_URL = "http://YOUR_IP_ADDRESS:3000";
```

Replace `YOUR_IP_ADDRESS` with your actual IP from Step 2.

Example:

```javascript
const SOCKET_URL = "http://192.168.1.100:3000";
```

### Step 4: Start Backend

```powershell
cd d:\websocket-seminar
docker-compose up -d
```

### Step 5: Install Expo Dependencies

```powershell
cd mobile
npm install
```

### Step 6: Start Expo

```powershell
npx expo start
```

You'll see a QR code in the terminal.

### Step 7: Scan QR Code

**Android:**

- Open Expo Go app
- Tap "Scan QR Code"
- Scan the QR code from terminal

**iOS:**

- Open Camera app
- Point at QR code
- Tap notification to open in Expo Go

### Step 8: Use the App!

- Enter your username
- Start chatting!
- Open on multiple devices to test real-time chat

## 📱 Important Notes

### Network Requirements

- ✅ Phone and computer MUST be on the same WiFi network
- ✅ Make sure to use your actual IP address (not localhost or 127.0.0.1)
- ✅ Firewall must allow port 3000

### Finding Your IP Address

**Windows:**

```powershell
ipconfig
# Look for IPv4 Address under your active adapter
```

**Mac/Linux:**

```bash
ifconfig
# or
ip addr show
```

### Common Issues

**Can't connect to backend:**

1. Check your IP address is correct in `App.js`
2. Verify backend is running: `curl http://localhost:3000/health`
3. Check firewall settings
4. Ensure phone and computer are on same network

**Expo Go shows error:**

1. Clear Expo cache: `npx expo start -c`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Restart Metro bundler

## 🔥 Hot Reload

When you save changes to `App.js`, the app will automatically reload on your phone!

## 🎯 Advantages of Expo

✅ No need for Android Studio or Xcode  
✅ Test on real device instantly  
✅ QR code scanning for easy deployment  
✅ Hot reload works perfectly  
✅ Easy to share with others  
✅ Cross-platform (iOS & Android)

## 📖 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Go App](https://expo.dev/client)
- [Expo CLI Commands](https://docs.expo.dev/more/expo-cli/)
