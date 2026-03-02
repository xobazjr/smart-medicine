import 'package:flutter/material.dart';
import 'add_user.dart';
import 'add_drug.dart';
import 'delete_drug.dart';
import 'delete_user.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('หน้าหลัก')),
      body: Center(
        child: Wrap(
          spacing: 20,
          runSpacing: 20,
          children: [
            // เพิ่มยา
            _menuBox(
              context,
              icon: Icons.medication,
              text: "เพิ่มยา",
              page: const AddDrugPage(),
            ),

            // ลบยา
            _menuBox(
              context,
              icon: Icons.delete,
              text: "ลบยา",
              page: const DeleteDrugPage(),
            ),

            // เพิ่มผู้ใช้งาน
            _menuBox(
              context,
              icon: Icons.person_add,
              text: "เพิ่มผู้ใช้งาน",
              page: const AddUserPage(),
            ),

            // ลบผู้ใช้งาน
            _menuBox(
              context,
              icon: Icons.person_remove,
              text: "ลบผู้ใช้งาน",
              page: const DeleteUserPage(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _menuBox(
    BuildContext context, {
    required IconData icon,
    required String text,
    required Widget page,
  }) {
    return GestureDetector(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (_) => page));
      },
      child: Container(
        width: 150,
        height: 150,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.5),
              spreadRadius: 2,
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: const Color(0xFF9BD2F2), size: 50),
            const SizedBox(height: 10),
            Text(
              text,
              style: const TextStyle(
                color: Colors.black,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
