import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // Shortcuts를 위해 import

// 보여줄 화면의 상태를 정의 (로그인, 회원가입, 찾기)
enum AuthScreenState { login, signUp, findCredentials }

// 내 정보 화면 (로그인, 회원가입, 찾기 기능 포함)
class MyInfoScreen extends StatefulWidget {
  // 로그인 성공 시 호출될 콜백 함수
  final Function(String nickname) onLoginSuccess;
  const MyInfoScreen({super.key, required this.onLoginSuccess});

  @override
  State<MyInfoScreen> createState() => _MyInfoScreenState();
}

class _MyInfoScreenState extends State<MyInfoScreen> {
  // 현재 보여줄 화면 상태를 관리하는 변수
  AuthScreenState _currentScreen = AuthScreenState.login;

  // 회원가입/로그인 폼의 상태를 관리하기 위한 GlobalKey
  final _signUpFormKey = GlobalKey<FormState>();
  final _loginFormKey = GlobalKey<FormState>();

  // 각 입력 필드의 값을 제어하기 위한 컨트롤러
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _nicknameController = TextEditingController();
  final _loginEmailController = TextEditingController();
  final _loginPasswordController = TextEditingController();

  // *** 변경된 부분: static 키워드 제거 ***
  // 회원가입 정보를 임시로 저장할 변수 (실제 앱에서는 DB나 서버 사용)
  String? _registeredEmail;
  String? _registeredPassword;
  String? _registeredNickname;

  // 화면 상태를 변경하는 함수
  void _setScreen(AuthScreenState screen) {
    setState(() {
      _currentScreen = screen;
    });
  }

  @override
  void dispose() {
    // 위젯이 화면에서 사라질 때 컨트롤러들을 정리하여 메모리 누수 방지
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _nicknameController.dispose();
    _loginEmailController.dispose();
    _loginPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // 현재 상태에 따라 다른 UI를 보여줌
    Widget screen;
    switch (_currentScreen) {
      case AuthScreenState.login:
        screen = _buildLoginUI(context);
        break;
      case AuthScreenState.signUp:
        screen = _buildSignUpUI(context);
        break;
      case AuthScreenState.findCredentials:
        screen = _buildFindCredentialsUI(context);
        break;
    }

    // 회원가입 화면에서만 시스템 뒤로가기 버튼 비활성화
    final bool blockBackButton = _currentScreen == AuthScreenState.signUp;

    return PopScope(
      canPop: !blockBackButton,
      onPopInvoked: (didPop) {
        if (didPop) return;
        // 뒤로가기가 막혔을 때 사용자에게 알림 (선택 사항)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('회원가입을 먼저 완료해주세요.')),
        );
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF9F9F9),
        body: SafeArea(
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            transitionBuilder: (Widget child, Animation<double> animation) {
              return FadeTransition(opacity: animation, child: child);
            },
            child: screen,
          ),
        ),
      ),
    );
  }

  // --- 로그인 UI 빌더 ---
  Widget _buildLoginUI(BuildContext context) {
    return Padding(
      key: const ValueKey('login'),
      padding: const EdgeInsets.all(24.0),
      child: Form(
        key: _loginFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Spacer(flex: 2),
            _buildHeader('등대지기 시작하기', '로그인하여 맞춤 서비스를 이용해보세요.'),
            const Spacer(flex: 2),
            TextFormField(
              controller: _loginEmailController,
              decoration: const InputDecoration(hintText: '이메일'),
              keyboardType: TextInputType.emailAddress,
              validator: (value) {
                if (value == null || value.isEmpty) return '이메일을 입력해주세요.';
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _loginPasswordController,
              decoration: const InputDecoration(hintText: '비밀번호'),
              obscureText: true,
              validator: (value) {
                if (value == null || value.isEmpty) return '비밀번호를 입력해주세요.';
                return null;
              },
            ),
            const SizedBox(height: 24),
            _buildElevatedButton('로그인', () {
              if (_loginFormKey.currentState!.validate()) {
                if (_registeredEmail == _loginEmailController.text &&
                    _registeredPassword == _loginPasswordController.text) {
                  widget.onLoginSuccess(_registeredNickname!);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                        content: Text('이메일 또는 비밀번호가 일치하지 않습니다.'),
                        backgroundColor: Colors.red),
                  );
                  _loginEmailController.clear();
                  _loginPasswordController.clear();
                }
              }
            }),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildTextButton('회원가입', () => _setScreen(AuthScreenState.signUp)),
                const Text('|', style: TextStyle(color: Colors.grey)),
                _buildTextButton('아이디/비밀번호 찾기',
                        () => _setScreen(AuthScreenState.findCredentials)),
              ],
            ),
            const Spacer(flex: 3),
          ],
        ),
      ),
    );
  }

  // --- 회원가입 UI 빌더 ---
  Widget _buildSignUpUI(BuildContext context) {
    // 키보드 단축키 비활성화를 위한 설정
    final Map<ShortcutActivator, Intent> disabledShortcuts = {
      const SingleActivator(LogicalKeyboardKey.keyC, control: true): const DoNothingIntent(),
      const SingleActivator(LogicalKeyboardKey.keyV, control: true): const DoNothingIntent(),
      const SingleActivator(LogicalKeyboardKey.keyX, control: true): const DoNothingIntent(),
      const SingleActivator(LogicalKeyboardKey.keyA, control: true): const DoNothingIntent(),
    };

    return Shortcuts(
      shortcuts: disabledShortcuts,
      child: Padding(
        key: const ValueKey('signUp'),
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _signUpFormKey,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(height: MediaQuery.of(context).size.height * 0.1),
                _buildHeader('회원가입', '몇 가지 정보만 입력하면 완료돼요.'),
                const SizedBox(height: 32),
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(hintText: '이메일'),
                  keyboardType: TextInputType.emailAddress,
                  toolbarOptions: const ToolbarOptions(
                    copy: false, paste: false, cut: false, selectAll: false,
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) return '이메일을 입력해주세요.';
                    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
                    if (!emailRegex.hasMatch(value)) return '올바른 이메일 형식이 아닙니다.';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passwordController,
                  decoration: const InputDecoration(hintText: '비밀번호'),
                  obscureText: true,
                  toolbarOptions: const ToolbarOptions(
                    copy: false, paste: false, cut: false, selectAll: false,
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) return '비밀번호를 입력해주세요.';
                    if (value.length < 8) return '비밀번호는 최소 8자 이상 입력해주세요.';
                    final hasNumber = value.contains(RegExp(r'[0-9]'));
                    final hasSpecialCharacter = value.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'));
                    if (!hasNumber || !hasSpecialCharacter) return '숫자와 특수문자를 반드시 포함해야 합니다.';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _confirmPasswordController,
                  decoration: const InputDecoration(hintText: '비밀번호 확인'),
                  obscureText: true,
                  toolbarOptions: const ToolbarOptions(
                    copy: false, paste: false, cut: false, selectAll: false,
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) return '비밀번호를 다시 한번 입력해주세요.';
                    if (value != _passwordController.text) return '비밀번호가 일치하지 않습니다.';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _nicknameController,
                  decoration: const InputDecoration(hintText: '닉네임'),
                  toolbarOptions: const ToolbarOptions(
                    copy: false, paste: false, cut: false, selectAll: false,
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) return '닉네임을 입력해주세요.';
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                _buildElevatedButton('가입하기', () {
                  if (_signUpFormKey.currentState!.validate()) {
                    setState(() {
                      _registeredEmail = _emailController.text;
                      _registeredPassword = _passwordController.text;
                      _registeredNickname = _nicknameController.text;
                    });
                    _signUpFormKey.currentState!.reset();
                    _emailController.clear();
                    _passwordController.clear();
                    _confirmPasswordController.clear();
                    _nicknameController.clear();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('회원가입이 완료되었습니다!')),
                    );
                    _setScreen(AuthScreenState.login);
                  }
                }),
                const SizedBox(height: 16),
                _buildTextButton(
                    '로그인 화면으로 돌아가기', () => _setScreen(AuthScreenState.login)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // --- 아이디/비밀번호 찾기 UI 빌더 ---
  Widget _buildFindCredentialsUI(BuildContext context) {
    return Padding(
      key: const ValueKey('find'),
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Spacer(flex: 2),
          _buildHeader('아이디/비밀번호 찾기', '가입 시 사용한 이메일을 입력해주세요.'),
          const Spacer(flex: 2),
          const TextField(
              decoration: InputDecoration(hintText: '이메일'),
              keyboardType: TextInputType.emailAddress),
          const SizedBox(height: 24),
          _buildElevatedButton('인증메일 발송', () {}),
          const SizedBox(height: 16),
          _buildTextButton(
              '로그인 화면으로 돌아가기', () => _setScreen(AuthScreenState.login)),
          const Spacer(flex: 3),
        ],
      ),
    );
  }

  // --- 공통 위젯: 헤더 ---
  Widget _buildHeader(String title, String subtitle) {
    return Column(
      children: [
        Icon(Icons.light, size: 48, color: Colors.green[600]),
        const SizedBox(height: 16),
        Text(
          title,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Text(
          subtitle,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 16, color: Colors.grey),
        ),
      ],
    );
  }

  // --- 공통 위젯: 메인 버튼 ---
  Widget _buildElevatedButton(String text, VoidCallback onPressed) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.green[600],
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      child: Text(text, style: const TextStyle(fontSize: 16)),
    );
  }

  // --- 공통 위젯: 텍스트 버튼 ---
  Widget _buildTextButton(String text, VoidCallback onPressed) {
    return TextButton(
      onPressed: onPressed,
      child: Text(text, style: const TextStyle(color: Colors.grey)),
    );
  }
}

// --- 로그아웃 버튼 등이 있는 마이페이지 화면 ---
class MyPageScreen extends StatelessWidget {
  final String nickname;
  final VoidCallback onLogout;

  const MyPageScreen({
    super.key,
    required this.nickname,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Icon(Icons.person_pin, size: 80, color: Colors.green[600]),
            const SizedBox(height: 24),
            Text(
              '$nickname님, 환영합니다!',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              '오늘도 등대지기와 함께 힘내봐요!',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 48),
            ElevatedButton(
              onPressed: onLogout,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.red,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Colors.grey[300]!)
                ),
                elevation: 0,
              ),
              child: const Text('로그아웃', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
