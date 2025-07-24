import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'my_info_screen.dart'; // 내 정보 화면 import

// 앱의 시작점
void main() {
  runApp(const DolbomApp());
}

// 앱의 전체적인 테마와 구조를 정의하는 위젯
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
      home: const MainScreen(),
    );
  }
}

// 메인 화면 (하단 탭 및 로그인 상태 관리)
class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  // 로그인 상태와 사용자 닉네임을 관리하는 변수
  bool _isLoggedIn = false;
  String? _userNickname;

  // 로그인 성공 시 호출될 콜백 함수
  void _onLoginSuccess(String nickname) {
    setState(() {
      _isLoggedIn = true;
      _userNickname = nickname;
      _selectedIndex = 0; // 로그인 후 홈 화면으로 이동
    });
  }

  // 로그아웃 시 호출될 콜백 함수
  void _onLogout() {
    setState(() {
      _isLoggedIn = false;
      _userNickname = null;
      _selectedIndex = 2; // 로그아웃 후 내 정보(로그인) 탭으로 이동
    });
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    // 로그인 상태에 따라 동적으로 화면 목록 구성
    final List<Widget> widgetOptions = <Widget>[
      HomeScreenBody(nickname: _userNickname), // 홈 화면
      const Center(child: Text('커뮤니티 화면')),
      // 로그인이 되어 있으면 마이페이지, 아니면 로그인/회원가입 화면
      _isLoggedIn
          ? MyPageScreen(nickname: _userNickname!, onLogout: _onLogout)
          : MyInfoScreen(onLoginSuccess: _onLoginSuccess),
      const Center(child: Text('설정 화면')),
    ];

    // '내 정보' 탭이 아닐 때만 AppBar를 보여줌
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

// 홈 화면의 내용을 담는 위젯
class HomeScreenBody extends StatefulWidget {
  final String? nickname;
  const HomeScreenBody({super.key, this.nickname});

  @override
  State<HomeScreenBody> createState() => _HomeScreenBodyState();
}

class _HomeScreenBodyState extends State<HomeScreenBody> {
  int _selectedCategoryIndex = -1;

  void _onCategoryTapped(int index) {
    setState(() {
      if (_selectedCategoryIndex == index) {
        _selectedCategoryIndex = -1;
      } else {
        _selectedCategoryIndex = index;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    // 닉네임 유무에 따라 환영 메시지 변경
    final String welcomeMessage =
    widget.nickname != null ? '안녕하세요, ${widget.nickname}님 👋' : '안녕하세요, 등대지기님 👋';

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
              icon: Icons.forum_outlined,
              label: '익명 커뮤니티',
              isSelected: _selectedCategoryIndex == 0,
              onPressed: () => _onCategoryTapped(0),
            ),
            _buildServiceButton(
              icon: Icons.lightbulb_outline,
              label: 'AI 맞춤 혜택',
              isSelected: _selectedCategoryIndex == 1,
              onPressed: () => _onCategoryTapped(1),
            ),
          ],
        ),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildServiceButton(
              icon: Icons.favorite_border,
              label: '정신 건강 관리',
              isSelected: _selectedCategoryIndex == 2,
              onPressed: () => _onCategoryTapped(2),
            ),
            _buildServiceButton(
              icon: Icons.sos_outlined,
              label: '긴급 지원',
              isSelected: _selectedCategoryIndex == 3,
              onPressed: () => _onCategoryTapped(3),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildServiceButton({
    required IconData icon,
    required String label,
    required bool isSelected,
    required VoidCallback onPressed,
  }) {
    final Color backgroundColor = isSelected ? const Color(0xFF63B967) : Colors.white;
    final Color contentColor = isSelected ? Colors.white : Colors.black87;
    final Color borderColor = isSelected ? Colors.transparent : Colors.grey[200]!;

    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: MediaQuery.of(context).size.width * 0.4,
        height: 120,
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderColor, width: 1.5),
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
            Icon(icon, size: 32, color: contentColor),
            const SizedBox(height: 10),
            Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
                color: contentColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
