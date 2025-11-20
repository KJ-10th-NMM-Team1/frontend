export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.08em] text-muted">dupilot 정책</p>
        <h1 className="text-2xl font-bold text-foreground">개인정보 처리방침</h1>
        <p className="text-sm text-muted">
          본 서비스는 연구·테스트 목적의 시연 환경이며, 최소한의 정보만 취급합니다. 실제 상업 서비스 수준의
          가이드라인을 참고용으로 제공합니다.
        </p>
      </header>

      <section className="space-y-3 rounded-2xl bg-surface-1 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">1. 수집 항목</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-foreground">
          <li>계정 식별을 위한 이메일/닉네임 등 기본 프로필 정보</li>
          <li>업로드한 음성 파일, 생성된 오디오 샘플 및 관련 메타데이터</li>
          <li>서비스 품질 개선을 위한 로그(접속 기록, 오류 로그 등)</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl bg-surface-1 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">2. 이용 목적</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-foreground">
          <li>음성 합성 및 클로닝 기능 제공, 사용자 계정 관리</li>
          <li>모델 품질 개선, 서비스 안정성 확보, 보안 모니터링</li>
          <li>법적 의무 이행 또는 이용자 요청 대응</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl bg-surface-1 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">3. 보관 및 삭제</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-foreground">
          <li>데모 데이터는 테스트 종료 시점에 맞춰 주기적으로 정리될 수 있습니다.</li>
          <li>이용자가 삭제를 요청하면 관련 기록을 가능한 범위에서 신속히 파기합니다.</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl bg-surface-1 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">4. 제3자 제공 및 처리 위탁</h2>
        <p className="text-sm leading-6 text-foreground">
          현재 상업적 제휴나 광고 목적의 제3자 제공은 없습니다. 스토리지·모니터링과 같은 인프라 서비스에 처리가
          위탁될 수 있으며, 이 경우에도 테스트 목적에 한정됩니다.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl bg-surface-1 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">5. 문의</h2>
        <p className="text-sm leading-6 text-foreground">
          개인정보 관련 문의나 삭제 요청은 운영 담당자에게 연락해 주세요. 본 문서는 참고용이며 법적 효력은 없습니다.
        </p>
      </section>

      <p className="text-xs text-muted">마지막 업데이트: 2025.11.29 데모 환경 기준 안내입니다.</p>
    </div>
  )
}
