import { SignupForm } from '../../features/auth/components/SignupForm'
import { Card, CardDescription, CardHeader, CardTitle } from '../../shared/ui/Card'

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center gap-8 px-6 py-16">
      <div className="max-w-md text-center">
        <h1 className="text-foreground text-3xl font-semibold">회원가입</h1>
      </div>
      <Card className="border-surface-4 bg-surface-1 w-full max-w-2xl border p-8 shadow-soft">
        <CardHeader>
          <CardTitle>새 계정 만들기</CardTitle>
          <CardDescription>가입 후 이메일 인증 단계로 이동합니다.</CardDescription>
        </CardHeader>
        <SignupForm />
      </Card>
    </div>
  )
}
