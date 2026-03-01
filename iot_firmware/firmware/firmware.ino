#include <Servo.h>
#include <U8g2lib.h>
#include <Wire.h>

// สร้างออบเจกต์หน้าจอ OLED แบบประหยัดหน่วยความจำ (Page Buffer)
U8G2_SSD1306_128X64_NONAME_1_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE);

Servo myServo; // Create servo object
const int servoPin = 9; // Pin connected to servo signal

void setup() {
  // เริ่มต้นการทำงานของหน้าจอ OLED
  u8g2.begin();
  u8g2.enableUTF8Print();

  // โค้ด Servo เดิม
  myServo.attach(servoPin); // Attaches the servo on pin 9
  myServo.write(0);        // Set initial position to closed (0 degrees)
  delay(2000);             // Wait for it to reach position
}

void loop() {
  // --- อัปเดตหน้าจอ: สถานะเปิดประตู ---
  u8g2.firstPage();
  do {
    u8g2.setFont(u8g2_font_etl16thai_t);
    u8g2.setCursor(0, 30);
    u8g2.print("สถานะ: เปิดประตู");
  } while ( u8g2.nextPage() );

  // --- OPEN DOOR --- (โค้ด Servo เดิม)
  myServo.write(120);       // Rotate to 90 degrees to open
  delay(20000);             // Keep door open for 5 seconds

  // --- อัปเดตหน้าจอ: สถานะปิดประตู ---
  u8g2.firstPage();
  do {
    u8g2.setFont(u8g2_font_etl16thai_t);
    u8g2.setCursor(0, 30);
    u8g2.print("สถานะ: ปิดประตู");
  } while ( u8g2.nextPage() );

  // --- CLOSE DOOR --- (โค้ด Servo เดิม)
  myServo.write(0);        // Rotate back to 0 degrees
  delay(20000);             // Wait 5 seconds before opening again
}