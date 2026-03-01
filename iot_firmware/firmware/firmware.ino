#include <Servo.h>

Servo myServo; // Create servo object
const int servoPin = 9; // Pin connected to servo signal

void setup() {
  myServo.attach(servoPin); // Attaches the servo on pin 9
  myServo.write(0);        // Set initial position to closed (0 degrees)
  delay(1000);             // Wait for it to reach position
}

void loop() {
  // --- OPEN DOOR ---
  myServo.write(90);       // Rotate to 90 degrees to open
  delay(5000);             // Keep door open for 5 seconds

  // --- CLOSE DOOR ---
  myServo.write(0);        // Rotate back to 0 degrees
  delay(5000);             // Wait 5 seconds before opening again
}