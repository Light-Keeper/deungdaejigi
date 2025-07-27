import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:uuid/uuid.dart';
import 'package:simple_animations/simple_animations.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:geolocator/geolocator.dart';

// --- 데이터 모델 및 전역 변수 ---

// 상담 센터 데이터 모델
class CounselingCenter {
  final String name;
  final String phone;
  final String address;
  final String region;
  final double lat;
  final double lon;

  CounselingCenter({
    required this.name,
    required this.phone,
    required this.address,
    required this.region,
    required this.lat,
    required this.lon,
  });
}

// 전국 상담 센터 데이터 (샘플 확장)
final List<CounselingCenter> allCounselingCenters = [
  // 전북
  CounselingCenter(name: '익산시정신건강복지센터', phone: '063-841-4235', address: '전북 익산시 인북로32길 35', region: '전북', lat: 35.9468, lon: 126.9535),
  CounselingCenter(name: '원광대학교병원 정신건강의학과', phone: '063-859-1114', address: '전북 익산시 무왕로 895', region: '전북', lat: 35.9685, lon: 126.9802),
  CounselingCenter(name: '전주시정신건강복지센터', phone: '063-273-6995', address: '전북 전주시 덕진구 숲정이로 20', region: '전북', lat: 35.8471, lon: 127.1291),
  // 서울
  CounselingCenter(name: '서울시정신건강복지센터', phone: '02-3444-9934', address: '서울 용산구 이태원로 246', region: '서울', lat: 37.5378, lon: 126.9925),
  CounselingCenter(name: '강남구정신건강복지센터', phone: '02-568-1361', address: '서울 강남구 봉은사로 320', region: '서울', lat: 37.5097, lon: 127.0381),
  CounselingCenter(name: '마포구정신건강복지센터', phone: '02-3272-4936', address: '서울 마포구 월드컵북로 111', region: '서울', lat: 37.5642, lon: 126.9084),
  // 경기
  CounselingCenter(name: '수원시정신건강복지센터', phone: '031-253-5737', address: '경기 수원시 장안구 경수대로 993', region: '경기', lat: 37.2991, lon: 127.0089),
  CounselingCenter(name: '성남시정신건강복지센터', phone: '031-754-3220', address: '경기 성남시 중원구 금빛로 5', region: '경기', lat: 37.4433, lon: 127.1595),
  // 부산
  CounselingCenter(name: '부산광역시정신건강복지센터', phone: '051-242-2575', address: '부산 연제구 중앙대로 1225', region: '부산', lat: 35.1942, lon: 129.0769),
  // 대구
  CounselingCenter(name: '대구광역정신건강복지센터', phone: '053-600-1932', address: '대구 남구 중앙대로 231', region: '대구', lat: 35.8569, lon: 128.5913),
  // 광주
  CounselingCenter(name: '광주광역정신건강복지센터', phone: '062-600-1932', address: '광주 서구 상무누리로 30', region: '광주', lat: 35.1524, lon: 126.8512),
  // 전국
  CounselingCenter(name: '청소년상담복지센터', phone: '1388', address: '전국 청소년상담전화', region: '전국', lat: 0, lon: 0),
];

// 감정 기록 데이터 모델
class EmotionJournalEntry {
  final String id;
  String title;
  String emotion;
  String note;
  DateTime date;

  EmotionJournalEntry({required this.id, required this.title, required this.emotion, required this.note, required this.date});
}

List<EmotionJournalEntry> journalEntries = [];

// 자가진단 질문 데이터 모델
class DiagnosisQuestion {
  final String questionText;
  final List<String> options;
  DiagnosisQuestion({required this.questionText, required this.options});
}

final List<DiagnosisQuestion> diagnosisQuestions = [
  DiagnosisQuestion(questionText: '지난 2주 동안, 기분이 가라앉거나, 우울하거나, 희망이 없다고 느낀 적이 얼마나 자주 있었나요?', options: ['전혀 없음', '며칠 동안', '일주일 이상', '거의 매일']),
  DiagnosisQuestion(questionText: '지난 2주 동안, 일상 활동에 대한 흥미나 즐거움이 얼마나 감소했나요?', options: ['전혀 없음', '며칠 동안', '일주일 이상', '거의 매일']),
  DiagnosisQuestion(questionText: '지난 2주 동안, 걱정을 멈추거나 조절할 수 없다고 느낀 적이 얼마나 자주 있었나요?', options: ['전혀 없음', '며칠 동안', '일주일 이상', '거의 매일']),
  DiagnosisQuestion(questionText: '지난 2주 동안, 쉽게 짜증이 나거나 안절부절못한 적이 얼마나 자주 있었나요?', options: ['전혀 없음', '며칠 동안', '일주일 이상', '거의 매일']),
  DiagnosisQuestion(questionText: '지난 2주 동안, 잠들기 어렵거나, 너무 많이 자는 등 수면에 문제가 있었던 적이 얼마나 자주 있었나요?', options: ['전혀 없음', '며칠 동안', '일주일 이상', '거의 매일']),
];


// --- 1. 정신 건강 관리 메인 화면 ---
class MentalHealthScreen extends StatelessWidget {
  const MentalHealthScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('정신 건강 관리', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFFF9F9F9),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      backgroundColor: const Color(0xFFF9F9F9),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('마음 돌봄', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('나의 마음 상태를 점검하고 돌보는 시간이에요.', style: TextStyle(fontSize: 16, color: Colors.grey[600])),
            const SizedBox(height: 32),
            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                children: [
                  _buildMenuButton(context, icon: Icons.psychology_outlined, label: '우울/불안\n자가진단', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const SelfDiagnosisScreen()))),
                  _buildMenuButton(context, icon: Icons.edit_calendar_outlined, label: '일일 감정 기록', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const DailyEmotionJournalScreen()))),
                  _buildMenuButton(context, icon: Icons.self_improvement_outlined, label: '명상 콘텐츠', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const MeditationListScreen()))),
                  _buildMenuButton(context, icon: Icons.support_agent_outlined, label: '전문 상담 지원', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const CounselingCenterListScreen()))),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuButton(BuildContext context, {required IconData icon, required String label, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.1), spreadRadius: 2, blurRadius: 8, offset: const Offset(0, 4))],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: Colors.green[700]),
            const SizedBox(height: 16),
            Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.black87)),
          ],
        ),
      ),
    );
  }
}

// --- 2. 자가진단 화면들 ---

// 2-1. 자가진단 질문 화면
class SelfDiagnosisScreen extends StatefulWidget {
  const SelfDiagnosisScreen({super.key});
  @override
  State<SelfDiagnosisScreen> createState() => _SelfDiagnosisScreenState();
}
class _SelfDiagnosisScreenState extends State<SelfDiagnosisScreen> {
  final PageController _pageController = PageController();
  final Map<int, int> _answers = {};
  void _onOptionSelected(int qIndex, int oIndex) {
    setState(() => _answers[qIndex] = oIndex);
    if (qIndex < diagnosisQuestions.length - 1) {
      _pageController.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
    }
  }
  void _submitDiagnosis() {
    int totalScore = _answers.values.fold(0, (a, b) => a + b);
    Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => DiagnosisResultScreen(score: totalScore)));
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('자가진단', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: Colors.grey[200], height: 1.0),
        ),
      ),
      backgroundColor: Colors.white,
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: LinearProgressIndicator(
                value: (_answers.length) / diagnosisQuestions.length,
                backgroundColor: Colors.grey[200],
                valueColor: AlwaysStoppedAnimation<Color>(Colors.green[600]!),
                minHeight: 8,
              ),
            ),
          ),
          Expanded(
            child: PageView.builder(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: diagnosisQuestions.length,
              itemBuilder: (context, index) => _buildQuestionPage(diagnosisQuestions[index], index),
            ),
          ),
          if (_answers.length == diagnosisQuestions.length)
            Padding(
              padding: const EdgeInsets.fromLTRB(24.0, 8.0, 24.0, 24.0),
              child: ElevatedButton(
                onPressed: _submitDiagnosis,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 56),
                  backgroundColor: Colors.green[600],
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('결과 보기', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
        ],
      ),
    );
  }
  Widget _buildQuestionPage(DiagnosisQuestion question, int questionIndex) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Q${questionIndex + 1}.', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.green[700])),
            const SizedBox(height: 12),
            Text(question.questionText, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w500, height: 1.5)),
            const SizedBox(height: 48),
            ...List.generate(question.options.length, (optionIndex) {
              bool isSelected = _answers[questionIndex] == optionIndex;
              return Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: ElevatedButton(
                  onPressed: () => _onOptionSelected(questionIndex, optionIndex),
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 56),
                    backgroundColor: isSelected ? Colors.green[50] : Colors.white,
                    foregroundColor: Colors.black87,
                    elevation: 0,
                    side: BorderSide(color: isSelected ? Colors.green[600]! : Colors.grey[300]!, width: isSelected ? 2 : 1),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: Text(question.options[optionIndex], style: TextStyle(fontSize: 16, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}

// 2-2. 자가진단 결과 화면
class DiagnosisResultScreen extends StatelessWidget {
  final int score;
  const DiagnosisResultScreen({super.key, required this.score});
  String _getInterpretation(int score) {
    if (score <= 4) return '현재 특별한 우울/불안 증세는 보이지 않습니다. 지금처럼 꾸준히 마음을 돌봐주세요.';
    if (score <= 9) return '가벼운 수준의 우울/불안감이 있을 수 있습니다. 충분한 휴식과 즐거운 활동을 통해 기분을 전환해보세요.';
    if (score <= 14) return '중간 수준의 우울/불안감이 의심됩니다. 어려움이 지속된다면 전문가와의 상담을 고려해보는 것이 좋습니다.';
    return '심한 수준의 우울/불안감이 나타나고 있습니다. 혼자 힘들어하지 마시고, 빠른 시일 내에 전문가의 도움을 받아보시길 권장합니다.';
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('진단 결과', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      backgroundColor: Colors.white,
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Spacer(),
            const Text('마음 점검 결과', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
            const SizedBox(height: 16),
            Text('나의 점수는', style: TextStyle(fontSize: 16, color: Colors.grey[600]), textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text('$score점', style: TextStyle(fontSize: 64, fontWeight: FontWeight.bold, color: Colors.green[700]), textAlign: TextAlign.center),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Colors.grey[50], borderRadius: BorderRadius.circular(16)),
              child: Text(_getInterpretation(score), textAlign: TextAlign.center, style: const TextStyle(fontSize: 16, height: 1.6)),
            ),
            const SizedBox(height: 16),
            const Text('※ 본 검사는 간이 심리 검사로, 의학적 진단을 대체할 수 없습니다. 정확한 진단은 전문가와 상담하세요.', style: TextStyle(fontSize: 12, color: Colors.grey), textAlign: TextAlign.center),
            const Spacer(flex: 2),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 56),
                backgroundColor: Colors.green[600],
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text('확인', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}

// --- 3. 감정 기록 화면들 ---

// 3-1. 감정 기록 목록 화면
class DailyEmotionJournalScreen extends StatefulWidget {
  const DailyEmotionJournalScreen({super.key});

  @override
  State<DailyEmotionJournalScreen> createState() => _DailyEmotionJournalScreenState();
}
class _DailyEmotionJournalScreenState extends State<DailyEmotionJournalScreen> {
  bool _isSelectionMode = false;
  final Set<String> _selectedEntryIds = {};

  void _toggleSelectionMode() {
    setState(() {
      _isSelectionMode = !_isSelectionMode;
      _selectedEntryIds.clear();
    });
  }

  void _toggleSelection(String entryId) {
    setState(() {
      if (_selectedEntryIds.contains(entryId)) {
        _selectedEntryIds.remove(entryId);
      } else {
        _selectedEntryIds.add(entryId);
      }
    });
  }

  void _addOrEditEntry({EmotionJournalEntry? entryToEdit}) async {
    final result = await Navigator.push<EmotionJournalEntry>(
      context,
      MaterialPageRoute(builder: (context) => AddEmotionEntryScreen(entryToEdit: entryToEdit)),
    );

    if (result != null && mounted) {
      setState(() {
        if (entryToEdit != null) {
          final index = journalEntries.indexWhere((e) => e.id == result.id);
          if (index != -1) journalEntries[index] = result;
        } else {
          journalEntries.insert(0, result);
        }
        journalEntries.sort((a, b) => b.date.compareTo(a.date));
      });
    }
  }

  Future<void> _showDeleteConfirmationDialog({required bool deleteAll}) async {
    final count = _selectedEntryIds.length;
    if (!deleteAll && count == 0) return;

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(deleteAll ? '전체 삭제' : '기록 삭제'),
        content: Text(deleteAll ? '모든 기록을 삭제하시겠습니까?' : '$count개의 기록을 삭제하시겠습니까?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('취소')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('삭제', style: TextStyle(color: Colors.red))),
        ],
      ),
    );

    if (result == true) {
      setState(() {
        if (deleteAll) {
          journalEntries.clear();
        } else {
          journalEntries.removeWhere((entry) => _selectedEntryIds.contains(entry.id));
        }
        _isSelectionMode = false;
        _selectedEntryIds.clear();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isSelectionMode ? '${_selectedEntryIds.length}개 선택됨' : '감정 기록', style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFFF9F9F9),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
        leading: _isSelectionMode ? IconButton(icon: const Icon(Icons.close), onPressed: _toggleSelectionMode) : null,
        actions: [
          if (journalEntries.isNotEmpty)
            _isSelectionMode
                ? IconButton(icon: const Icon(Icons.delete_sweep_outlined), onPressed: () => _showDeleteConfirmationDialog(deleteAll: true))
                : IconButton(icon: const Icon(Icons.edit_note), onPressed: _toggleSelectionMode),
          if (_isSelectionMode)
            IconButton(icon: const Icon(Icons.delete_outline), onPressed: () => _showDeleteConfirmationDialog(deleteAll: false)),
        ],
      ),
      backgroundColor: const Color(0xFFF9F9F9),
      body: journalEntries.isEmpty
          ? const Center(child: Text('아직 기록이 없어요.\n오늘의 감정을 기록해보세요.', textAlign: TextAlign.center, style: TextStyle(fontSize: 16, color: Colors.grey)))
          : ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: journalEntries.length,
        itemBuilder: (context, index) {
          final entry = journalEntries[index];
          final isSelected = _selectedEntryIds.contains(entry.id);
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            elevation: 1,
            shadowColor: Colors.grey.withOpacity(0.2),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            color: isSelected ? Colors.green[50] : Colors.white,
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
              leading: _isSelectionMode
                  ? Icon(isSelected ? Icons.check_circle : Icons.radio_button_unchecked, color: Colors.green)
                  : Text(entry.emotion, style: const TextStyle(fontSize: 32)),
              title: Text(entry.title.isEmpty ? '제목 없음' : entry.title, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(DateFormat('yyyy.MM.dd (E) HH:mm', 'ko_KR').format(entry.date)),
              onTap: () {
                if (_isSelectionMode) {
                  _toggleSelection(entry.id);
                } else {
                  _addOrEditEntry(entryToEdit: entry);
                }
              },
            ),
          );
        },
      ),
      floatingActionButton: _isSelectionMode
          ? null
          : FloatingActionButton(
        onPressed: () => _addOrEditEntry(),
        backgroundColor: Colors.green[600],
        foregroundColor: Colors.white,
        child: const Icon(Icons.add),
      ),
    );
  }
}

// 3-2. 감정 기록 추가/수정 화면
class AddEmotionEntryScreen extends StatefulWidget {
  final EmotionJournalEntry? entryToEdit;
  const AddEmotionEntryScreen({super.key, this.entryToEdit});

  @override
  State<AddEmotionEntryScreen> createState() => _AddEmotionEntryScreenState();
}
class _AddEmotionEntryScreenState extends State<AddEmotionEntryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _noteController = TextEditingController();
  String? _selectedEmotion;
  DateTime _selectedDate = DateTime.now();
  final List<String> _emotions = ['😊', '🙂', '😐', '😢', '😠'];

  @override
  void initState() {
    super.initState();
    if (widget.entryToEdit != null) {
      _titleController.text = widget.entryToEdit!.title;
      _selectedEmotion = widget.entryToEdit!.emotion;
      _noteController.text = widget.entryToEdit!.note;
      _selectedDate = widget.entryToEdit!.date;
    }
  }

  Future<void> _selectDateTime() async {
    final DateTime? pickedDate = await showDatePicker(context: context, initialDate: _selectedDate, firstDate: DateTime(2000), lastDate: DateTime(2101));
    if (pickedDate == null || !mounted) return;
    final TimeOfDay? pickedTime = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(_selectedDate));
    if (pickedTime == null) return;
    setState(() => _selectedDate = DateTime(pickedDate.year, pickedDate.month, pickedDate.day, pickedTime.hour, pickedTime.minute));
  }

  void _saveEntry() {
    if (_selectedEmotion == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('오늘의 감정을 선택해주세요.')));
      return;
    }
    if (_formKey.currentState!.validate()) {
      final newEntry = EmotionJournalEntry(
        id: widget.entryToEdit?.id ?? const Uuid().v4(),
        title: _titleController.text,
        emotion: _selectedEmotion!,
        note: _noteController.text,
        date: _selectedDate,
      );
      Navigator.pop(context, newEntry);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.entryToEdit == null ? '오늘의 기록' : '기록 수정', style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('오늘의 마음은 어떤가요?', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(height: 24),
              Row(
                children: _emotions.map((emotion) {
                  bool isSelected = _selectedEmotion == emotion;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedEmotion = emotion),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.all(8),
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        decoration: BoxDecoration(
                          color: isSelected ? Colors.green[50] : Colors.transparent,
                          shape: BoxShape.circle,
                          border: Border.all(color: isSelected ? Colors.green[600]! : Colors.grey[300]!, width: isSelected ? 2 : 1),
                        ),
                        child: Center(child: Text(emotion, style: const TextStyle(fontSize: 32))),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 32),
              const Text('날짜 및 시간', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              InkWell(
                onTap: _selectDateTime,
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(12)),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(DateFormat('yyyy년 M월 d일 (E) HH:mm', 'ko_KR').format(_selectedDate), style: const TextStyle(fontSize: 16)),
                      const Icon(Icons.calendar_month_outlined, color: Colors.grey),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              const Text('제목', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              TextFormField(
                controller: _titleController,
                decoration: InputDecoration(
                  hintText: '제목을 입력하세요',
                  filled: true,
                  fillColor: Colors.grey[100],
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
                validator: (value) => (value == null || value.trim().isEmpty) ? '제목을 입력해주세요.' : null,
              ),
              const SizedBox(height: 24),
              const Text('어떤 일이 있었나요?', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              TextFormField(
                controller: _noteController,
                maxLines: 5,
                decoration: InputDecoration(
                  hintText: '오늘 있었던 일이나 감정을 자유롭게 기록해보세요.',
                  filled: true,
                  fillColor: Colors.grey[100],
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
                validator: (value) => (value == null || value.trim().isEmpty) ? '내용을 입력해주세요.' : null,
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: _saveEntry,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 56),
                  backgroundColor: Colors.green[600],
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('기록 저장하기', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// --- 4. 명상 화면들 ---

// 4-1. 명상 목록 화면
class MeditationListScreen extends StatelessWidget {
  const MeditationListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('명상 콘텐츠', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFFF9F9F9),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      backgroundColor: const Color(0xFFF9F9F9),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          _buildMeditationItem(context, title: '스트레스 해소', description: '편안한 호흡으로 긴장을 완화해요.', color: Colors.blue.shade100),
          _buildMeditationItem(context, title: '집중력 향상', description: '마음의 중심을 잡고 집중력을 높여요.', color: Colors.orange.shade100),
          _buildMeditationItem(context, title: '편안한 수면', description: '하루의 피로를 풀고 숙면을 준비해요.', color: Colors.purple.shade100),
          _buildMeditationItem(context, title: '아침 명상', description: '활기찬 하루를 위한 긍정 에너지를 채워요.', color: Colors.yellow.shade100),
        ],
      ),
    );
  }

  Widget _buildMeditationItem(BuildContext context, {required String title, required String description, required Color color}) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 16.0),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      shadowColor: Colors.grey.withOpacity(0.1),
      child: InkWell(
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => MeditationPlayerScreen(title: title))),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(20.0),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: LinearGradient(colors: [color.withOpacity(0.5), color], begin: Alignment.topLeft, end: Alignment.bottomRight),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black87)),
              const SizedBox(height: 8),
              Text(description, style: TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.6))),
            ],
          ),
        ),
      ),
    );
  }
}

// 4-2. 명상 플레이어 화면
class MeditationPlayerScreen extends StatefulWidget {
  final String title;
  const MeditationPlayerScreen({super.key, required this.title});

  @override
  State<MeditationPlayerScreen> createState() => _MeditationPlayerScreenState();
}
class _MeditationPlayerScreenState extends State<MeditationPlayerScreen> {
  bool _isPlaying = true;
  String _guideText = '숨을 깊게 들이쉬세요';
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    if (_isPlaying) {
      _startTextTimer();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTextTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (mounted) {
        setState(() {
          _guideText = _guideText == '숨을 깊게 들이쉬세요' ? '천천히 내쉬세요' : '숨을 깊게 들이쉬세요';
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title, style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      extendBodyBehindAppBar: true,
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [Colors.green.shade50, Colors.teal.shade50], begin: Alignment.topLeft, end: Alignment.bottomRight),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(flex: 2),
              _isPlaying
                  ? MirrorAnimationBuilder<double>(
                tween: Tween(begin: 1.0, end: 1.5),
                duration: const Duration(seconds: 4),
                curve: Curves.easeInOut,
                builder: (context, value, child) {
                  return Transform.scale(scale: value, child: child);
                },
                child: Container(
                  width: 150,
                  height: 150,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withOpacity(0.8),
                    boxShadow: [BoxShadow(color: Colors.green.withOpacity(0.2), blurRadius: 20, spreadRadius: 5)],
                  ),
                ),
              )
                  : Container(
                width: 150,
                height: 150,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.8),
                  boxShadow: [BoxShadow(color: Colors.green.withOpacity(0.2), blurRadius: 20, spreadRadius: 5)],
                ),
              ),
              const SizedBox(height: 48),
              Text(_guideText, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w500)),
              const Spacer(flex: 3),
              IconButton(
                icon: Icon(_isPlaying ? Icons.pause_circle_filled : Icons.play_circle_filled, size: 64, color: Colors.green[700]),
                onPressed: () {
                  setState(() => _isPlaying = !_isPlaying);
                  if (_isPlaying) {
                    _startTextTimer();
                  } else {
                    _timer?.cancel();
                  }
                },
              ),
              const Spacer(flex: 1),
            ],
          ),
        ),
      ),
    );
  }
}

// --- 5. 전문 상담 지원 화면 (통합 및 개선된 버전) ---
class CounselingCenterListScreen extends StatefulWidget {
  const CounselingCenterListScreen({super.key});

  @override
  State<CounselingCenterListScreen> createState() => _CounselingCenterListScreenState();
}
class _CounselingCenterListScreenState extends State<CounselingCenterListScreen> {
  final _searchController = TextEditingController();
  List<CounselingCenter> _filteredCenters = [];
  String _selectedRegion = '내 주변';
  bool _isLoading = true;

  final List<String> _regions = ['내 주변', '전체', '서울', '경기', '전북', '부산', '대구', '광주', '전국'];

  @override
  void initState() {
    super.initState();
    _initializeCenters();
    _searchController.addListener(() {
      _filterCenters();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _initializeCenters() async {
    setState(() => _isLoading = true);
    try {
      Position position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      List<CounselingCenter> sortedCenters = List.from(allCounselingCenters);
      sortedCenters.sort((a, b) {
        if (a.lat == 0) return 1;
        if (b.lat == 0) return -1;
        double distA = Geolocator.distanceBetween(position.latitude, position.longitude, a.lat, a.lon);
        double distB = Geolocator.distanceBetween(position.latitude, position.longitude, b.lat, b.lon);
        return distA.compareTo(distB);
      });
      _filteredCenters = sortedCenters;
    } catch (e) {
      _filteredCenters = allCounselingCenters;
    }
    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  void _filterCenters() {
    List<CounselingCenter> results = [];
    if (_selectedRegion == '내 주변' || _selectedRegion == '전체') {
      results = allCounselingCenters;
    } else {
      results = allCounselingCenters.where((center) => center.region == _selectedRegion).toList();
    }

    final query = _searchController.text.toLowerCase().trim();
    if (query.isNotEmpty) {
      results = results.where((center) {
        return center.name.toLowerCase().contains(query) || center.address.toLowerCase().contains(query);
      }).toList();
    }

    setState(() {
      _filteredCenters = results;
    });
  }

  Future<void> _makePhoneCall(BuildContext context, String phoneNumber) async {
    final Uri launchUri = Uri(scheme: 'tel', path: phoneNumber);
    if (!await launchUrl(launchUri)) {
      if(context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('전화를 걸 수 없습니다: $phoneNumber')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('전문 상담 지원', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFFF9F9F9),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      backgroundColor: const Color(0xFFF9F9F9),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12.0),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedRegion,
                      onChanged: (String? newValue) {
                        setState(() {
                          _selectedRegion = newValue!;
                          if (_selectedRegion == '내 주변') {
                            _initializeCenters();
                          } else {
                            _filterCenters();
                          }
                        });
                      },
                      items: _regions.map<DropdownMenuItem<String>>((String value) {
                        return DropdownMenuItem<String>(
                          value: value,
                          child: Text(value),
                        );
                      }).toList(),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: '센터 이름 검색',
                      prefixIcon: const Icon(Icons.search),
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: EdgeInsets.zero,
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey.shade300),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.green.shade600),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredCenters.isEmpty
                ? const Center(child: Text('검색 결과가 없습니다.'))
                : ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              itemCount: _filteredCenters.length,
              itemBuilder: (context, index) {
                final center = _filteredCenters[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(center.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(Icons.location_on_outlined, size: 16, color: Colors.grey[600]),
                            const SizedBox(width: 8),
                            Expanded(child: Text(center.address, style: TextStyle(color: Colors.grey[800]))),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(Icons.call_outlined, size: 16, color: Colors.grey[600]),
                            const SizedBox(width: 8),
                            Expanded(child: Text(center.phone, style: TextStyle(color: Colors.grey[800]))),
                            TextButton(
                              onPressed: () => _makePhoneCall(context, center.phone),
                              child: const Text('전화 걸기'),
                            )
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
