import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { GQL_SERVER_URL } from "lib/config";
import * as stream from "stream";
import { promisify } from "util";

const finished = promisify(stream.finished);

export async function downloadFile(
  fileUrl: string,
  outputLocationPath: string
): Promise<any> {
  const writer = fs.createWriteStream(outputLocationPath);
  return axios({
    method: "get",
    url: fileUrl,
    responseType: "stream",
  }).then(async (response) => {
    response.data.pipe(writer);
    return finished(writer);
  });
}

export async function uploadFile(
  bucketName: string,
  filePath: string,
  file: string,
  token: string
): Promise<string> {
  const form = new FormData();
  form.append("key", filePath);
  form.append("file", fs.createReadStream(file));

  const res = await axios.post(
    `${GQL_SERVER_URL}/storage/b/${bucketName}/upload`,
    form,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        ...form.getHeaders(),
      },
    }
  );

  return res.data.url;
}
