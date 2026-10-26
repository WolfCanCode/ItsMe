export default function StackVisual() {
  return (
    <div class="stack-visual" aria-hidden="true">
      <div class="stack-grid" />
      <span class="stack-coordinate coordinate-top">
        01 / CONNECTED BY DESIGN
      </span>
      <svg viewBox="0 0 540 340" fill="none">
        <defs>
          <linearGradient
            id="stack-face"
            x1="130"
            y1="70"
            x2="400"
            y2="250"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#d5f77d" />
            <stop offset="1" stop-color="#9cce3d" />
          </linearGradient>
        </defs>
        <g class="stack-layer layer-bottom" stroke="#627044" stroke-width="1.2">
          <path d="M270 147 441 241 270 335 99 241Z" />
          <path d="m99 241 171 65 171-65M270 306v29" />
          <path
            d="m142 217 171 94m-85-141 171 94M185 288l171-94m-85 141 171-94"
            opacity=".3"
          />
        </g>
        <g class="stack-layer layer-middle" stroke="#b5d578" stroke-width="1.2">
          <path d="m270 87 171 94-171 94-171-94Z" fill="#1b2015" />
          <path d="m99 181 171 65 171-65M270 246v29" />
          <path
            d="m142 157 171 94m-85-141 171 94M185 228l171-94m-85 141 171-94"
            opacity=".25"
          />
        </g>
        <g class="stack-layer layer-top">
          <path
            d="m270 27 171 94-171 94-171-94Z"
            fill="url(#stack-face)"
            stroke="#ddffa0"
          />
          <path
            d="m99 121 171 65 171-65-171 94Z"
            fill="#83a849"
            stroke="#b7dc77"
          />
          <path d="m270 186 171-65-171 94Z" fill="#698e34" />
          <path
            d="m217 115-29 16 29 16m106-32 29 16-29 16m-37-48-32 64"
            stroke="#253413"
            stroke-width="7"
            stroke-linecap="square"
          />
          <path
            d="m126 106 171 94m-85-141 171 94"
            stroke="#e2ffb2"
            opacity=".2"
          />
        </g>
        <g stroke="#92a66c" stroke-width="1" stroke-dasharray="3 5">
          <path d="M99 121H46v129h53M441 181h50V73h-82" />
          <path d="M270 27V8" />
        </g>
        <circle class="signal-dot" cx="46" cy="121" r="4" fill="#c5f277" />
        <circle cx="491" cy="181" r="4" fill="#c5f277" />
        <circle cx="270" cy="8" r="3" fill="#c5f277" />
      </svg>
      <span class="stack-label stack-frontend">Frontend</span>
      <span class="stack-label stack-backend">Backend</span>
      <span class="stack-label stack-devops">Infrastructure</span>
      <span class="stack-coordinate coordinate-bottom">
        MANY LAYERS. ONE VISION.
      </span>
    </div>
  );
}
