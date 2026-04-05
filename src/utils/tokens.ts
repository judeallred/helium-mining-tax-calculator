import type { HeliumToken } from "../types";

export const HELIUM_MINTS: Record<HeliumToken, string> = {
  HNT: "hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux",
  IOT: "iotEVVZLEywoTn1QdwNPddxPWszn3zFhEot3MfL9fns",
  MOBILE: "mb1eu7TzEc71KxDpsmsKoucSSuuoGLv1drys1oP2jh6",
};

export const MINT_TO_TOKEN: Record<string, HeliumToken> = Object.fromEntries(
  Object.entries(HELIUM_MINTS).map(([token, mint]) => [mint, token as HeliumToken]),
) as Record<string, HeliumToken>;

export const TOKEN_DECIMALS: Record<HeliumToken, number> = {
  HNT: 8,
  IOT: 6,
  MOBILE: 6,
};

export const COINGECKO_IDS: Record<HeliumToken, string> = {
  HNT: "helium",
  IOT: "helium-iot",
  MOBILE: "helium-mobile",
};
