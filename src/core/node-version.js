export function isSupportedNodeVersion(version) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/u.exec(version);
  if (!match) {
    return false;
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);

  return (major === 22 && minor >= 12) || major === 24;
}

export function assertSupportedNodeVersion(version) {
  if (!isSupportedNodeVersion(version)) {
    throw new Error(
      `Landing Kit требует Node.js 22.12+ или Node.js 24. Текущая версия: ${version}.`,
    );
  }
}
