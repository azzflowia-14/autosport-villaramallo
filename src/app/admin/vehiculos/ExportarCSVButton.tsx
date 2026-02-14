'use client'

export function ExportarCSVButton() {
  return (
    <a
      href="/api/vehiculos/exportar"
      className="border border-zinc-600 text-zinc-300 px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-center text-sm lg:text-base"
    >
      Exportar CSV
    </a>
  )
}
