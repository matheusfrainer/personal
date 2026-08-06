import Link from "next/link"

import { Button } from "@/components/ui/button"

/**
 * Deterministic QR-ish matrix. Not a scannable code — a faithful stand-in for
 * WhatsApp Web's pairing screen, drawn without any external library.
 */
function QrCode({ size = 25 }: { size?: number }) {
  const cells: boolean[] = []
  for (let i = 0; i < size * size; i++) {
    const x = i % size
    const y = Math.floor(i / size)
    // Reproducible pseudo-noise.
    const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
    cells.push(v - Math.floor(v) > 0.5)
  }

  const isFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7)

  return (
    <div
      className="grid gap-px rounded-md bg-white p-3"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      aria-label="QR code de conexão"
      role="img"
    >
      {cells.map((on, i) => {
        const x = i % size
        const y = Math.floor(i / size)
        if (isFinder(x, y)) {
          // Draw the three positioning squares properly.
          const lx = x < 7 ? x : x - (size - 7)
          const ly = y < 7 ? y : y - (size - 7)
          const ring =
            lx === 0 || lx === 6 || ly === 0 || ly === 6
              ? true
              : lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4
          return (
            <span
              key={i}
              className={ring ? "bg-neutral-900" : "bg-white"}
              style={{ aspectRatio: "1" }}
            />
          )
        }
        return (
          <span
            key={i}
            className={on ? "bg-neutral-900" : "bg-white"}
            style={{ aspectRatio: "1" }}
          />
        )
      })}
    </div>
  )
}

export default function ConnectPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <div className="grid w-full max-w-3xl gap-8 rounded-lg border border-border bg-background p-8 shadow-sm md:grid-cols-2 md:items-center">
        <div>
          <h1 className="font-heading text-2xl font-light tracking-tight">
            Use o WhatsApp no seu computador
          </h1>
          <ol className="mt-6 flex list-decimal flex-col gap-3 pl-5 text-sm text-muted-foreground">
            <li>Abra o WhatsApp no seu celular</li>
            <li>
              Toque em <strong className="text-foreground">Mais opções</strong> no
              Android ou em{" "}
              <strong className="text-foreground">Configurações</strong> no iPhone
            </li>
            <li>
              Toque em{" "}
              <strong className="text-foreground">Aparelhos conectados</strong> e
              depois em <strong className="text-foreground">Conectar aparelho</strong>
            </li>
            <li>Aponte a câmera para esta tela para capturar o código</li>
          </ol>

          <Button asChild className="mt-8">
            <Link href="/">Entrar no WhatsApp Web</Link>
          </Button>
        </div>

        <div className="flex justify-center">
          <QrCode />
        </div>
      </div>
    </div>
  )
}
