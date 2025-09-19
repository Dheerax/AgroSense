#include <WiFi.h>
#include <Firebase_ESP_Client.h>

// -------- FIREBASE CONFIG --------
#define FIREBASE_API_KEY "AIzaSyAnDb2xo0qp4OEiUnFla4dCV1K4gjjmRBk"
#define FIREBASE_DATABASE_URL "https://agrosense-irrigation-default-rtdb.asia-southeast1.firebasedatabase.app/"

// -------- WiFi CONFIG --------
const char* ssid = "Anurag university";
const char* password = "Anurag@cvsr%";

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("=== SIMPLE ESP32 FIREBASE TEST ===");
  
  // Connect to WiFi
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  
  int wifiAttempts = 0;
  while (WiFi.status() != WL_CONNECTED && wifiAttempts < 20) {
    delay(1000);
    Serial.print(".");
    wifiAttempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("✅ WiFi connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println();
    Serial.println("❌ WiFi FAILED!");
    return;
  }
  
  // Test internet connectivity
  Serial.println("🌐 Testing internet connectivity...");
  WiFiClient client;
  if (client.connect("www.google.com", 80)) {
    Serial.println("✅ Internet connection OK");
    client.stop();
  } else {
    Serial.println("❌ No internet access - check university WiFi");
    return;
  }
  
  // Test Firebase domains
  Serial.println("🔥 Testing Firebase domain access...");
  if (client.connect("agrosense-irrigation-default-rtdb.asia-southeast1.firebasedatabase.app", 443)) {
    Serial.println("✅ Firebase domain reachable");
    client.stop();
  } else {
    Serial.println("❌ Firebase domain BLOCKED by university WiFi!");
    Serial.println("University network is blocking Firebase servers.");
    return;
  }
  
  // Configure Firebase
  Serial.println("🔧 Configuring Firebase...");
  config.api_key = FIREBASE_API_KEY;
  config.database_url = FIREBASE_DATABASE_URL;
  
  Firebase.reconnectWiFi(true);
  
  Serial.println("🚀 Starting Firebase connection...");
  Firebase.begin(&config, &auth);
  
  // Wait for Firebase ready
  unsigned long startTime = millis();
  while (!Firebase.ready() && (millis() - startTime) < 30000) {
    Serial.print(".");
    delay(1000);
  }
  
  if (Firebase.ready()) {
    Serial.println();
    Serial.println("🎉 FIREBASE CONNECTED SUCCESSFULLY!");
    
    // Test write
    if (Firebase.RTDB.setString(&fbdo, "/test/message", "Hello from ESP32!")) {
      Serial.println("✅ Write test successful");
    } else {
      Serial.println("❌ Write test failed: " + fbdo.errorReason());
    }
    
    // Test read
    if (Firebase.RTDB.getString(&fbdo, "/test/message")) {
      Serial.println("✅ Read test successful: " + fbdo.stringData());
    } else {
      Serial.println("❌ Read test failed: " + fbdo.errorReason());
    }
    
  } else {
    Serial.println();
    Serial.println("❌ FIREBASE CONNECTION FAILED!");
    Serial.println("Error: " + fbdo.errorReason());
    
    // Common error explanations
    if (fbdo.errorReason().indexOf("timeout") >= 0) {
      Serial.println("→ This is likely a network timeout");
      Serial.println("→ University WiFi might be too slow or blocking Firebase");
    }
    if (fbdo.errorReason().indexOf("SSL") >= 0) {
      Serial.println("→ SSL/TLS certificate issue");
      Serial.println("→ University WiFi might be using a proxy");
    }
  }
}

void loop() {
  if (Firebase.ready()) {
    Serial.println("🟢 Firebase still connected - " + String(millis()/1000) + "s");
  } else {
    Serial.println("🔴 Firebase disconnected");
  }
  delay(5000);
}