const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const formatInline = (value) =>
  value
    .replace(/\[color=(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)\]([\s\S]*?)\[\/color\]/g, '<span style="color:$1">$2</span>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')

export const renderRichText = (value = '') => {
  const safe = escapeHtml(value)
  const lines = safe.split('\n')
  const fragments = []
  let listBuffer = []

  const flushList = () => {
    if (listBuffer.length) {
      fragments.push(`<ul>${listBuffer.map((item) => `<li>${formatInline(item)}</li>`).join('')}</ul>`)
      listBuffer = []
    }
  }

  lines.forEach((line) => {
    const trimmed = line.trim()

    if (!trimmed) {
      flushList()
      return
    }

    if (trimmed.startsWith('- ')) {
      listBuffer.push(trimmed.slice(2))
      return
    }

    flushList()
    fragments.push(`<p>${formatInline(trimmed)}</p>`)
  })

  flushList()
  return fragments.join('') || '<p></p>'
}

export const insertRichTextToken = (value = '', token) => {
  if (token === 'bullet') {
    return value ? `${value}\n- ` : '- '
  }

  if (token === 'bold') {
    return `${value}**bold text**`
  }

  if (token === 'color') {
    return `${value}[color=#2563eb]colored text[/color]`
  }

  return value
}
