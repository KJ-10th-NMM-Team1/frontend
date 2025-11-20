import { Link } from 'react-router-dom'

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.08em] text-muted">dupilot 정책</p>
        <h1 className="text-2xl font-bold text-foreground">이용약관</h1>
        <p className="text-sm text-muted">
          당사는 실제 상업 서비스를 제공하지 않으나, 안전한 사용을 위해 참고용 약관을 제공합니다. 서비스 사용 시
          아래 내용을 확인해 주세요.
        </p>
      </header>

      <section className="space-y-3 rounded-2xl bg-surface-1 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">1. 계정 및 접근</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-foreground">
          <li>사용자는 자신의 계정 자격 증명을 안전하게 관리할 책임이 있습니다.</li>
          <li>타인의 권리나 개인정보를 침해하는 방식으로 계정을 사용해서는 안 됩니다.</li>
          <li>서비스 접근은 연구·개발 및 데모 목적이며, 상업적 사용이 아닌 경우에 한합니다.</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl bg-surface-1 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">2. 콘텐츠 사용 및 지적재산권</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-foreground">
          <li>사용자가 업로드하는 모든 자료는 본인 소유이거나 적법한 권리를 보유해야 합니다.</li>
          <li>생성된 음성 및 결과물은 데모 목적에 한하며, 상업적 배포 시 별도 동의가 필요합니다.</li>
          <li>타인의 초상권, 퍼블리시티권, 상표권, 저작권을 침해하는 용도로 사용할 수 없습니다.</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl bg-surface-1 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">3. 금지 행위</h2>
        <p className="text-sm leading-6 text-foreground">
          불법, 사기, 혐오, 폭력, 차별, 허위 정보 생성, 사칭 등을 포함한 모든 유해 사용이 금지됩니다. 자세한 내용은{' '}
          <Link to="/policies/prohibited-uses" className="text-primary underline underline-offset-4">
            금지 콘텐츠 및 사용 정책
          </Link>
          을 참고하세요.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl bg-surface-1 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">4. 데이터 및 개인정보</h2>
        <p className="text-sm leading-6 text-foreground">
          업로드된 파일과 생성 데이터는 품질 개선과 오류 수정 등의 연구 목적에 한해 활용될 수 있습니다. 자세한 사항은{' '}
          <Link to="/policies/privacy-policy" className="text-primary underline underline-offset-4">
            개인정보 처리방침
          </Link>
          을 참고하세요.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl bg-surface-1 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">5. 면책 및 서비스 제한</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-foreground">
          <li>서비스는 &quot;있는 그대로&quot; 제공되며, 영리 목적의 보증이나 책임을 지지 않습니다.</li>
          <li>약관 또는 정책을 위반할 경우 접근 제한이나 데이터 삭제가 이루어질 수 있습니다.</li>
          <li>테스트 환경 특성상 사전 고지 없이 기능이 변경되거나 중단될 수 있습니다.</li>
        </ul>
      </section>

      <p className="text-xs text-muted">
        마지막 업데이트: 2025.11.29 현재 문서는 시연 및 가이드용이며 법적 효력을 갖지 않습니다.
      </p>
    </div>
  )
}
