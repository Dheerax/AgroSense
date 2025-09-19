# Firebase Setup Guide for AgroSense Irrigation System

## 🔥 Firebase Project Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name your project (e.g., "agrosense-irrigation")
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Realtime Database
1. In your Firebase project, go to "Realtime Database"
2. Click "Create Database"
3. Choose your location (closest to your region)
4. Start in **Test Mode** for development (you can secure it later)
5. Your database URL will be: `https://your-project-id-default-rtdb.firebaseio.com/`

### 3. Setup Authentication (for ESP32)
1. Go to "Authentication" > "Sign-in method"
2. Enable "Email/Password" provider
3. Go to "Users" tab and add a user:
   - Email: `esp32@yourproject.com`
   - Password: `your-secure-password`

### 4. Get Firebase Configuration

#### For React Native App:
1. Go to "Project Settings" (gear icon)
2. Click "Add app" and select Android
3. Enter package name: `com.agrosense`
4. Download `google-services.json`
5. Copy the configuration values:

```javascript
// Add these to your ConfigService.ts
firebaseConfig: {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:android:abc123",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com/"
}
```

#### For ESP32:
Use the same values in your Arduino code:
```cpp
#define API_KEY "your-api-key"
#define DATABASE_URL "https://your-project-default-rtdb.firebaseio.com/"
#define USER_EMAIL "esp32@yourproject.com"
#define USER_PASSWORD "your-secure-password"
```

### 5. Setup Database Rules (Development)
Go to "Realtime Database" > "Rules" and use this for development:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### 6. Initialize Database Structure (Optional)
The database structure will be automatically created when you first use the app or when the ESP32 connects. However, if you want to set it up manually, you can add this initial structure in Firebase Console:

**Method 1: Auto-creation (Recommended)**
- Just skip this step! The app and ESP32 will create the structure automatically when they first run.

**Method 2: Manual setup in Firebase Console**
1. Go to Realtime Database in Firebase Console
2. Click the "+" icon next to your database URL
3. Create this structure by adding nodes one by one:

```json
{
  "irrigation_status": {
    "isOn": false,
    "lastUpdated": "2025-09-18T00:00:00.000Z",
    "duration": 0,
    "autoShutoff": true,
    "esp32Connected": false,
    "sensorData": {
      "soilMoisture": 0,
      "temperature": 0,
      "humidity": 0
    }
  },
  "irrigation_settings": {
    "autoMode": false,
    "moistureThreshold": 30,
    "maxDuration": 120
  }
}
```

**Method 3: Import JSON**
1. Copy the JSON above
2. In Firebase Console → Realtime Database → "⋮" menu → "Import JSON"
3. Paste and import

💡 **Tip:** If you skip this step, the first time you open the irrigation screen in your app, it will automatically create these database nodes for you!

## 📱 React Native Setup

### 1. Update ConfigService.ts
Replace the empty Firebase config with your actual values:

```typescript
firebaseConfig: {
  apiKey: "AIza...",
  authDomain: "agrosense-irrigation.firebaseapp.com",
  projectId: "agrosense-irrigation", 
  storageBucket: "agrosense-irrigation.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:android:abc123def456",
  databaseURL: "https://agrosense-irrigation-default-rtdb.firebaseio.com/"
}
```

### 2. Add google-services.json
1. Download `google-services.json` from Firebase Console
2. Place it in `android/app/google-services.json`

### 3. Android Configuration (Already Done)
The project is already configured with the required Firebase setup:

**android/build.gradle** (project level):
```gradle
plugins {
    id 'com.google.gms.google-services' version '4.4.3' apply false
}

buildscript {
    dependencies {
        classpath("com.google.gms:google-services:4.4.3")
    }
}
```

**android/app/build.gradle** (app level):
```gradle
apply plugin: "com.google.gms.google-services"

dependencies {
    implementation 'com.google.firebase:firebase-analytics'
    implementation platform('com.google.firebase:firebase-bom:34.2.0')
}
```

✅ **No additional Android configuration needed!**

## 🛠️ ESP32 Hardware Setup

### Required Components:
- ESP32 Development Board
- 5V Relay Module
- Soil Moisture Sensor (optional)
- DHT22 Temperature/Humidity Sensor (optional)
- Water Flow Sensor (optional)
- Irrigation pump or solenoid valve
- Jumper wires and breadboard

### Wiring Diagram:
```
ESP32          Component
GPIO 2    ->   Relay Module (IN)
GPIO 4    ->   DHT22 (Data)
GPIO 5    ->   Flow Sensor (Signal)
GPIO 34   ->   Soil Moisture (Analog)
3.3V      ->   Sensors (VCC)
GND       ->   All (GND)

Relay Module:
COM       ->   Pump/Valve (One terminal)
NO        ->   Power Supply (+)
```

### Arduino IDE Setup:
1. Install ESP32 board package
2. Install required libraries:
   - Firebase ESP Client
   - DHT sensor library
   - ArduinoJson

```cpp
// In Arduino IDE: Tools > Manage Libraries, search and install:
// - Firebase Arduino Client Library for ESP8266 and ESP32
// - DHT sensor library by Adafruit
// - ArduinoJson
```

## 🔒 Security Considerations
















### Production Database Rules:
```json
{
  "rules": {
    "irrigation_status": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "irrigation_commands": {
      ".read": "auth != null", 
      ".write": "auth != null"
    },
    "irrigation_logs": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### Best Practices:
1. Use environment variables for API keys
2. Enable Firebase App Check
3. Set up proper user authentication
4. Use HTTPS only
5. Regular backup of database
6. Monitor usage and costs

## 🧪 Testing the System

### 1. Test React Native App:
1. Build and run the app
2. Navigate to "Irrigation" tab
3. Check if ESP32 status shows "Offline" (normal if ESP32 not connected yet)

### 2. Test ESP32:
1. Upload the Arduino code
2. Open Serial Monitor (115200 baud)
3. Check WiFi and Firebase connection logs
4. ESP32 status should change to "Connected" in the app

### 3. Test Irrigation Control:
1. Turn on irrigation from the app
2. Check Serial Monitor for command reception
3. Verify relay activates (LED should light up)
4. Test auto-shutoff timer

## 📚 Troubleshooting

### Common Issues:

**Firebase Connection Failed:**
- Check API key and database URL
- Verify authentication credentials
- Check WiFi connection

**ESP32 Not Responding:**
- Check power supply
- Verify GPIO pin connections  
- Check serial monitor for error messages

**App Shows ESP32 Offline:**
- Check Firebase rules allow read/write
- Verify ESP32 is sending heartbeat
- Check database path consistency

**Relay Not Activating:**
- Check GPIO 2 connection
- Verify relay power supply
- Test with multimeter

### Getting Help:
- Check Firebase Console for real-time data
- Use Serial Monitor for ESP32 debugging
- Verify all connections with multimeter
- Test each component individually

## 🎯 Next Steps

1. Deploy and test the basic system
2. Add scheduling features
3. Implement moisture-based automation
4. Add multiple zone control
5. Create irrigation history and analytics
6. Add push notifications for alerts