import { Link } from 'react-router-dom'

import { Button } from '../shared/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-foreground text-4xl font-semibold">페이지를 찾을 수 없습니다.</h1>
      <p className="text-muted max-w-md text-sm">
        요청하신 화면이 존재하지 않거나 권한이 없습니다. 홈으로 돌아가 필요한 작업을 이어가세요.
      </p>
      <Button asChild>
        <Link to="/">홈으로 이동</Link>
      </Button>
    </div>
  )
}
