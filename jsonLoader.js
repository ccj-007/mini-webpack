export function jsonLoader (source) {
  console.log("jsonloader---------", source);

  console.log(this.addDeps('loaderContext'));
  return `export default ${JSON.stringify(source)}`
}