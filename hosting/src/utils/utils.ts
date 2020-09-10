export const getURLParam = (() => {
  const params = new URL(window.location.href).searchParams
  return (key: string) => {
    const result = params.getAll(key)
    if (result.length === 0) return null
    if (result.length === 1) return result[0]
    return result
  }
})()
