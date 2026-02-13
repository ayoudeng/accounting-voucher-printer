declare module 'gbk.js' {
  interface GBKStatic {
    encode(str: string): number[]
    decode(byteArray: number[]): string
    URI: {
      encodeURI(str: string): string
      decodeURI(str: string): string
      encodeURIComponent(str: string): string
      decodeURIComponent(str: string): string
    }
  }
  
  const GBK: GBKStatic
  export default GBK
}
