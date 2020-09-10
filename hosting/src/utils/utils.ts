export const getUrlParam = (() => {
  const params = new URL(window.location.href).searchParams
  return (key: string) => {
    const result = params.get(key)
    if (result == null) return null
    return window.decodeURIComponent(result)
  }
})()
