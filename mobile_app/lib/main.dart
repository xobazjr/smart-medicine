import 'package:flutter/material.dart';
import 'login_page.dart';
import 'admin/settings_page.dart';
import 'admin/drugs_page.dart';
import 'admin/history_page.dart';
import 'admin/home_page.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: LoginPage(),
    );
  }
}
