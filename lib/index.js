/**
 * dsh-rail-zero — host half.
 *
 * Presentation-only plugin: all work happens in the browser half (./client.js).
 * The host half exists because a bundle row must resolve to a mountable Cordis
 * plugin; it claims no services and registers nothing.
 */

/** Cordis plugin name (the loader overwrites this with the module id). */
export const name = "dsh-rail-zero";

/** No host services are consumed. */
export const inject = [];

/** No required configuration. */
export const Config = undefined;

/** Host half body: nothing to set up. */
export function apply() {}
