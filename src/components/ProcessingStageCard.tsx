import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { CheckCircle, Clock, Play, AlertCircle } from 'lucide-react'

interface ProcessingStageCardProps {
  id: string
  title: string
  description: string
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'review'
  progress?: number
  estimatedTime?: string
  onAction?: () => void
  actionLabel?: string
}

export function ProcessingStageCard({
  id,
  title,
  description,
  status = 'pending',
  progress = 0,
  estimatedTime,
  onAction,
  actionLabel
}: ProcessingStageCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'running':
        return <Play className="h-5 w-5 text-blue-500" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'review':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">완료</Badge>
      case 'running':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">진행중</Badge>
      case 'failed':
        return <Badge variant="destructive">실패</Badge>
      case 'review':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">검토 필요</Badge>
      default:
        return <Badge variant="secondary">대기중</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
        
        {status === 'running' && (
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>진행률</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          {estimatedTime && (
            <span className="text-sm text-muted-foreground">예상 시간: {estimatedTime}</span>
          )}
          {onAction && actionLabel && (
            <Button variant="outline" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}