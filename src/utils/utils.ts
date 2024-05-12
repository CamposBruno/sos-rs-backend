import { Logger } from '@nestjs/common';

class ServerResponse<T> {
  readonly message: string;
  private readonly statusCode: number;
  private readonly respData?: T;

  constructor(statusCode: number, message: string, data?: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.respData = data;
  }

  public get data(): { statusCode: number; message: string; data?: T } {
    const resp = {
      statusCode: this.statusCode,
      message: this.message,
      data: this.respData,
    };
    if (!resp?.data) delete resp.data;
    return resp;
  }
}

function removeNotNumbers(input: string): string {
  return input.replace(/[^0-9]/g, '');
}

function capitalize(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .split(' ')
    .map((t) => t[0].toUpperCase() + t.slice(1))
    .join(' ');
}

function getSessionData(token?: string): { userId: string; sessionId: string } {
  try {
    if (token) {
      const splited = token.split('.');
      if (splited.length === 3) {
        const { userId, sessionId } = JSON.parse(
          Buffer.from(splited[1], 'base64').toString('utf-8'),
        );
        return { userId, sessionId };
      }
    }
  } catch (err) {
    Logger.error(`Error to get session data: ${err}`, getSessionData.name);
  }
  return { userId: '', sessionId: '' };
}

function deepMerge(target: Record<string, any>, source: Record<string, any>) {
  if (Array.isArray(target) && Array.isArray(source)) {
    return [...target, ...source];
  } else if (
    typeof target === 'object' &&
    target !== null &&
    typeof source === 'object' &&
    source !== null
  ) {
    const merged = { ...target };
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        merged[key] = target.hasOwnProperty(key)
          ? deepMerge(target[key], source[key])
          : source[key];
      }
    }
    return merged;
  } else {
    return source;
  }
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

function sortByProximity(
  locations: Partial<{
    longitude: number | null;
    latitude: number | null;
  }>[],
  currentLat: number,
  currentLon: number,
) {
  return locations
    .map((location) => {
      const distance = haversineDistance(
        currentLat,
        currentLon,
        location.latitude || 0,
        location.longitude || 0,
      );

      return { ...location, distance };
    })
    .sort((a, b) => a.distance - b.distance);
}

export {
  ServerResponse,
  removeNotNumbers,
  getSessionData,
  deepMerge,
  capitalize,
  sortByProximity,
};
