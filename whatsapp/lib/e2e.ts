/**
 * Test-mode switch.
 *
 * The app simulates the other side of every conversation with timers and a
 * random reply. That is the right default for a demo, but it makes end-to-end
 * assertions non-deterministic. Loading the app with `?e2e=1` disables the
 * simulation so tests observe only what the user did.
 */
export function isSimulationDisabled() {
  if (typeof window === "undefined") return false
  return new URLSearchParams(window.location.search).get("e2e") === "1"
}
