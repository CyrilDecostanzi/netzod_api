import multer from 'multer';
import fs from 'fs';
import path from 'path';

export const imageFileFilter = (
  req: any,
  file: { originalname: string },
  callback: (arg0: Error, arg1: boolean) => void,
) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

export const multerOptions = {
  storage: multer.diskStorage({
    destination: (
      req: any,
      file: any,
      cb: (arg0: null, arg1: string) => any,
    ) => {
      const post_id = req.params.post_id;
      const path = `./uploads/post_${post_id}`;
      fs.mkdirSync(path, { recursive: true });
      return cb(null, path);
    },
    filename: (req, file, cb) => {
      const post_id = req.params.post_id;
      const uniqueId = Date.now();
      const filename = `post_${post_id}_${uniqueId}${path.extname(
        file.originalname,
      )}`;
      cb(null, filename);
    },
  }),
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
};

export const avatarMulterOptions = {
  storage: multer.diskStorage({
    destination: (
      req: any,
      file: any,
      cb: (arg0: null, arg1: string) => any,
    ) => {
      const user_id = req.user.id;
      const path = `./uploads/user_${user_id}`;
      fs.mkdirSync(path, { recursive: true });
      return cb(null, path);
    },
    filename: (req: any, file: any, cb: any) => {
      const user_id = req.user?.id; // Add a question mark to handle the case when 'user' property is undefined
      const uniqueId = Date.now();
      const filename = `user_${user_id}_${uniqueId}${path.extname(
        file.originalname,
      )}`;
      cb(null, filename);
    },
  }),
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
};
