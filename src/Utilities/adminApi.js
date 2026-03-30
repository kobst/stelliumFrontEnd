import { HTTP_POST, CONTENT_TYPE_HEADER, APPLICATION_JSON } from './constants';
import { getFirebaseIdToken } from '../firebase/adminAuth';

const getServerUrl = () => {
  return process.env.REACT_APP_SERVER_URL;
};

async function buildAuthHeaders(extraHeaders = {}) {
  const token = await getFirebaseIdToken();
  const headers = {
    [CONTENT_TYPE_HEADER]: APPLICATION_JSON,
    ...extraHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${getServerUrl()}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || `HTTP error! status: ${response.status}`);
  }
  return data;
}

export async function fetchUsers() {
  return apiFetch('/getUsers', {
    method: HTTP_POST,
    headers: await buildAuthHeaders(),
  });
}

export async function fetchUsersPaginated(options = {}) {
  const {
    usePagination = true,
    page = 1,
    limit = 20,
    search,
    sortBy = 'name',
    sortOrder = 'asc',
  } = options;

  const requestBody = { usePagination, page, limit, sortBy, sortOrder };
  if (search) requestBody.search = search;

  return apiFetch('/getUsers', {
    method: HTTP_POST,
    headers: await buildAuthHeaders(),
    body: JSON.stringify(requestBody),
  });
}

export async function fetchCelebrities() {
  return apiFetch('/getCelebs', {
    method: HTTP_POST,
    headers: await buildAuthHeaders(),
  });
}

export async function fetchCelebritiesPaginated(options = {}) {
  const {
    usePagination = true,
    page = 1,
    limit = 20,
    search,
    sortBy = 'name',
    sortOrder = 'asc',
  } = options;

  const requestBody = { usePagination, page, limit, sortBy, sortOrder };
  if (search) requestBody.search = search;

  return apiFetch('/getCelebs', {
    method: HTTP_POST,
    headers: await buildAuthHeaders(),
    body: JSON.stringify(requestBody),
  });
}

export async function getCelebrityRelationships(limit = 50) {
  const response = await apiFetch('/getCelebrityRelationships', {
    method: HTTP_POST,
    headers: await buildAuthHeaders(),
    body: JSON.stringify({ limit }),
  });
  return response.relationships || [];
}

export async function createRelationshipDirect(userIdA, userIdB, ownerUserId = null, celebRelationship = false) {
  const requestBody = { userIdA, userIdB };
  if (ownerUserId) requestBody.ownerUserId = ownerUserId;
  if (celebRelationship) requestBody.celebRelationship = true;

  return apiFetch('/enhanced-relationship-analysis', {
    method: HTTP_POST,
    headers: await buildAuthHeaders(),
    body: JSON.stringify(requestBody),
  });
}

export async function deleteSubject(subjectId, ownerUserId = null) {
  const requestOptions = {
    method: 'DELETE',
    headers: await buildAuthHeaders(),
  };

  if (ownerUserId) {
    requestOptions.body = JSON.stringify({ ownerUserId });
  }

  return apiFetch(`/subjects/${subjectId}`, requestOptions);
}

export async function fetchWeeklyHoroscopePreview(date = null) {
  const query = date ? `?date=${date}` : '';
  return apiFetch(`/admin/horoscopes/weekly/preview${query}`, {
    method: 'GET',
    headers: await buildAuthHeaders(),
  });
}

export async function fetchAdminWeeklySunSign(sign, date = null) {
  const query = date ? `?date=${date}` : '';
  return apiFetch(`/admin/horoscopes/weekly/${sign}${query}`, {
    method: 'GET',
    headers: await buildAuthHeaders(),
  });
}

export async function deleteRelationship(compositeChartId, ownerUserId = null) {
  const requestOptions = {
    method: 'DELETE',
    headers: await buildAuthHeaders(),
  };

  if (ownerUserId) {
    requestOptions.body = JSON.stringify({ ownerUserId });
  }

  return apiFetch(`/relationships/${compositeChartId}`, requestOptions);
}
