#include <WiFi.h>

// -------- FIREBASE CONFIG --------
const char* FIREBASE_HOST = "agrosense-ede09-default-rtdb.asia-southeast1.firebasedatabase.app";
const char* FIREBASE_AUTH = ""; // We'll use public database rules

// -------- WiFi CONFIG --------
const char* ssid = "Anurag university";
const char* password = "Anurag@cvsr%";

// -------- PIN CONFIG --------
const int sensorPin = 33;   // D33 - AOUT of soil sensor
const int relayPin  = 4;    // GPIO 4 - Relay IN pin

// -------- SENSOR THRESHOLD --------
const int threshold = 2000; // Lower = wet, Higher = dry/hand detected

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
  setupWiFi();
  
  // Test Firebase connection
  testFirebaseConnection();
  
  Serial.println("🚀 ESP32 Irrigation Controller Ready!");
}

void testHardware() {
  Serial.println("🔧 Testing hardware...");
  
  // Test sensor reading
  int sensorValue = analogRead(sensorPin);
  Serial.print("📊 Sensor Pin " + String(sensorPin) + " reading: ");
  Serial.println(sensorValue);
  
  if (sensorValue > 0 && sensorValue < 4095) {
    Serial.println("✅ Sensor is working!");
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
  
  Serial.println("✅ Hardware test complete!");
}

void setupWiFi() {
  Serial.println("🌐 Connecting to WiFi...");
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
    return response.trim();
    
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
    Serial.print(" (");
    Serial.print(sensorValue < threshold ? "WET" : "DRY");
    Serial.println(")");
    
    // Auto mode: control based on sensor
    if (!manualMode) {
      bool shouldBeOn = sensorValue > threshold;
      if (shouldBeOn != motorState) {
        setMotorState(shouldBeOn);
        if (shouldBeOn) {
          Serial.println("🌱 Auto: No moisture detected → Motor ON");
        } else {
          Serial.println("💧 Auto: Moisture detected → Motor OFF");
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