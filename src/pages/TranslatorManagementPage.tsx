import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { CreateTranslatorModal } from '@/features/translators/components/CreateTranslatorModal'
import { useCreateTranslatorModal } from '@/features/translators/hooks/useCreateTranslatorModal'
import {
  createTranslator,
  deleteTranslator,
  fetchTranslators,
  updateTranslator,
  type Translator,
} from '@/features/translators/services/translators'
import { useAuth } from '@/hooks/useAuth'

export default function TranslatorManagementPage() {
  const { user } = useAuth()
  const [translators, setTranslators] = useState<Translator[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingTarget, setEditingTarget] = useState<Translator | null>(null)
  const formatDate = (value?: string) => (value ? new Date(value).toISOString().slice(0, 10) : '-')
  const loadTranslators = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const list = await fetchTranslators()
      setTranslators(list)
    } catch (err) {
      console.error('번역가 조회 실패', err)
      setError('번역가 목록을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTranslators().catch(() => {})
  }, [loadTranslators])

  const createTranslatorModal = useCreateTranslatorModal({
    onSubmit: async (payload) => {
      try {
        await createTranslator(payload)
        await loadTranslators()
        toast.success('번역가가 등록되었습니다.')
      } catch (err) {
        console.error('번역가 등록 실패', err)
        toast.error('등록에 실패했습니다.')
        throw err
      }
    },
  })

  const editTranslatorModal = useCreateTranslatorModal({
    onSubmit: async (payload) => {
      if (!editingTarget) return
      try {
        await updateTranslator(editingTarget.id, payload)
        await loadTranslators()
        toast.success('번역가 정보를 수정했습니다.')
        setEditingTarget(null)
      } catch (err) {
        console.error('번역가 수정 실패', err)
        toast.error('수정에 실패했습니다.')
        throw err
      }
    },
  })

  const handleOpenCreateModal = () => {
    if (!user) {
      toast.error('로그인 후 이용 가능합니다.')
      return
    }
    createTranslatorModal.form.reset()
    createTranslatorModal.open()
  }

  const handleOpenEditModal = (translator: Translator) => {
    setEditingTarget(translator)
    editTranslatorModal.form.reset({
      name: translator.name ?? '',
      email: translator.email ?? '',
      languages: translator.languages?.join(', ') ?? '',
      status: translator.status ?? 'active',
    })
    editTranslatorModal.open()
  }

  const handleDelete = async (translator: Translator) => {
    const confirmed = window.confirm(
      `${translator.name} 번역가를 삭제하면 복구할 수 없습니다. 계속하시겠습니까?`
    )
    if (!confirmed) return

    try {
      await deleteTranslator(translator.id)
      await loadTranslators()
      toast.success('번역가를 삭제했습니다.')
    } catch (err) {
      console.error('번역가 삭제 실패', err)
      toast.error('삭제에 실패했습니다.')
    }
  }

  const tableContent = useMemo(() => {
    if (isLoading) {
      return <p className="text-sm text-gray-500">불러오는 중...</p>
    }
    if (error) {
      return <p className="text-sm text-red-500">{error}</p>
    }
    if (translators.length === 0) {
      return <p className="text-sm text-gray-500">등록된 번역가가 없습니다.</p>
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>언어</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>등록일</TableHead>
            <TableHead className="w-[160px] text-right">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {translators.map((translator) => (
            <TableRow key={translator.id}>
              <TableCell className="font-medium">{translator.name}</TableCell>
              <TableCell>{translator.email ?? '-'}</TableCell>
              <TableCell>
                {translator.languages?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {translator.languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={translator.status === 'inactive' ? 'outline' : 'secondary'}
                  className="text-xs"
                >
                  {translator.status === 'inactive' ? '비활성' : '활성'}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(translator.createdAt)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditModal(translator)}
                    title="수정하기"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(translator)}
                    title="삭제하기"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }, [error, handleDelete, isLoading, translators])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">번역가 관리</h2>
          <p className="text-sm text-gray-500">
            등록된 번역가를 확인하고 신규 등록, 수정, 삭제를 수행할 수 있습니다.
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />새 번역가 등록
        </Button>
      </header>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>번역가 목록</CardTitle>
        </CardHeader>
        <CardContent>{tableContent}</CardContent>
      </Card>

      <CreateTranslatorModal
        isOpen={createTranslatorModal.isOpen}
        onClose={createTranslatorModal.close}
        form={createTranslatorModal.form}
        onSubmit={createTranslatorModal.submit}
      />

      <CreateTranslatorModal
        isOpen={editTranslatorModal.isOpen}
        onClose={() => {
          setEditingTarget(null)
          editTranslatorModal.close()
        }}
        form={editTranslatorModal.form}
        onSubmit={editTranslatorModal.submit}
      />
    </div>
  )
}
