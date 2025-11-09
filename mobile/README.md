# WebSocket Demo - Mobile App (Expo)

## 📱 Running with Expo

This mobile app uses **Expo** for easy development and testing on physical devices.

### Prerequisites

1. Install **Expo Go** app on your phone:

   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)

2. Ensure your phone and computer are on the **same WiFi network**

### Quick Start

1. **Find your computer's IP address:**

   ```powershell
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. **Update the backend URL in `App.js` (line 38):**

   ```javascript
   const SOCKET_URL = "http://YOUR_IP_ADDRESS:3000";
   // Example: const SOCKET_URL = 'http://192.168.1.100:3000';
   ```

3. **Install dependencies:**

   ```powershell
   npm install
   ```

4. **Start Expo:**

   ```powershell
   npx expo start
   ```

5. **Scan QR code:**
   - Android: Open Expo Go → Scan QR code
   - iOS: Open Camera app → Point at QR code → Tap notification

### Auto IP Configuration (Optional)

Run this script to automatically update your IP:

```powershell
cd ..
.\setup-ip.ps1
```

## 🎯 Features

- ✅ Real-time chat with WebSocket (Socket.io)
- ✅ User count display
- ✅ Typing indicators
- ✅ Message history from PostgreSQL
- ✅ Auto-reconnection
- ✅ Hot reload during development

## 🔧 Development

### Hot Reload

When you save changes to `App.js`, the app automatically reloads on your phone!

### Clear Cache

If you encounter issues:

```powershell
npx expo start -c
```

### View Logs

Logs appear in the terminal where you ran `npx expo start`

### Debugging

Shake your device to open the developer menu:

- Reload
- Debug Remote JS
- Show Performance Monitor

## 📝 Important Notes

### SOCKET_URL Configuration

⚠️ **Critical:** The `SOCKET_URL` must be set to your computer's IP address, NOT:

- ❌ `localhost`
- ❌ `127.0.0.1`
- ✅ Your actual IP (e.g., `192.168.1.100`)

### Network Requirements

Both devices must be on the same WiFi network. If using:

- **Corporate WiFi:** May have AP isolation blocking devices
- **Public WiFi:** Usually blocks device-to-device communication
- **Home WiFi:** Usually works perfectly

### Firewall

Ensure Windows Firewall allows:

- Port 3000 (backend)
- Port 8081 (Expo Metro bundler)

## 🐛 Troubleshooting

### Cannot connect to backend

1. Verify IP address in `App.js`
2. Check backend is running: `curl http://localhost:3000/health`
3. Confirm same WiFi network
4. Check firewall settings

### Cannot scan QR code

Try tunnel mode (requires internet):

```powershell
npx expo start --tunnel
```

### App crashes or shows errors

```powershell
rm -rf node_modules
npm install
npx expo start -c
```

## 📚 Code Structure

```
App.js              # Main application component
├── State Management
│   ├── Connection state
│   ├── Messages array
│   ├── User info
│   └── Typing indicators
├── Socket.io Setup
│   ├── Connection handlers
│   ├── Event listeners
│   └── Event emitters
└── UI Components
    ├── Login Screen
    └── Chat Screen
        ├── Header
        ├── Messages List
        ├── Typing Indicator
        └── Input Area
```

## 🎨 Customization

### Change Theme

Edit the `styles` object at the bottom of `App.js`:

```javascript
const styles = StyleSheet.create({
  // Customize colors, fonts, spacing, etc.
});
```

### Add Features

Some ideas:

- User avatars
- Message reactions
- File upload
- Private messaging
- Read receipts

## 📖 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)

## 🎓 Learning

This app demonstrates:

- WebSocket communication with Socket.io
- React Native hooks (useState, useEffect, useRef)
- State management
- Real-time UI updates
- Network programming
- Mobile app development with Expo

## 🚀 Deployment

To build for production:

```powershell
# Android APK
npx expo build:android

# iOS App
npx expo build:ios
```

For more details, see [Expo Build Documentation](https://docs.expo.dev/classic/building-standalone-apps/)

---

**Happy Coding! 🎉**
