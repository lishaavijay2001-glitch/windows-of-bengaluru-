// Visitor counts via Umami (cloud.umami.is): no cookies, no personal data, nothing from the camera.
// The tracker script is in index.html and only reports from the live site (data-domains),
// so testing on your own computer doesn't count. If it's blocked or offline, nothing breaks.
export function track(name, data) {
  try { if (window.umami && window.umami.track) window.umami.track(name, data); } catch { /* ignore */ }
}
