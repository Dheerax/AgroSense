#include <WiFi.h>

// -------- FIREBASE CONFIG --------
const char* FIREBASE_HOST = "agrosense-ede09-default-rtdb.asia-southeast1.firebasedatabase.app";
const char* FIREBASE_AUTH = ""; // We'll use public database rules

// -------- WiFi CONFIG --------
const char* ssid1 = "VINAYKUMAR 5887";
const char* password1 = "1234567899";
const char* ssid2 = "Anurag university";
const char* password2 = "Anurag@cvsr%";
const char* ssid3 = "AndroidHotspot";  // Add your mobile hotspot
const char* password3 = "12345678";

// Current WiFi being used
const char* ssid = ssid1;
const char* password = password1;

// -------- PIN CONFIG --------
const int sensorPin = 33;   // D33 - AOUT of soil sensor
const int relayPin  = 4;    // GPIO 4 - Relay IN pin

// -------- SENSOR THRESHOLD --------
int threshold = 2000; // Lower = wet, Higher = dry/hand detected
bool autoThreshold = false; // Set to true to auto-calibrate

// -------- CONTROL VARIABLES --------
bool manualMode = false;     // Auto mode by default
bool motorState = false;     // Current motor state
unsigned long lastSensorRead = 0;
unsigned long lastFirebaseUpdate = 0;
const unsigned long sensorInterval = 1000; // Read sensor every 1 second
const unsigned long firebaseInterval = 5000; // Update Firebase every 5 seconds

WiFiClient client;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("=== ESP32 Simple HTTP Irrigation Controller ===");
  
  // Pin setup
  pinMode(sensorPin, INPUT);
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW); // Motor OFF at start
  
  // Test the pins first
  testHardware();
  
  // WiFi connection
  tryMultipleWiFiNetworks();
  
  // If still not connected, use original method
  if (WiFi.status() != WL_CONNECTED) {
    setupWiFi();
  }
  
  // Test Firebase connection
  testFirebaseConnection();
  
  Serial.println("🚀 ESP32 Irrigation Controller Ready!");
}

void testHardware() {
  Serial.println("🔧 Testing hardware...");
  
  // Test sensor reading multiple times
  Serial.println("📊 Testing sensor readings (10 samples):");
  int total = 0;
  for (int i = 0; i < 10; i++) {
    int sensorValue = analogRead(sensorPin);
    Serial.print("Sample " + String(i+1) + ": ");
    Serial.println(sensorValue);
    total += sensorValue;
    delay(500);
  }
  
  int average = total / 10;
  Serial.println("📈 Average sensor value: " + String(average));
  Serial.println("🎯 Current threshold: " + String(threshold));
  
  if (average > 0 && average < 4095) {
    Serial.println("✅ Sensor is working!");
    
    // Suggest better threshold
    if (average < 1000) {
      Serial.println("💡 Suggestion: Your sensor reads LOW values");
      Serial.println("   Consider threshold around " + String(average + 500));
    } else if (average > 3000) {
      Serial.println("💡 Suggestion: Your sensor reads HIGH values");
      Serial.println("   Consider threshold around " + String(average - 500));
    } else {
      Serial.println("💡 Sensor values look normal");
    }
  } else {
    Serial.println("⚠️ Sensor reading seems unusual - check wiring");
  }
  
  // Test relay pin
  Serial.println("🔧 Testing relay pin " + String(relayPin) + "...");
  
  digitalWrite(relayPin, HIGH);
  Serial.println("Relay ON for 2 seconds...");
  delay(2000);
  
  digitalWrite(relayPin, LOW);
  Serial.println("Relay OFF");
  
  // Now test with your hand
  Serial.println("🤚 Put your hand on the sensor and observe:");
  for (int i = 0; i < 5; i++) {
    int sensorValue = analogRead(sensorPin);
    Serial.print("With hand: ");
    Serial.print(sensorValue);
    Serial.print(" - Motor should be: ");
    Serial.println(sensorValue > threshold ? "ON" : "OFF");
    delay(1000);
  }
  
  Serial.println("✅ Hardware test complete!");
  
  // Auto-calibrate threshold if enabled
  if (autoThreshold) {
    calibrateThreshold();
  }
}

void calibrateThreshold() {
  Serial.println("🎯 Auto-calibrating threshold...");
  Serial.println("Please follow these steps:");
  Serial.println("1. Make sure sensor is in AIR (dry) for 5 seconds");
  delay(5000);
  
  // Read dry values
  Serial.println("📊 Reading DRY values...");
  int dryTotal = 0;
  for (int i = 0; i < 10; i++) {
    int val = analogRead(sensorPin);
    Serial.println("Dry sample: " + String(val));
    dryTotal += val;
    delay(500);
  }
  int dryValue = dryTotal / 10;
  
  Serial.println("2. Now touch/wet the sensor for 5 seconds");
  delay(5000);
  
  // Read wet values
  Serial.println("📊 Reading WET values...");
  int wetTotal = 0;
  for (int i = 0; i < 10; i++) {
    int val = analogRead(sensorPin);
    Serial.println("Wet sample: " + String(val));
    wetTotal += val;
    delay(500);
  }
  int wetValue = wetTotal / 10;
  
  // Calculate optimal threshold
  threshold = (dryValue + wetValue) / 2;
  
  Serial.println("🎯 Calibration Results:");
  Serial.println("   Dry value: " + String(dryValue));
  Serial.println("   Wet value: " + String(wetValue));
  Serial.println("   New threshold: " + String(threshold));
  
  if (abs(dryValue - wetValue) < 100) {
    Serial.println("⚠️ Warning: Small difference between dry/wet values");
    Serial.println("   Check sensor wiring or try different threshold");
  }
}

void tryMultipleWiFiNetworks() {
  Serial.println("🌐 Trying multiple WiFi networks...");
  
  // Try network 1
  Serial.println("Trying: " + String(ssid1));
  WiFi.begin(ssid1, password1);
  if (waitForWiFi(10)) {
    ssid = ssid1;
    password = password1;
    return;
  }
  
  // Try network 2
  Serial.println("Trying: " + String(ssid2));
  WiFi.begin(ssid2, password2);
  if (waitForWiFi(10)) {
    ssid = ssid2;
    password = password2;
    return;
  }
  
  // Try network 3 (mobile hotspot)
  Serial.println("Trying: " + String(ssid3));
  WiFi.begin(ssid3, password3);
  if (waitForWiFi(10)) {
    ssid = ssid3;
    password = password3;
    return;
  }
  
  Serial.println("❌ All WiFi networks failed!");
}

bool waitForWiFi(int timeoutSeconds) {
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < timeoutSeconds) {
    delay(1000);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("✅ Connected!");
    Serial.print("📡 IP: ");
    Serial.println(WiFi.localIP());
    return true;
  } else {
    Serial.println(" ❌ Failed");
    return false;
  }
}

void setupWiFi() {
  Serial.println("🌐 Scanning for WiFi networks...");
  
  // Scan for available networks
  int n = WiFi.scanNetworks();
  Serial.println("📡 Available WiFi networks:");
  for (int i = 0; i < n; ++i) {
    Serial.print(i + 1);
    Serial.print(": ");
    Serial.print(WiFi.SSID(i));
    Serial.print(" (");
    Serial.print(WiFi.RSSI(i));
    Serial.println(" dBm)");
  }
  
  Serial.println("🌐 Connecting to WiFi...");
  Serial.println("Target: " + String(ssid));
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(1000);
    Serial.print(".");
    attempts++;
    
    if (attempts % 10 == 0) {
      Serial.println();
      Serial.print("WiFi attempt ");
      Serial.print(attempts);
      Serial.print("/30 - Status: ");
      Serial.println(WiFi.status());
      
      // Show what status code means
      switch(WiFi.status()) {
        case WL_NO_SSID_AVAIL:
          Serial.println("❌ Network not found!");
          break;
        case WL_CONNECT_FAILED:
          Serial.println("❌ Wrong password!");
          break;
        case WL_CONNECTION_LOST:
          Serial.println("❌ Connection lost!");
          break;
        case WL_DISCONNECTED:
          Serial.println("❌ Disconnected!");
          break;
      }
    }
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("✅ WiFi connected successfully!");
    Serial.print("📡 IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("📶 Signal strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println();
    Serial.println("❌ WiFi connection failed!");
    Serial.println("🔧 Check:");
    Serial.println("1. SSID: '" + String(ssid) + "'");
    Serial.println("2. Password: '" + String(password) + "'");
    Serial.println("3. Network is 2.4GHz (not 5GHz)");
    Serial.println("4. Network is in range");
  }
}

void testFirebaseConnection() {
  Serial.println("🔥 Testing Firebase connection...");
  
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected!");
    return;
  }
  
  Serial.println("🔧 Trying HTTP (port 80) instead of HTTPS...");
  
  // Test with HTTP instead of HTTPS - much simpler!
  if (client.connect(FIREBASE_HOST, 80)) {
    Serial.println("✅ Connected to Firebase server!");
    
    String testData = "\"esp32_test_" + String(millis()) + "\"";
    String path = "/test.json";
    
    // Send HTTP PUT request
    client.println("PUT " + path + " HTTP/1.1");
    client.println("Host: " + String(FIREBASE_HOST));
    client.println("Content-Type: application/json");
    client.println("Content-Length: " + String(testData.length()));
    client.println("Connection: close");
    client.println();
    client.print(testData);
    
    // Wait for response
    delay(2000);
    
    // Read response
    String response = "";
    while (client.available()) {
      String line = client.readStringUntil('\n');
      response += line + "\n";
    }
    
    Serial.println("📋 Full Response:");
    Serial.println(response);
    
    if (response.indexOf("200") >= 0 || response.indexOf("esp32_test_") >= 0) {
      Serial.println("✅ Firebase test successful!");
      initializeFirebaseData();
    } else {
      Serial.println("❌ Firebase test failed!");
      Serial.println("🔧 Let's try basic connectivity test...");
      
      // Just test if we can reach Google
      testBasicConnectivity();
    }
    
    client.stop();
    
  } else {
    Serial.println("❌ Could not connect to Firebase server!");
    Serial.println("🔧 Testing basic internet connectivity...");
    testBasicConnectivity();
  }
}

void testBasicConnectivity() {
  Serial.println("🌐 Testing basic internet connectivity...");
  
  // Test connection to Google (simple and reliable)
  if (client.connect("www.google.com", 80)) {
    Serial.println("✅ Internet connection works!");
    client.println("GET / HTTP/1.1");
    client.println("Host: www.google.com");
    client.println("Connection: close");
    client.println();
    
    delay(1000);
    
    bool gotResponse = false;
    while (client.available()) {
      String line = client.readStringUntil('\n');
      if (line.indexOf("200") >= 0) {
        gotResponse = true;
        break;
      }
    }
    
    client.stop();
    
    if (gotResponse) {
      Serial.println("✅ HTTP requests work!");
      Serial.println("❌ Problem is specifically with Firebase");
      Serial.println("🔧 Possible issues:");
      Serial.println("1. University firewall blocking Firebase");
      Serial.println("2. Need to try different Firebase approach");
      Serial.println("3. Try mobile hotspot instead of university WiFi");
    } else {
      Serial.println("❌ HTTP requests not working properly");
    }
    
  } else {
    Serial.println("❌ No internet connection!");
    Serial.println("🔧 Check WiFi credentials and network");
  }
}

void initializeFirebaseData() {
  Serial.println("📝 Initializing Firebase data...");
  
  // Set ESP32 connection status
  putFirebaseData("/irrigation/status/esp32Connected.json", "true");
  
  // Set initial motor state
  putFirebaseData("/irrigation/status/isOn.json", "false");
  
  // Set initial sensor data
  putFirebaseData("/irrigation/sensorData/soilMoisture.json", "0");
  
  Serial.println("🎯 Firebase initialization complete!");
}

bool putFirebaseData(String path, String data) {
  if (WiFi.status() != WL_CONNECTED) {
    return false;
  }
  
  if (client.connect(FIREBASE_HOST, 80)) {
    // Send HTTP PUT request
    client.println("PUT " + path + " HTTP/1.1");
    client.println("Host: " + String(FIREBASE_HOST));
    client.println("Content-Type: application/json");
    client.println("Content-Length: " + String(data.length()));
    client.println("Connection: close");
    client.println();
    client.print(data);
    
    delay(1000); // Wait for response
    
    bool success = false;
    while (client.available()) {
      String line = client.readStringUntil('\n');
      if (line.indexOf("200") >= 0) {
        success = true;
        Serial.println("✅ PUT request successful");
      }
    }
    
    if (!success) {
      Serial.println("❌ PUT request failed - no 200 response");
    }
    
    client.stop();
    return success;
    
  } else {
    Serial.println("❌ Could not connect to Firebase for PUT request");
    return false;
  }
}

String getFirebaseData(String path) {
  if (WiFi.status() != WL_CONNECTED) {
    return "";
  }
  
  if (client.connect(FIREBASE_HOST, 80)) {
    // Send HTTP GET request
    client.println("GET " + path + " HTTP/1.1");
    client.println("Host: " + String(FIREBASE_HOST));
    client.println("Connection: close");
    client.println();
    
    delay(1000); // Wait for response
    
    String response = "";
    bool dataStarted = false;
    
    while (client.available()) {
      String line = client.readStringUntil('\n');
      
      // Skip headers until we find the data
      if (line == "\r" || line == "") {
        dataStarted = true;
        continue;
      }
      
      if (dataStarted) {
        response += line;
      }
    }
    
    client.stop();
    
    // Fix the trim() issue by creating a trimmed copy
    response.replace("\r", "");
    response.replace("\n", "");
    return response;
    
  } else {
    return "";
  }
}

void setMotorState(bool state) {
  motorState = state;
  digitalWrite(relayPin, state ? HIGH : LOW);
  
  Serial.print("🔧 Motor ");
  Serial.println(state ? "ON" : "OFF");
  
  // Update Firebase immediately
  updateFirebaseStatus();
}

void updateFirebaseStatus() {
  Serial.println("📤 Updating Firebase...");
  
  // Update motor state
  if (putFirebaseData("/irrigation/status/isOn.json", motorState ? "true" : "false")) {
    Serial.println("✅ Motor status updated");
  } else {
    Serial.println("❌ Failed to update motor status");
  }
  
  // Update sensor data  
  int sensorValue = analogRead(sensorPin);
  if (putFirebaseData("/irrigation/sensorData/soilMoisture.json", String(sensorValue))) {
    Serial.println("✅ Sensor data updated");
  } else {
    Serial.println("❌ Failed to update sensor data");
  }
  
  // Update connection status
  if (putFirebaseData("/irrigation/status/esp32Connected.json", "true")) {
    Serial.println("✅ Connection status updated");
  } else {
    Serial.println("❌ Failed to update connection status");
  }
}

void checkFirebaseCommands() {
  // Check for manual mode command
  String manualResponse = getFirebaseData("/irrigation/commands/manual.json");
  if (manualResponse == "true" && !manualMode) {
    manualMode = true;
    Serial.println("📱 Manual mode ON");
  } else if (manualResponse == "false" && manualMode) {
    manualMode = false;
    Serial.println("📱 Manual mode OFF");
  }
  
  // Check for motor control (only in manual mode)
  if (manualMode) {
    String motorResponse = getFirebaseData("/irrigation/commands/motorOn.json");
    bool newMotorState = (motorResponse == "true");
    if (newMotorState != motorState) {
      setMotorState(newMotorState);
      Serial.println("📱 Motor control from app");
    }
  }
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi disconnected! Attempting reconnection...");
    setupWiFi();
    return;
  }
  
  // Read sensor periodically
  if (millis() - lastSensorRead > sensorInterval) {
    lastSensorRead = millis();
    
    int sensorValue = analogRead(sensorPin);
    Serial.print("📊 Sensor Value: ");
    Serial.print(sensorValue);
    Serial.print(" | Threshold: ");
    Serial.print(threshold);
    Serial.print(" | Status: ");
    Serial.print(sensorValue < threshold ? "WET" : "DRY");
    Serial.print(" | Motor: ");
    Serial.println(motorState ? "ON" : "OFF");
    
    // Auto mode: control based on sensor
    if (!manualMode) {
      bool shouldBeOn = sensorValue > threshold;
      if (shouldBeOn != motorState) {
        setMotorState(shouldBeOn);
        if (shouldBeOn) {
          Serial.println("🌱 Auto: No moisture detected (>" + String(threshold) + ") → Motor ON");
        } else {
          Serial.println("💧 Auto: Moisture detected (<=" + String(threshold) + ") → Motor OFF");
        }
      }
    }
  }
  
  // Update Firebase periodically
  if (millis() - lastFirebaseUpdate > firebaseInterval) {
    lastFirebaseUpdate = millis();
    updateFirebaseStatus();
    checkFirebaseCommands();
  }
  
  delay(100); // Small delay for stability
}