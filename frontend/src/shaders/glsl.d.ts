// Позволяет импортировать .glsl файлы как строки через ?raw
declare module "*.glsl?raw" {
  const src: string;
  export default src;
}
