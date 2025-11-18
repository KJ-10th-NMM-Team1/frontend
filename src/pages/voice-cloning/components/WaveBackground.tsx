export function WaveBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Left Side Organic Wave Blob */}
      <div className="absolute -left-1/4 top-1/3 h-[600px] w-[800px] -translate-y-1/2">
        <div className="animate-wave-organic relative h-full w-full">
          <div
            className="absolute inset-0 bg-gradient-to-br from-purple-400/40 via-pink-300/30 to-purple-500/40"
            style={{
              filter: 'blur(60px)',
              borderRadius: '40% 60% 70% 30% / 60% 30% 70% 40%',
            }}
          />
        </div>
      </div>

      <div className="animation-delay-2000 absolute -left-1/4 top-1/2 h-[500px] w-[700px] -translate-y-1/2">
        <div className="animate-wave-organic-slow relative h-full w-full">
          <div
            className="absolute inset-0 bg-gradient-to-br from-pink-400/30 via-purple-300/25 to-pink-500/30"
            style={{
              filter: 'blur(50px)',
              borderRadius: '30% 70% 60% 40% / 50% 60% 40% 50%',
            }}
          />
        </div>
      </div>

      {/* Right Side Organic Wave Blob */}
      <div className="animation-delay-1000 absolute -right-1/4 top-2/3 h-[600px] w-[800px] -translate-y-1/2">
        <div className="animate-wave-organic-reverse relative h-full w-full">
          <div
            className="absolute inset-0 bg-gradient-to-bl from-purple-500/40 via-pink-400/30 to-purple-400/40"
            style={{
              filter: 'blur(60px)',
              borderRadius: '60% 40% 30% 70% / 40% 70% 30% 60%',
            }}
          />
        </div>
      </div>

      <div className="animation-delay-3000 absolute -right-1/4 bottom-1/3 h-[500px] w-[700px]">
        <div className="animate-wave-organic-slow relative h-full w-full">
          <div
            className="absolute inset-0 bg-gradient-to-bl from-pink-500/30 via-purple-400/25 to-pink-400/30"
            style={{
              filter: 'blur(50px)',
              borderRadius: '70% 30% 40% 60% / 30% 50% 50% 70%',
            }}
          />
        </div>
      </div>

      {/* Center Soft Glow */}
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2">
        <div className="animate-pulse-glow relative h-full w-full">
          <div
            className="absolute inset-0 bg-gradient-radial from-purple-300/20 via-pink-200/15 to-transparent"
            style={{
              filter: 'blur(70px)',
              borderRadius: '50%',
            }}
          />
        </div>
      </div>
    </div>
  )
}
