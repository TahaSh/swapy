export function mapsAreEqual(map1: Map<any, any>, map2: Map<any, any>) {
  if (map1.size !== map2.size) {
    return false
  }

  for (let [key, value] of map1) {
    if (!map2.has(key) || map2.get(key) !== value) {
      return false
    }
  }
  return true
}

let id = 0
export function getUniqueId() {
  return id++ + ''
}
