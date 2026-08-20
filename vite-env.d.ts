/// <reference types="vite/client" />

declare module '*&as=picture' {
  const out: {
    sources: Record<string, string>
    img: { src: string; w: number; h: number }
  }
  export default out
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}
