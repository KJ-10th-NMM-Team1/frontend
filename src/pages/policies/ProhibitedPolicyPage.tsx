export default function ProhibitedPolicyPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.08em] text-muted">dupilot 정책</p>
        <h1 className="text-2xl font-bold text-foreground">금지 콘텐츠 및 사용 정책</h1>
        <p className="text-sm text-muted">
          안전한 음성 합성을 위해 허용되지 않는 행위와 콘텐츠 종류를 안내합니다. 테스트 목적의 서비스이지만, 아래
          항목은 실제 서비스와 동일하게 적용된다고 가정합니다.
        </p>
      </header>

      <section className="space-y-3 rounded-2xl bg-surface-1 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">1. 불법·사기 행위</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-foreground">
          <li>위조, 사칭, 피싱, 신분 도용, 음성 변조를 통한 허위 사실 유포</li>
          <li>지적재산권, 초상권, 퍼블리시티권을 침해하는 모든 사용</li>
          <li>악성 코드·스팸·자동화된 공격 시도</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl bg-surface-1 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">2. 유해·폭력·차별 콘텐츠</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-foreground">
          <li>혐오 표현, 차별 조장, 괴롭힘, 협박, 자해·자살 조장</li>
          <li>폭력적, 선정적, 아동·청소년 유해물에 해당하는 음성 생성</li>
          <li>허위 정보 생성 및 배포로 사회적 혼란을 일으키는 행위</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl bg-surface-1 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">3. 무단 수집 및 남용</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-foreground">
          <li>타인의 음성 데이터를 동의 없이 업로드하거나 수집하는 행위</li>
          <li>자동화 수단을 통한 과도한 호출, 리버스 엔지니어링, 모델 추출</li>
          <li>서비스를 재판매하거나 별도 API로 래핑해 배포하는 행위</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl bg-surface-1 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">4. 준수 및 제재</h2>
        <p className="text-sm leading-6 text-foreground">
          위 항목이 감지되면 계정 제한, 데이터 삭제, 접근 차단 등 적절한 조치를 취할 수 있습니다. 본 문서는 참고용이며
          실제 사업 운용 시 추가적인 심사와 신고 절차가 적용될 수 있습니다.
        </p>
      </section>

      <p className="text-xs text-muted">
        마지막 업데이트: 2025.11.29 본 정책은 데모용 안내문이며 법적 효력을 갖지 않습니다.
      </p>
    </div>
  )
}
