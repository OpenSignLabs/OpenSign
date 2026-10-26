import axios from "axios";

export function updateTourStatus(tourStatus = [], key, value = true) {
  const updatedStatus = [...tourStatus];
  const statusIndex = updatedStatus.findIndex((status) =>
    Object.prototype.hasOwnProperty.call(status, key)
  );

  if (statusIndex === -1) {
    updatedStatus.push({ [key]: value });
  } else {
    updatedStatus[statusIndex] = {
      ...updatedStatus[statusIndex],
      [key]: value
    };
  }

  return updatedStatus;
}

export async function saveTourStatus({
  tourStatus,
  key,
  value = true,
  serverUrl,
  appId,
  sessionToken,
  userId,
  className = "contracts_Users",
  put = axios.put
}) {
  const updatedTourStatus = updateTourStatus(tourStatus, key, value);

  await put(
    `${serverUrl}classes/${className}/${userId}`,
    { TourStatus: updatedTourStatus },
    {
      headers: {
        "X-Parse-Application-Id": appId,
        "X-Parse-Session-Token": sessionToken
      }
    }
  );

  return updatedTourStatus;
}

export async function closeTour({
  onClose,
  shouldPersist,
  tourStatus,
  key,
  ...saveOptions
}) {
  onClose();

  if (!shouldPersist) return tourStatus;

  return saveTourStatus({ ...saveOptions, tourStatus, key });
}

export function isTourDismissed(tourStatus = [], key) {
  return tourStatus.some((status) => status[key] === true);
}
