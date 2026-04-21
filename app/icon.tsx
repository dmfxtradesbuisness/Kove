import { ImageResponse } from 'next/og'

export const size        = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1E6EFF',
          borderRadius: 7,
        }}
      >
        {/* Geometric K mark — matches KoveLogo SVG polygons */}
        <svg
          width="20"
          height="22"
          viewBox="0 0 70 80"
          fill="none"
        >
          <polygon points="7,72 21,72 27,8 13,8"    fill="white" />
          <polygon points="37,46 51,46 57,8 43,8"   fill="white" />
          <polygon points="37,74 51,74 57,50 43,50" fill="white" />
        </svg>
      </div>
    ),
    { ...size },
  )
}
