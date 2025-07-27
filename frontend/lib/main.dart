import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/date_symbol_data_local.dart'; // 오타 수정

import 'my_info_screen.dart';
import 'gps_permission_screen.dart';
import 'mental_health_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting();
  runApp(const DolbomApp());
}

class DolbomApp extends StatelessWidget {
  const DolbomApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.green,
        scaffoldBackgroundColor: const Color(0xFFF9F9F9),
        textTheme: GoogleFonts.notoSansKrTextTheme(
          Theme.of(context).textTheme,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFFF9F9F9),
          elevation: 0,
          iconTheme: IconThemeData(color: Colors.black87),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          contentPadding:
          const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12.0),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12.0),
            borderSide: BorderSide(color: Colors.grey[300]!),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12.0),
            borderSide: BorderSide(color: Colors.green[600]!, width: 2.0),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12.0),
            borderSide: BorderSide(color: Colors.red[600]!, width: 1.5),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12.0),
            borderSide: BorderSide(color: Colors.red[600]!, width: 2.0),
          ),
        ),
      ),
      home: const GpsPermissionScreen(),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;
  bool _isLoggedIn = false;
  String? _userNickname;

  void _onLoginSuccess(String nickname) {
    setState(() {
      _isLoggedIn = true;
      _userNickname = nickname;
      _selectedIndex = 0;
    });
  }

  void _onLogout() {
    setState(() {
      _isLoggedIn = false;
      _userNickname = null;
      _selectedIndex = 2;
    });
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> widgetOptions = <Widget>[
      HomeScreenBody(nickname: _userNickname),
      const Center(child: Text('커뮤니티 화면')),
      _isLoggedIn
          ? MyPageScreen(nickname: _userNickname!, onLogout: _onLogout)
          : MyInfoScreen(onLoginSuccess: _onLoginSuccess),
      const Center(child: Text('설정 화면')),
    ];

    final bool showAppBar = _selectedIndex != 2;

    return Scaffold(
      appBar: showAppBar
          ? AppBar(
        title: const Text('등대지기', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.notifications_none_outlined),
          ),
        ],
      )
          : null,
      body: widgetOptions.elementAt(_selectedIndex),
      bottomNavigationBar: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(25),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.2),
              spreadRadius: 1,
              blurRadius: 15,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(25),
          child: BottomNavigationBar(
            items: <BottomNavigationBarItem>[
              BottomNavigationBarItem(
                icon: Icon(_selectedIndex == 0 ? Icons.home : Icons.home_outlined),
                label: '홈',
              ),
              BottomNavigationBarItem(
                icon: Icon(_selectedIndex == 1 ? Icons.forum : Icons.forum_outlined),
                label: '커뮤니티',
              ),
              BottomNavigationBarItem(
                icon: Icon(_selectedIndex == 2 ? Icons.person : Icons.person_outline),
                label: '내 정보',
              ),
              BottomNavigationBarItem(
                icon: Icon(_selectedIndex == 3 ? Icons.settings : Icons.settings_outlined),
                label: '설정',
              ),
            ],
            currentIndex: _selectedIndex,
            onTap: _onItemTapped,
            type: BottomNavigationBarType.fixed,
            backgroundColor: Colors.white,
            selectedItemColor: const Color(0xFF63B967),
            unselectedItemColor: Colors.grey[500],
            selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold),
            unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal),
            selectedFontSize: 12.0,
            unselectedFontSize: 12.0,
            showUnselectedLabels: true,
            elevation: 0,
          ),
        ),
      ),
    );
  }
}

class HomeScreenBody extends StatelessWidget {
  final String? nickname;
  const HomeScreenBody({super.key, this.nickname});

  @override
  Widget build(BuildContext context) {
    final String welcomeMessage =
    nickname != null ? '안녕하세요, ${nickname}님 👋' : '안녕하세요, 등대지기님 👋';

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              welcomeMessage,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '오늘 하루도 고생 많으셨어요.\n언제나 당신을 응원할게요.',
              style: TextStyle(fontSize: 16, color: Colors.grey, height: 1.5),
            ),
          ],
        ),
        const SizedBox(height: 40),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildServiceButton(
              context: context,
              icon: Icons.forum_outlined,
              label: '익명 커뮤니티',
              color: const Color(0xFFE3F2FD),
              onPressed: () {},
            ),
            _buildServiceButton(
              context: context,
              icon: Icons.lightbulb_outline,
              label: 'AI 맞춤 혜택',
              color: const Color(0xFFE8F5E9),
              onPressed: () {},
            ),
          ],
        ),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildServiceButton(
              context: context,
              icon: Icons.favorite_border,
              label: '정신 건강 관리',
              color: const Color(0xFFF3E5F5),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const MentalHealthScreen()),
                );
              },
            ),
            _buildServiceButton(
              context: context,
              icon: Icons.sos_outlined,
              label: '긴급 지원',
              color: const Color(0xFFFFF3E0),
              onPressed: () {},
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildServiceButton({
    required BuildContext context,
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: MediaQuery.of(context).size.width * 0.4,
        height: 120,
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              spreadRadius: 1,
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 32, color: Colors.black87),
            const SizedBox(height: 10),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
                color: Colors.black87,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
