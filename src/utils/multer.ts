import multer from 'fastify-multer';
import { FastifyRequest, FastifyReply } from 'fastify';
import multerS3 from 'multer-s3';
import fs from 'fs';
import path from 'path';
import config from '../config';
const { PATH_TO_UPLOADS } = config;
import aws from 'aws-sdk';
export interface File {
  fieldname: string; // 'media',
  originalname: string; // 'sample2-thumb.jpeg',
  encoding: string; // '7bit',
  mimetype: string; // 'image/jpeg',
  destination: string; // 'uploads',
  filename: string; // '1613044232755-sample2-thumb.jpeg',
  path: string; // 'uploads/1613044232755-sample2-thumb.jpeg',
  size: number; // 9729
}

const MAX_FILES_COUNT = 100;

const s3 = new aws.S3({
  secretAccessKey: process.env.AMAZONS3_PRIVATE_KEY,
  accessKeyId: process.env.AMAZONS3_ACCESS_KEY,
});

// const storageS3 = multerS3({
//   s3: s3,
//   bucket: process.env.AMAZONS3_BUCKET_NAME,
//   destination: function (req: any, file: any, cb: any) {
//     const uploadPath = path.resolve(__dirname, PATH_TO_UPLOADS);
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   metadata: function (req: any, file: any, cb: any) {
//     console.log(file);
//     cb(null, { filename: file.originalname });
//   },
//   key: function (req: any, file: any, cb: any) {
//     // console.log(req)
//     // console.log(req.key);
//     const fileName = Date.now() + '-' + file.originalname;
//     cb(null, fileName);
//   },
//   filename: function (req: any, file: any, cb: any) {
//     // console.log(req)
//     // console.log(req.key);
//     const fileName = Date.now() + '-' + file.originalname;
//     cb(null, fileName);
//   }
// } as any)


const storage = multer.diskStorage(
  {
    destination: function (req, file, cb) {
      const uploadPath = path.resolve(__dirname, PATH_TO_UPLOADS);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const fileName = Date.now() + '-' + file.originalname;
      cb(null, fileName);
    }
  }

)

export const upload = multer({
  //storage: process.env.NODE_ENV === 'development' ? storage : storageS3
  storage
} as any);


export const filesUpload = (fieldName: string) => ([
  upload.array(
    fieldName,
    MAX_FILES_COUNT
  ),
  (request: FastifyRequest, reply: FastifyReply, done: any) => {
    let files = (request as any).files as unknown as File[];

    (request as any).files = files.map((fileObj: any) => {
      if (process.env.NODE_ENV !== 'development' && fileObj.key) {
        return { ...fileObj, filename: fileObj.key }
      } else {
        return { ...fileObj }
      }
    }) as any
    done()
  }
]);

export const filesMultipleUpload = (...args: string[]) => {
  console.log('args', args)

  return ([
    upload.fields(
      args.map(item => ({
        name: item,
        maxCount: MAX_FILES_COUNT,
      }))),
    (request: FastifyRequest, reply: FastifyReply, done: any) => {

      let files = (request as any).files as unknown as { [string: string]: File[] };
      for (const key in files) {
        (request as any).files[key] = files[key].map((fileObj: any) => {
          if (process.env.NODE_ENV !== 'development' && fileObj.key) {
            return { ...fileObj, filename: fileObj.key }
          } else {
            return { ...fileObj }
          }
        });
      }
      done()
    }
  ]);
}

