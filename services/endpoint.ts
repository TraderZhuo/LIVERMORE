export const normalizeApiEndpoint = (apiEndpoint: string) => {
  const completionPath = '/chat/completions';
  let targetEndpoint = apiEndpoint.trim().replace(/^POST\s+/i, '').replace(/\/$/, '');

  if (!targetEndpoint) {
    return `https://ark.cn-beijing.volces.com/api/v3${completionPath}`;
  }

  if (!/^https?:\/\//i.test(targetEndpoint) && /^[\w.-]+\.[a-z]{2,}(?::\d+)?(?:\/|$)/i.test(targetEndpoint)) {
    targetEndpoint = `https://${targetEndpoint}`;
  }

  if (targetEndpoint.endsWith('/bots/chat/completions')) {
    return targetEndpoint.replace(/\/bots\/chat\/completions$/, completionPath);
  }

  if (targetEndpoint.endsWith('/chat/completions')) {
    return targetEndpoint;
  }

  if (targetEndpoint.endsWith('/api/v3') || targetEndpoint.endsWith('/api/v1')) {
    return `${targetEndpoint}${completionPath}`;
  }

  if (targetEndpoint.endsWith('/api')) {
    return `${targetEndpoint}/v3${completionPath}`;
  }

  if (targetEndpoint.endsWith('/v3') || targetEndpoint.endsWith('/v1')) {
    return `${targetEndpoint}${completionPath}`;
  }

  try {
    const url = new URL(targetEndpoint);
    if (url.pathname === '' || url.pathname === '/') {
      return `${url.origin}/api/v3${completionPath}`;
    }
  } catch (error) {
    // Let fetch surface malformed URLs at request time.
  }

  return `${targetEndpoint}/api/v3${completionPath}`;
};
