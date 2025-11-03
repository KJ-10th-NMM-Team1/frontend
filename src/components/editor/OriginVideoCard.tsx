import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { MonitorPlay } from 'lucide-react'

export const OriginVideoCard = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MonitorPlay className="w-4 h-4 text-blue-500" />
          원본 영상
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
          <video
            className="w-full h-full object-cover"
            controls
            // poster="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1280&q=60"
            // poster={thumbnail}
          >
            <source
              src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
              // src={source}
              type="video/mp4"
            />
            브라우저가 video 태그를 지원하지 않습니다.
          </video>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>00:01:12 / 05:23</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[11px]">
              1080p
            </Badge>
            <Badge variant="outline" className="text-[11px]">
              자막 ON
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            현재 구간 반복
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            전체 화면
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
