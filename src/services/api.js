export async function startInterviewSession(file, role) {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('role', role);

  const response = await fetch('/api/interview/start', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Unable to start interview session');
  }

  return response.json();
}
