import 'package:flutter/material.dart';
import 'package:mobile_app/login_page.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsPage extends StatelessWidget {
  final Map<String, dynamic> user;
  const SettingsPage({super.key, required this.user});

  Future<void> _signUserOut(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();

    await prefs.remove('token');

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) => const LoginPage()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ตั้งค่า')),
      body: Padding(
        padding: const EdgeInsets.all(10.0),
        child: Card(
          color: Colors.white,
          elevation: 2.0,
          shadowColor: Colors.black.withOpacity(0.3),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              ListTile(
                onTap: () => _signUserOut(context),
                leading: Icon(Icons.logout),
                title: Text("ออกจากระบบ"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
