import path from 'path';
import fs from 'fs';
import util from 'util';
import { pipeline } from 'stream';
import config from '../config';
const { PATH_TO_UPLOADS } = config;

const pump = util.promisify(pipeline);

export const randomInt = (min: number, max: number) => {
  const rand = min + Math.random() * (max - min + 1);
  return Math.round(rand);
}
export const genRandomPassword = (len: number) => {
  let password = '';
  const nums = '0123456789'
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const specialChars = '!@#$%^&*';
  const symbols = nums + alphabet + specialChars;

  password += alphabet.charAt(Math.floor(Math.random() * alphabet.length)); // start always from character
  for (let i = 0; i < len - 1; i++) {
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  }
  return password;
}

export const uploadFiles = async (media: Array<any>) => {
  if (media?.length) {
    for await (const file of media) {
      if (file.filename && file.mimetype !== 'text/plain') { // if file exists
        const fileName = path.join(__dirname, '..', '..', '..', PATH_TO_UPLOADS) + new Date().getTime() + '-' + file.filename;
        await pump(file.file, fs.createWriteStream(fileName));
      }
    }
  }
}