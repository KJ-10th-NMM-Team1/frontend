# Store와 Zustand 가이드

## Store란?

**Store(저장소)**는 전역 상태 관리 저장소입니다. 여러 컴포넌트에서 공유하는 데이터를 중앙에서 관리하는 곳입니다.

### 왜 필요한가?

1. **Props Drilling 방지**: 깊은 컴포넌트까지 props를 계속 전달할 필요 없음
2. **상태 동기화**: 여러 컴포넌트가 같은 데이터를 공유하고 자동으로 업데이트
3. **상태 유지**: 컴포넌트가 언마운트되어도 상태가 유지됨

### Store 없이 vs Store 사용

```typescript
// ❌ Store 없이 (Props Drilling)
<Parent data={data}>
  <Child data={data}>
    <GrandChild data={data}>
      <GreatGrandChild data={data} />  // 계속 전달해야 함
    </GrandChild>
  </Child>
</Parent>

// ✅ Store 사용
// 어디서든 직접 접근 가능
const data = useStore(state => state.data)
```

---

## Zustand란?

**Zustand**는 React를 위한 가볍고 간단한 상태 관리 라이브러리입니다.

### 특징

- 🪶 **가벼움**: 번들 크기가 매우 작음 (~1KB)
- 🎯 **간단함**: 보일러플레이트 코드가 거의 없음
- 🔷 **TypeScript 지원**: 타입 안정성 제공
- ⚡ **성능**: 필요한 부분만 리렌더링
- 🛠️ **Redux DevTools 지원**: 디버깅 도구 사용 가능

### 다른 상태 관리와 비교

| 라이브러리      | 복잡도 | 학습 곡선 | 번들 크기 | 특징            |
| --------------- | ------ | --------- | --------- | --------------- |
| **Redux**       | 높음   | 높음      | ~10KB     | 강력하지만 복잡 |
| **Context API** | 중간   | 낮음      | 내장      | 성능 이슈 가능  |
| **Zustand**     | 낮음   | 낮음      | ~1KB      | 간단하고 효율적 |

---

## 현재 프로젝트의 Store 구조

### 1. Store 정의 (`useEditorStore.ts`)

```typescript
import { create } from 'zustand'

type EditorUiState = {
  // 상태 (State)
  segments: Record<string, Segment> // 세그먼트 데이터
  activeSegmentId: string | null // 현재 활성 세그먼트
  isPlaying: boolean // 재생 중인지

  // 액션 (Actions) - 상태를 변경하는 함수들
  setSegments: (segments: Segment[]) => void
  updateSegmentSourceText: (segmentId: string, sourceText: string) => void
  updateSegmentTargetText: (segmentId: string, targetText: string) => void
  setActiveSegment: (id: string | null) => void
}

// Store 생성
export const useEditorStore = create<EditorUiState>()((set) => ({
  // 초기 상태
  segments: {},
  activeSegmentId: null,
  isPlaying: false,

  // 상태 변경 함수
  updateSegmentSourceText: (segmentId, sourceText) =>
    set((state) => ({
      segments: {
        ...state.segments,
        [segmentId]: { ...state.segments[segmentId], source_text: sourceText },
      },
    })),
}))
```

### 2. 컴포넌트에서 사용

```typescript
// 방법 1: 필요한 것만 선택적으로 가져오기 (권장)
const { segments, updateSegmentSourceText } = useEditorStore((state) => ({
  segments: state.segments,
  updateSegmentSourceText: state.updateSegmentSourceText,
}))

// 방법 2: 전체 store 가져오기
const store = useEditorStore()
const segments = store.segments
```

### 3. 실제 사용 예시

```typescript
// TranslationWorkspace.tsx
export function TranslationWorkspace({ segments }) {
  // Store에서 상태와 함수 가져오기
  const {
    segments: storeSegments, // 상태 읽기
    updateSegmentSourceText, // 상태 변경 함수
    updateSegmentTargetText,
  } = useEditorStore((state) => ({
    segments: state.segments,
    updateSegmentSourceText: state.updateSegmentSourceText,
    updateSegmentTargetText: state.updateSegmentTargetText,
  }))

  // 초기 데이터를 store에 저장
  useEffect(() => {
    setSegments(segments)
  }, [segments])

  // 사용자가 textarea에서 수정
  const handleSourceChange = (segmentId: string, value: string) => {
    updateSegmentSourceText(segmentId, value) // Store 업데이트
  }

  // 번역 시 최신 값 사용
  const handleTranslate = async (segment: Segment) => {
    // Store에서 최신 source_text 가져오기
    const currentSegment = storeSegments[segment.id] ?? segment
    const sourceText = currentSegment.source_text // 수정된 내용 반영됨!

    // API 호출
    await apiPost(`/api/segments/${segment.id}/translate`, {
      source_text: sourceText, // 최신 값 사용
    })
  }
}
```

---

## Store의 동작 흐름

```
1. 컴포넌트 마운트
   ↓
2. segments props를 받아서 store에 저장
   setSegments(segments)
   ↓
3. 사용자가 textarea에서 source_text 수정
   onChange → handleSourceChange → updateSegmentSourceText
   ↓
4. Store에 수정된 내용 저장
   segments[segmentId].source_text = "수정된 텍스트"
   ↓
5. Translate 버튼 클릭
   handleTranslate → storeSegments[segment.id]에서 최신 값 가져오기
   ↓
6. API 요청에 최신 source_text 포함
   { source_text: "수정된 텍스트" }
```

---

## Zustand 핵심 API

### 1. Store 생성

```typescript
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}))
```

### 2. 상태 읽기

```typescript
// 전체 상태
const state = useStore()

// 특정 값만
const count = useStore((state) => state.count)

// 여러 값 선택
const { count, increment } = useStore((state) => ({
  count: state.count,
  increment: state.increment,
}))
```

### 3. 상태 변경

```typescript
// 함수형 업데이트 (이전 상태 기반)
set((state) => ({ count: state.count + 1 }))

// 직접 값 설정
set({ count: 10 })

// 부분 업데이트
set((state) => ({
  items: {
    ...state.items,
    [id]: { ...state.items[id], name: 'new name' },
  },
}))
```

### 4. DevTools 연동

```typescript
import { devtools } from 'zustand/middleware'

const useStore = create(
  devtools((set) => ({
    // ... store 정의
  })),
)
```

---

## 현재 프로젝트의 Store 사용 패턴

### 패턴 1: 세그먼트 데이터 관리

```typescript
// Store에 저장
setSegments(segments) // Record<string, Segment> 형태로 저장

// Store에서 읽기
const segment = storeSegments[segmentId]

// Store 업데이트
updateSegmentSourceText(segmentId, '새로운 텍스트')
updateSegmentTargetText(segmentId, '번역된 텍스트')
```

### 패턴 2: 선택적 구독 (성능 최적화)

```typescript
// ✅ 좋은 예: 필요한 것만 구독
const segments = useEditorStore((state) => state.segments)

// ❌ 나쁜 예: 전체 store 구독 (불필요한 리렌더링)
const store = useEditorStore()
```

### 패턴 3: 상태와 액션 분리

```typescript
// 상태 (읽기 전용)
const segments = useEditorStore((state) => state.segments)

// 액션 (상태 변경)
const updateSegment = useEditorStore((state) => state.updateSegmentSourceText)
```

---

## 주의사항

### 1. 불변성 유지

```typescript
// ❌ 잘못된 예: 직접 수정
state.segments[id].source_text = 'new' // Store가 변경을 감지 못함

// ✅ 올바른 예: 새 객체 생성
set((state) => ({
  segments: {
    ...state.segments,
    [id]: { ...state.segments[id], source_text: 'new' },
  },
}))
```

### 2. 선택적 구독으로 성능 최적화

```typescript
// ✅ 좋은 예: 필요한 것만
const segments = useEditorStore((state) => state.segments)

// ❌ 나쁜 예: 전체 구독
const store = useEditorStore() // 모든 변경에 리렌더링
```

### 3. Store는 전역 상태만

```typescript
// ✅ Store에 저장할 것
- 여러 컴포넌트에서 공유하는 데이터
- 컴포넌트 언마운트 후에도 유지해야 하는 상태

// ❌ Store에 저장하지 말 것
- 컴포넌트 내부에서만 사용하는 로컬 상태 (useState 사용)
- 폼 입력값 (일시적인 데이터)
```

---

## 요약

- **Store**: 전역 상태를 저장하는 중앙 저장소
- **Zustand**: React를 위한 가볍고 간단한 상태 관리 라이브러리
- **장점**: Props drilling 없이 어디서든 상태 접근/수정 가능
- **현재 프로젝트**: 세그먼트의 `source_text`, `target_text`를 store에서 관리하여 여러 컴포넌트에서 동기화

---

## 참고 자료

- [Zustand 공식 문서](https://zustand-demo.pmnd.rs/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
