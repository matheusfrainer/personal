let counter = 0

/**
 * Unique id for locally created messages.
 *
 * Must never be derived from an existing message id: forwarding the same
 * message twice to the same chat would otherwise collide and produce
 * duplicate React keys.
 */
export function nextId(prefix = "local") {
  counter += 1
  return `${prefix}-${counter}-${Math.random().toString(36).slice(2, 7)}`
}
