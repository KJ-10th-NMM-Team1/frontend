import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { TrendingUp, MessageSquare } from 'lucide-react'

interface IssueStats {
  term: number
  length: number
}

interface IssueListProps {
  issueStats: IssueStats
}

export const IussueCard = ({ issueStats }: IssueListProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">자동 감지 이슈</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="text-sm">용어 불일치</span>
          </div>
          <Badge variant="secondary">{issueStats.term}</Badge>
        </div>
        <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <span className="text-sm">길이 초과</span>
          </div>
          <Badge variant="secondary">{issueStats.length}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
