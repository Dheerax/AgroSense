#include <WiFi.h>

// -------- PIN CONFIG --------
const int sensorPin = 33;   // D33 - AOUT of soil sensor
const int relayPin  = 4;    // GPIO 4 - Relay IN pin

// -------- SENSOR THRESHOLD --------
int threshold = 2000; // Lower = wet, Higher = dry/hand detected
bool autoThreshold = true; // Set to true to auto-calibrate

// -------- CONTROL VARIABLES --------
bool motorState = false;     // Current motor state
unsigned long lastSensorRead = 0;
const unsigned long sensorInterval = 1000; // Read sensor every 2 seconds

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("=== ESP32 Standalone Irrigation Controller ===");
  Serial.println("🌱 LOCAL IoT MODE - No WiFi/App needed!");
  
  // Pin setup
  pinMode(sensorPin, INPUT);
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW); // Motor OFF at start
  
  // Test hardware and calibrate
  testHardware();
  
  Serial.println("🚀 ESP32 Irrigation Controller Ready!");
  Serial.println("📊 Starting automatic irrigation monitoring...");
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
  Serial.println("Relay ON for 3 seconds...");
  delay(3000);
  
  digitalWrite(relayPin, LOW);
  Serial.println("Relay OFF");
  
  // Auto-calibrate threshold if enabled
  if (autoThreshold) {
    calibrateThreshold();
  }
  
  Serial.println("✅ Hardware test complete!");
}

void calibrateThreshold() {
  Serial.println("🎯 Auto-calibrating threshold...");
  Serial.println("📋 Step 1: Reading DRY sensor values...");
  Serial.println("   (Make sure sensor is in open air - NOT touching anything)");
  delay(3000);
  
  // Read dry values
  Serial.println("📊 Reading DRY values...");
  int dryTotal = 0;
  for (int i = 0; i < 10; i++) {
    int val = analogRead(sensorPin);
    Serial.println("Dry sample " + String(i+1) + ": " + String(val));
    dryTotal += val;
    delay(500);
  }
  int dryValue = dryTotal / 10;
  
  Serial.println("📋 Step 2: Touch/hold the sensor for WET reading...");
  Serial.println("   (Touch sensor with your finger or wet cloth)");
  delay(5000);
  
  // Read wet values
  Serial.println("📊 Reading WET values...");
  int wetTotal = 0;
  for (int i = 0; i < 10; i++) {
    int val = analogRead(sensorPin);
    Serial.println("Wet sample " + String(i+1) + ": " + String(val));
    wetTotal += val;
    delay(500);
  }
  int wetValue = wetTotal / 10;
  
  // Calculate optimal threshold (middle point)
  threshold = (dryValue + wetValue) / 2;
  
  Serial.println("🎯 Calibration Results:");
  Serial.println("   Dry value (air): " + String(dryValue));
  Serial.println("   Wet value (touch): " + String(wetValue));
  Serial.println("   Optimal threshold: " + String(threshold));
  
  if (abs(dryValue - wetValue) < 100) {
    Serial.println("⚠️ Warning: Small difference between dry/wet values");
    Serial.println("   Using default threshold of 2000");
    threshold = 2000;
  } else {
    Serial.println("✅ Calibration successful!");
  }
  
  Serial.println("📋 Logic: When sensor > " + String(threshold) + " → Motor ON (dry soil)");
  Serial.println("         When sensor ≤ " + String(threshold) + " → Motor OFF (wet soil)");
}

void setMotorState(bool state) {
  motorState = state;
  digitalWrite(relayPin, state ? HIGH : LOW);
  
  Serial.print("🔧 Motor ");
  Serial.println(state ? "ON" : "OFF");
}

void loop() {
  // Read sensor periodically
  if (millis() - lastSensorRead > sensorInterval) {
    lastSensorRead = millis();
    
    int sensorValue = analogRead(sensorPin);
    
    // Determine if irrigation is needed
    bool shouldBeOn = sensorValue > threshold;
    
    // Print detailed status
    Serial.print("📊 Sensor: ");
    Serial.print(sensorValue);
    Serial.print(" | Threshold: ");
    Serial.print(threshold);
    Serial.print(" | Soil: ");
    Serial.print(sensorValue > threshold ? "DRY" : "WET");
    Serial.print(" | Motor: ");
    Serial.print(motorState ? "ON" : "OFF");
    
    // Check if motor state needs to change
    if (shouldBeOn != motorState) {
      Serial.print(" → CHANGING: ");
      setMotorState(shouldBeOn);
      if (shouldBeOn) {
        Serial.println("🌱 Soil is DRY (>" + String(threshold) + ") → Starting irrigation");
      } else {
        Serial.println("💧 Soil is WET (≤" + String(threshold) + ") → Stopping irrigation");
      }
    } else {
      Serial.println(" → No change needed");
    }
  }
  
  delay(100); // Small delay for stability
}