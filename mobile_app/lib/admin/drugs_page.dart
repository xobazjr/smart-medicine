import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class DrugsPage extends StatelessWidget {
  const DrugsPage({super.key});

  // Future<http.Response> fetchAlbum() {
  //   return http.get(Uri.parse('https://jsonplaceholder.typicode.com/albums/1'));
  // }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ยา')),
      body: Center(
        child: Text(
          'Drugs Page',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}
