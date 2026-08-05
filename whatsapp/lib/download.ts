/**
 * Client-side downloads. There is no server, so anything the user "downloads"
 * is generated here — but the file that lands on disk is a real one.
 */

function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a")
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/** Downloads an existing data: URI (used for the generated images). */
export function downloadDataUri(url: string, filename: string) {
  triggerDownload(url, filename)
}

export function downloadBlob(content: string, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  triggerDownload(url, filename)
  // Revoke on the next tick so the click has already been handled.
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

/**
 * The xref offsets below are byte offsets, but the payload is measured with
 * String#length (UTF-16 code units), and downloadBlob encodes as UTF-8. Any
 * non-ASCII byte would desync the two and produce a file readers reject —
 * and Type1/Helvetica cannot render those glyphs anyway. Folding to ASCII
 * fixes both at once, which matters in a Portuguese app.
 */
function escapePdfText(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/([\\()])/g, "\\$1")
}

/**
 * Builds a minimal but structurally valid single-page PDF, with a real xref
 * table whose offsets are computed from the assembled body — a PDF without a
 * correct `startxref` is rejected by most readers.
 */
export function buildPdf(title: string, lines: string[]) {
  const objects = [
    "<</Type/Catalog/Pages 2 0 R>>",
    "<</Type/Pages/Kids[3 0 R]/Count 1>>",
    "<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 5 0 R>>>>/Contents 4 0 R>>",
    null, // content stream, built below
    "<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>",
  ]

  const text = [title, "", ...lines]
    .map(
      (line, i) =>
        `BT /F1 ${i === 0 ? 16 : 11} Tf 60 ${780 - i * 22} Td (${escapePdfText(line)}) Tj ET`
    )
    .join("\n")
  objects[3] = `<</Length ${text.length}>>\nstream\n${text}\nendstream`

  let pdf = "%PDF-1.4\n"
  const offsets: number[] = []
  objects.forEach((body, i) => {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`
  })

  const xrefStart = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets) {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`
  }
  pdf += `trailer\n<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF`

  return pdf
}
