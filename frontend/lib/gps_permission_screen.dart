import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';

import 'main.dart';

class GpsPermissionScreen extends StatefulWidget {
  const GpsPermissionScreen({super.key});

  @override
  State<GpsPermissionScreen> createState() => _GpsPermissionScreenState();
}

class _GpsPermissionScreenState extends State<GpsPermissionScreen> {
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _checkPermissionAndNavigate();
  }

  Future<void> _checkPermissionAndNavigate() async {
    final status = await Permission.location.status;
    if (status.isGranted) {
      _navigateToMainScreen();
    }
  }

  Future<void> _requestPermission() async {
    setState(() {
      _isLoading = true;
    });

    final status = await Permission.location.request();

    if (status.isGranted) {
      _navigateToMainScreen();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('위치 권한이 없어 일부 기능 사용이 제한될 수 있습니다.')),
      );
      _navigateToMainScreen();
    }

    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _navigateToMainScreen() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if(mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const MainScreen()),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F0F5),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(flex: 2),
              Icon(
                Icons.location_pin,
                size: 48,
                color: Colors.grey[700],
              ),
              const SizedBox(height: 24),
              const Text.rich(
                TextSpan(
                  style: TextStyle(fontSize: 20, color: Colors.black87),
                  children: [
                    TextSpan(text: "이 기기의 위치에 '등대지기'가\n액세스하도록 허용하시겠습니까?"),
                  ],
                ),
                textAlign: TextAlign.center,
              ),
              const Spacer(flex: 2),
              _buildPermissionButton(
                text: '앱 사용 중에만 허용',
                onPressed: _requestPermission,
              ),
              const SizedBox(height: 12),
              _buildPermissionButton(
                text: '이번만 허용',
                onPressed: _requestPermission,
              ),
              const SizedBox(height: 12),
              _buildPermissionButton(
                text: '허용 안 함',
                onPressed: () {
                  _navigateToMainScreen();
                },
              ),
              const Spacer(flex: 1),
              if (_isLoading)
                const Center(child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: CircularProgressIndicator(),
                ))
              else
                const SizedBox(height: 48),
              const Spacer(flex: 2),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPermissionButton({
    required String text,
    required VoidCallback onPressed,
  }) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.blue[50],
        foregroundColor: Colors.blue[800],
        elevation: 0,
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
      child: Text(text, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
    );
  }
}
