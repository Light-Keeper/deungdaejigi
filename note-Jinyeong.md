## [ Subject ] type (커밋 종류)

- feat: 새로운 기능 추가
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 스타일 변경 (코드 포매팅, 세미콜론 누락 등)
- design: 사용자 UI 디자인 변경 (CSS 등)
- test: 테스트 코드, 리팩토링 (Test Code)
- refactor: 리팩토링 (Production Code)
- build: 빌드 파일 수정
- ci: CI 설정 파일 수정
- perf: 성능 개선
- chore: 자잘한 수정이나 빌드 업데이트
- rename: 파일 혹은 폴더명을 수정만 한 경우
- remove: 파일을 삭제만 한 경우

> > > 요즘은 정보 압축을 위해 이모지(gitmoji)를 사용하는 커밋 컨벤션도 있습니다.

## [ Subject ] scope

- 선택사항이며, 변경된 부분을 직접적으로 표기합니다.
- EX) 함수가 변경되었으면 함수명, 메소드가 추가되었으면 클래스명 기입 등

## [ Subject ] subject

- 첫 글자는 대문자로 입력합니다.
- 마지막에는 .(period)을 찍지 않습니다.
- 영문 기준 최대 50자를 넘지 않습니다.
- 제목은 명령문의 형태로 작성합니다. (동사원형 사용)

## [ Body ]

- 각 줄은 최대 72자를 넘지 않도록 합니다.
- 어떻게 변경했는지보다, 무엇을 변경했고, 왜 변경했는지를 설명합니다.

## [ Footer ]

- 선택사항이며, 관련된 이슈를 언급합니다. Ex) Fixes: #1, #2
- 주로 Closes(종료), Fixes(수정), Resolves(해결), Ref(참고), Related to(관련) 키워드를 사용합니다.

> > > 저는 개인 저장소에 커밋할 때는 '[feat] XX 구현', '[fix] XX 수정' 등으로 간단하게 작성합니다.

출처: https://nohack.tistory.com/17 [lucid_dream:티스토리]
