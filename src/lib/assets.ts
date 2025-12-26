
// 默认封面的 SVG (深蓝紫色渐变 + 抽象声波)
// 尺寸: 512x512
const COVER_SVG = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg_grad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="50%" stop-color="#4c1d95" />
      <stop offset="100%" stop-color="#be185d" />
    </linearGradient>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
    </filter>
  </defs>
  
  <!-- 背景 -->
  <rect width="512" height="512" fill="url(#bg_grad)" />
  
  <!-- 装饰性光晕 -->
  <circle cx="400" cy="100" r="150" fill="#fb7185" fill-opacity="0.2" filter="url(#blur)" />
  <circle cx="100" cy="400" r="120" fill="#60a5fa" fill-opacity="0.2" filter="url(#blur)" />

  <!-- 中央图形：抽象声波/书籍 -->
  <g transform="translate(156, 156)" opacity="0.9">
    <!-- 外圈 -->
    <circle cx="100" cy="100" r="80" stroke="white" stroke-width="8" stroke-opacity="0.3" />
    <!-- 中圈 (断开的) -->
    <path d="M100 40 A 60 60 0 0 1 160 100" stroke="white" stroke-width="8" stroke-opacity="0.5" stroke-linecap="round" />
    <path d="M40 100 A 60 60 0 0 1 100 160" stroke="white" stroke-width="8" stroke-opacity="0.5" stroke-linecap="round" />
    <!-- 核心圆点 -->
    <circle cx="100" cy="100" r="25" fill="white" />
    <circle cx="100" cy="100" r="45" stroke="white" stroke-width="4" stroke-opacity="0.8" />
  </g>
</svg>
`.trim();

// 辅助函数：将 SVG 转换为 Data URI
function svgToDataUri(svgString: string): string {
  // 简单的转义处理
  const encoded = encodeURIComponent(svgString)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export const DEFAULT_COVER = svgToDataUri(COVER_SVG);
