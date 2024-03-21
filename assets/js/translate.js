export function __(str) {
    return window.locale?.messages[str] || str;
}