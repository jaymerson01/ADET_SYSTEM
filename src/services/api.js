const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export async function login(email, password) {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.detail || 'Login failed');
  }
  const data = await response.json();
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
  }
  return data;
}

export async function signup(name, email, course, password) {
  const response = await fetch('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, course, password }),
  });
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.detail || 'Signup failed');
  }
  const data = await response.json();
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
  }
  return data;
}

export async function startInterviewSession(file, role) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('selectedRole', role);

  const response = await fetch('/api/session/start', {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.detail || 'Unable to start interview session');
  }

  return response.json();
}

export async function sendChatMessage(sessionId, message) {
  const cleanSessionId = parseInt(sessionId, 10);
  if (isNaN(cleanSessionId)) {
    throw new Error('Invalid or missing Session ID. Please restart the session.');
  }

  const response = await fetch('/api/interview/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ session_id: cleanSessionId, message }),
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.detail || 'Failed to send message');
  }

  return response.json();
}

export async function evaluateSession(sessionId) {
  const cleanSessionId = parseInt(sessionId, 10);
  if (isNaN(cleanSessionId)) {
    throw new Error('Invalid or missing Session ID. Please restart the session.');
  }

  const response = await fetch(`/api/interview/${cleanSessionId}/evaluate`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.detail || 'Failed to evaluate session');
  }

  return response.json();
}

export async function getSessionHistory(sessionId) {
  const cleanSessionId = parseInt(sessionId, 10);
  if (isNaN(cleanSessionId)) {
    throw new Error('Invalid or missing Session ID.');
  }

  const response = await fetch(`/api/interview/${cleanSessionId}/history`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.detail || 'Failed to fetch session history');
  }

  return response.json();
}

export async function getSessionEvaluation(sessionId) {
  const cleanSessionId = parseInt(sessionId, 10);
  if (isNaN(cleanSessionId)) {
    throw new Error('Invalid or missing Session ID.');
  }

  const response = await fetch(`/api/interview/${cleanSessionId}/evaluation`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.detail || 'Failed to fetch evaluation report');
  }

  return response.json();
}

export async function getHistoryList() {
  const response = await fetch('/api/history/list', {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.detail || 'Failed to fetch history list');
  }

  return response.json();
}

export async function getHistoryReport(sessionId) {
  const cleanSessionId = parseInt(sessionId, 10);
  if (isNaN(cleanSessionId)) {
    throw new Error('Invalid or missing Session ID.');
  }

  const response = await fetch(`/api/history/report/${cleanSessionId}`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.detail || 'Failed to fetch history report');
  }

  return response.json();
}

