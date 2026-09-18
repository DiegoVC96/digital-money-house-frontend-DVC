import { api } from "./api";

function authorizedOptions(token, options = {}) {
  return {
    ...options,
    headers: {
      Authorization: token,
      ...options.headers,
    },
  };
}

export function getAccount(token) {
  return api("/api/account", authorizedOptions(token));
}

export function getUser(token, userId) {
  return api(`/api/users/${userId}`, authorizedOptions(token));
}

export function updateUser(token, userId, userData) {
  return api(
    `/api/users/${userId}`,
    authorizedOptions(token, {
      method: "PATCH",
      body: JSON.stringify(userData),
    })
  );
}

export function updateAlias(token, accountId, alias) {
  return api(
    `/api/accounts/${accountId}`,
    authorizedOptions(token, {
      method: "PATCH",
      body: JSON.stringify({ alias }),
    })
  );
}

export function getAccountActivity(token, accountId) {
  return api(
    `/api/accounts/${accountId}/activity`,
    authorizedOptions(token)
  );
}

export function getCards(token, accountId) {
  return api(
    `/api/accounts/${accountId}/cards`,
    authorizedOptions(token)
  );
}

export function createCard(token, accountId, cardData) {
  return api(
    `/api/accounts/${accountId}/cards`,
    authorizedOptions(token, {
      method: "POST",
      body: JSON.stringify(cardData),
    })
  );
}

export function deleteCard(token, accountId, cardId) {
  return api(
    `/api/accounts/${accountId}/cards/${cardId}`,
    authorizedOptions(token, {
      method: "DELETE",
    })
  );
}

export function createDeposit(token, accountId, depositData) {
  return api(
    `/api/accounts/${accountId}/deposits`,
    authorizedOptions(token, {
      method: "POST",
      body: JSON.stringify(depositData),
    })
  );
}