import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Globe, Mic, Library, Zap, Users, Code, Gauge, Play } from 'lucide-react';

const PresentationPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 9;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentSlide < totalSlides - 1) {
        setCurrentSlide(currentSlide + 1);
      } else if (e.key === 'ArrowLeft' && currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const slides = [
    // Slide 1 - Title
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <div className="text-center space-y-6">
        <h1 className="text-7xl font-bold mb-4 animate-fade-in">DUPILOT</h1>
        <div className="text-3xl font-light mb-2">1조</div>
        <p className="text-2xl mb-8 text-blue-100">AI 기반 더빙 협업 플랫폼</p>
        <div className="flex gap-6 justify-center text-lg">
          {['진주영', '정성원', '안준', '김현수', '장윤호'].map((name, idx) => (
            <span key={idx} className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur">
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>,

    // Slide 2 - Background
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100 p-16">
      <h2 className="text-5xl font-bold mb-12 text-gray-800">주제 선정 배경</h2>
      <div className="grid grid-cols-3 gap-8 flex-1">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col">
          <Globe className="w-16 h-16 text-blue-600 mb-4" />
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">콘텐츠 글로벌화</h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            OTT 플랫폼의 성장으로 전 세계 콘텐츠에 대한 수요가 급증하며 현지화의 중요성이 증가
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col">
          <Mic className="w-16 h-16 text-purple-600 mb-4" />
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">현지화의 어려움</h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            전문 성우 섭외, 녹음 스튜디오 대여, 품질 관리 등 높은 비용과 시간 소요
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col">
          <Zap className="w-16 h-16 text-orange-600 mb-4" />
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">번역/더빙 과정</h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            복잡한 워크플로우와 커뮤니케이션으로 인한 비효율성 발생
          </p>
        </div>
      </div>
    </div>,

    // Slide 3 - Core Features
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50 p-16">
      <h2 className="text-5xl font-bold mb-12 text-gray-800">핵심 기능</h2>
      <div className="grid grid-cols-3 gap-10 flex-1">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-2xl p-10 text-white transform hover:scale-105 transition-transform">
          <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <Zap className="w-12 h-12" />
          </div>
          <h3 className="text-3xl font-bold mb-4">AI 자동 더빙</h3>
          <ul className="space-y-3 text-lg">
            <li>• 원본 화자 음성 분석</li>
            <li>• 자동 스크립트 생성</li>
            <li>• 다국어 음성 합성</li>
            <li>• 실시간 프리뷰</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl shadow-2xl p-10 text-white transform hover:scale-105 transition-transform">
          <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <Mic className="w-12 h-12" />
          </div>
          <h3 className="text-3xl font-bold mb-4">더빙 스튜디오</h3>
          <ul className="space-y-3 text-lg">
            <li>• 웹 기반 에디터</li>
            <li>• 타임라인 편집</li>
            <li>• 실시간 협업</li>
            <li>• 품질 검수 도구</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl shadow-2xl p-10 text-white transform hover:scale-105 transition-transform">
          <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <Library className="w-12 h-12" />
          </div>
          <h3 className="text-3xl font-bold mb-4">보이스 라이브러리</h3>
          <ul className="space-y-3 text-lg">
            <li>• 음성 샘플 관리</li>
            <li>• AI 음성 모델</li>
            <li>• 캐릭터별 매칭</li>
            <li>• 재사용 가능</li>
          </ul>
        </div>
      </div>
    </div>,

    // Slide 4 - Demo
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-indigo-600 to-purple-700">
      <div className="text-center space-y-8 text-white">
        <Play className="w-32 h-32 mx-auto mb-8 animate-pulse" />
        <h2 className="text-6xl font-bold">시연 / 데모</h2>
        <p className="text-3xl font-light">실제 서비스 동작 시연</p>
      </div>
    </div>,

    // Slide 5 - Architecture
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900">
      <div className="text-center space-y-8 text-white">
        <Code className="w-32 h-32 mx-auto mb-8" />
        <h2 className="text-6xl font-bold">시스템 아키텍처</h2>
        <p className="text-2xl font-light text-gray-300">마이크로서비스 기반 확장 가능한 구조</p>
        <div className="mt-8 bg-white/10 backdrop-blur p-8 rounded-2xl max-w-4xl">
          <p className="text-xl">Frontend (React) → API Gateway → Microservices → AI Models</p>
        </div>
      </div>
    </div>,

    // Slide 6 - Technical Challenge 1
    <div className="flex flex-col h-full bg-white p-16">
      <h2 className="text-5xl font-bold mb-4 text-gray-800">기술적 챌린지 1</h2>
      <h3 className="text-3xl font-semibold mb-8 text-blue-600">유사도 기반 보이스 샘플 매핑 알고리즘</h3>
      <div className="grid grid-cols-3 gap-8 flex-1">
        <div className="bg-white border-2 border-red-300 rounded-2xl p-8 shadow-lg">
          <h4 className="text-2xl font-bold mb-4 text-red-600">🔴 문제</h4>
          <ul className="space-y-3 text-lg text-gray-700">
            <li>• 캐릭터와 음성 모델의 자동 매칭 필요</li>
            <li>• 음성 특징의 정량화 어려움</li>
            <li>• 다양한 언어 간 음성 특성 차이</li>
          </ul>
        </div>
        <div className="bg-white border-2 border-yellow-400 rounded-2xl p-8 shadow-lg">
          <h4 className="text-2xl font-bold mb-4 text-yellow-600">🟡 개선 시도</h4>
          <ul className="space-y-3 text-lg text-gray-700">
            <li>• MFCC 특징 추출 알고리즘 구현</li>
            <li>• 코사인 유사도 기반 매칭</li>
            <li>• 음성 임베딩 벡터화</li>
            <li>• 다차원 특징 공간 분석</li>
          </ul>
        </div>
        <div className="bg-white border-2 border-green-400 rounded-2xl p-8 shadow-lg">
          <h4 className="text-2xl font-bold mb-4 text-green-600">🟢 결과</h4>
          <ul className="space-y-3 text-lg text-gray-700">
            <li>• 매칭 정확도 85% 달성</li>
            <li>• 처리 시간 0.3초 이내</li>
            <li>• 수동 매칭 대비 10배 속도 향상</li>
          </ul>
        </div>
      </div>
    </div>,

    // Slide 7 - Technical Challenge 2
    <div className="flex flex-col h-full bg-white p-16">
      <h2 className="text-5xl font-bold mb-4 text-gray-800">기술적 챌린지 2</h2>
      <h3 className="text-3xl font-semibold mb-8 text-purple-600">더빙 최적화를 위한 에디터 구현</h3>
      <div className="grid grid-cols-3 gap-8 flex-1">
        <div className="bg-white border-2 border-red-300 rounded-2xl p-8 shadow-lg">
          <h4 className="text-2xl font-bold mb-4 text-red-600">🔴 문제</h4>
          <ul className="space-y-3 text-lg text-gray-700">
            <li>• 실시간 오디오/비디오 동기화</li>
            <li>• 대용량 미디어 파일 처리</li>
            <li>• 다중 트랙 관리의 복잡성</li>
            <li>• 브라우저 성능 한계</li>
          </ul>
        </div>
        <div className="bg-white border-2 border-yellow-400 rounded-2xl p-8 shadow-lg">
          <h4 className="text-2xl font-bold mb-4 text-yellow-600">🟡 개선 시도</h4>
          <ul className="space-y-3 text-lg text-gray-700">
            <li>• WebAudio API 활용</li>
            <li>• Canvas 기반 파형 렌더링</li>
            <li>• 가상화된 타임라인 구현</li>
            <li>• 청크 단위 스트리밍</li>
          </ul>
        </div>
        <div className="bg-white border-2 border-green-400 rounded-2xl p-8 shadow-lg">
          <h4 className="text-2xl font-bold mb-4 text-green-600">🟢 결과</h4>
          <ul className="space-y-3 text-lg text-gray-700">
            <li>• 프레임 드롭 90% 감소</li>
            <li>• 메모리 사용량 60% 절감</li>
            <li>• 동시 편집 가능 트랙 10개</li>
          </ul>
        </div>
      </div>
    </div>,

    // Slide 8 - Technical Challenge 3
    <div className="flex flex-col h-full bg-white p-16">
      <h2 className="text-5xl font-bold mb-4 text-gray-800">기술적 챌린지 3</h2>
      <h3 className="text-3xl font-semibold mb-8 text-green-600">처리 속도 최적화</h3>
      <div className="grid grid-cols-3 gap-8 flex-1">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
          <h4 className="text-2xl font-bold mb-4 text-red-700">🔴 문제</h4>
          <ul className="space-y-3 text-lg text-gray-700">
            <li>• AI 모델 추론 시간 과다</li>
            <li>• 대용량 파일 업/다운로드</li>
            <li>• 동시 다중 작업 처리</li>
            <li>• 실시간 응답성 요구</li>
          </ul>
        </div>
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8">
          <h4 className="text-2xl font-bold mb-4 text-yellow-700">🟡 개선 시도</h4>
          <ul className="space-y-3 text-lg text-gray-700">
            <li>• GPU 가속 활용</li>
            <li>• 작업 큐 시스템 도입</li>
            <li>• CDN 캐싱 전략</li>
            <li>• 병렬 처리 파이프라인</li>
            <li>• 모델 경량화 (양자화)</li>
          </ul>
        </div>
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8">
          <h4 className="text-2xl font-bold mb-4 text-green-700">🟢 결과</h4>
          <ul className="space-y-3 text-lg text-gray-700">
            <li>• 처리 속도 5배 향상</li>
            <li>• 응답 시간 2초 → 0.4초</li>
            <li>• 동시 처리 용량 3배 증가</li>
            <li>• 서버 비용 40% 절감</li>
          </ul>
        </div>
      </div>
    </div>,

    // Slide 9 - Team
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-600 to-blue-600 p-16">
      <h2 className="text-5xl font-bold mb-12 text-white text-center">팀원 소개</h2>
      <div className="grid grid-cols-5 gap-6 flex-1">
        {[
          { name: '진주영', role: 'Team Lead\nBackend Architecture', avatar: '👨‍💼' },
          { name: '정성원', role: 'AI/ML Engineer\nVoice Synthesis', avatar: '🧑‍🔬' },
          { name: '안준', role: 'Frontend Developer\nUI/UX Design', avatar: '👨‍💻' },
          { name: '김현수', role: 'Backend Developer\nAPI Development', avatar: '👨‍🔧' },
          { name: '장윤호', role: 'DevOps Engineer\nInfrastructure', avatar: '👷' }
        ].map((member, idx) => (
          <div key={idx} className="bg-white/90 backdrop-blur rounded-2xl p-8 flex flex-col items-center justify-center transform hover:scale-105 transition-transform">
            <div className="text-6xl mb-4">{member.avatar}</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{member.name}</h3>
            <p className="text-center text-gray-600 whitespace-pre-line">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  ];

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <div className="relative w-full h-full">
        {/* Slide Content */}
        <div className="w-full h-full">
          {slides[currentSlide]}
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-6 bg-black/50 backdrop-blur px-6 py-3 rounded-full">
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="text-white hover:text-gray-300 disabled:text-gray-600 transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="flex gap-2">
            {[...Array(totalSlides)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'w-8 bg-white'
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide(Math.min(totalSlides - 1, currentSlide + 1))}
            disabled={currentSlide === totalSlides - 1}
            className="text-white hover:text-gray-300 disabled:text-gray-600 transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        {/* Slide Number */}
        <div className="absolute top-8 right-8 text-white/70 text-xl">
          {currentSlide + 1} / {totalSlides}
        </div>

        {/* Keyboard Instructions */}
        <div className="absolute top-8 left-8 text-white/50 text-sm">
          ← → 키로 이동
        </div>
      </div>
    </div>
  );
};

export default PresentationPage;