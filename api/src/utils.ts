import dns from "dns";
import fetch from "node-fetch";

export const removeExtraSpaces = (str: string) =>
  str.replace(/\s+/g, " ").trim();

export const postData = async (
  url: string,
  data: any,
  addHeaders?: any,
  errorMessages = false
) => {
  const headers =
    addHeaders !== null
      ? {
          "Content-Type": "application/json",
          ...addHeaders,
        }
      : {};
  const res = await fetch(url, {
    method: "post",
    headers: headers,
    body: JSON.stringify(data || {}),
  });
  if (!res.ok) {
    const e: any = await res.json();
    const error = new Error(errorMessages ? e.error.message : e.message);
    throw error;
  }
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1)
    return await res.json();
  return;
};

export const deleteData = async (url: string, addHeaders?: any) => {
  const headers = {
    "Content-Type": "application/json",
    ...addHeaders,
  };
  const res = await fetch(url, {
    method: "delete",
    headers: headers,
  });
  if (!res.ok) {
    const e: any = await res.json();
    const error = new Error(e.message);
    throw error;
  }
  return;
};

export const fetcher = async (
  url: string,
  addHeaders?: any,
  errorMessages = false
) => {
  const headers = {
    "Content-Type": "application/json",
    ...addHeaders,
  };
  const res = await fetch(url, {
    method: "get",
    headers,
  });
  if (!res.ok) {
    const e: any = await res.json();
    const error = new Error(errorMessages ? e.error.message : e.message);
    throw error;
  }
  return await res.json();
};

export const logTime = (date = new Date()) => {
  const year = date.getUTCFullYear();
  const month = `0${date.getUTCMonth() + 1}`.slice(-2);
  const day = `0${date.getUTCDate()}`.slice(-2);

  const hours = `0${date.getUTCHours()}`.slice(-2);
  const min = `0${date.getUTCMinutes()}`.slice(-2);
  const sec = `0${date.getUTCSeconds()}`.slice(-2);

  const ms = `00${date.getUTCMilliseconds()}`.slice(-3);

  return `[${year}-${month}-${day} ${hours}:${min}:${sec}.${ms}]`;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const now = () => {
  return Math.floor(Date.now() / 1000);
};

export const canResolve = (domain: string) =>
  new Promise((resolve) => {
    dns.lookup(
      domain,
      {
        family: 4,
      },
      (err: any, address: any, family: any) => {
        if (err && err.code === "ENOTFOUND") resolve(false);
        else resolve(true);
      }
    );
  });
