import { LoginForm } from '../../features/auth/components/LoginForm'
import { Card, CardDescription, CardHeader, CardTitle } from '../../shared/ui/Card'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center gap-8 px-6 py-16">
      <div className="max-w-md text-center">
        <h1 className="text-foreground text-3xl font-semibold">로그인</h1>
      </div>
      <Card className="border-surface-4 bg-surface-1 w-full max-w-lg border p-8 shadow-soft">
        <CardHeader>
          <CardTitle>로그인</CardTitle>
          <CardDescription>이메일과 비밀번호를 입력해 주세요.</CardDescription>
        </CardHeader>
        <LoginForm />
      </Card>
    </div>
  )
}
