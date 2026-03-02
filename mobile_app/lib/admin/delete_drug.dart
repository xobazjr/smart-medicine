import 'package:flutter/material.dart';

class DeleteDrugPage extends StatelessWidget {
  const DeleteDrugPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ลบยา')),
      body: Center(
        child: Text(
          'Delete Drug Page',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}
