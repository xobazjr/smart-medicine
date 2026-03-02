import 'package:flutter/material.dart';

class AddDrugPage extends StatelessWidget {
  const AddDrugPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('เพิ่มยา')),
      body: Center(
        child: Text(
          'Add Drug Page',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}
