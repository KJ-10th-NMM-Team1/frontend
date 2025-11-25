import { useState } from 'react'

import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'
import { Modal, ModalField, ModalSection } from '@/shared/ui/Modal'

export default function ModalExamplePage() {
  const [open, setOpen] = useState(false)
  const [projectName, setProjectName] = useState('영상 더빙 에피소드')
  const [owner, setOwner] = useState('Evelyn')

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Modal Template 예제</h1>
        <p className="text-sm text-muted">
          `/src/shared/ui/Modal.tsx`에 정의된 템플릿을 사용하는 페이지입니다. 라우트/전역 상태와
          쉽게 동기화할 수 있도록 `open`, `onOpenChange`, `onClose` 인터페이스를 제공합니다.
        </p>
      </header>
      <section className="space-y-4 rounded-3xl border border-dashed border-surface-4 bg-surface-1 p-6">
        <p className="text-sm text-muted">
          아래 버튼을 클릭하면 모달이 열립니다. 실제 서비스에서는 URL 쿼리나 Zustand 상태와 `open`
          값을 연결하면 라우트-모달 패턴을 구현할 수 있습니다.
        </p>
        <div className="flex gap-3">
          <div className="space-y-2">
            <Label htmlFor="example-project">에피소드 이름</Label>
            <Input
              id="example-project"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="example-owner">담당자</Label>
            <Input
              id="example-owner"
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
            />
          </div>
        </div>
        <Button onClick={() => setOpen(true)}>모달 열기</Button>
      </section>

      <Modal
        open={open}
        onOpenChange={(next, reason) => {
          if (!next && reason) {
            // window.alert(`모달이 ${reason} 사유로 닫혔습니다.`)
          }
          setOpen(next)
        }}
        title="에피소드 정보"
        description="기본 정보를 확인하고 액션을 실행할 수 있습니다."
        dismissibleBackdrop={false}
        footer={
          <Button
            onClick={() => {
              window.alert('Primary action이 실행되었습니다.')
            }}
          >
            확인
          </Button>
        }
      >
        <ModalSection className="space-y-3">
          <ModalField label="에피소드" value={projectName || '정보 없음'} />
          <ModalField label="담당자" value={owner || '정보 없음'} />
        </ModalSection>
        <ModalSection className="space-y-2">
          <p className="text-sm text-muted">
            이 섹션에는 설명이나 체크리스트 등 원하는 UI를 자유롭게 배치할 수 있습니다.
          </p>
        </ModalSection>
      </Modal>
    </div>
  )
}
