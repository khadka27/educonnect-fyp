// import type { NextApiRequest, NextApiResponse } from 'next';
// import formidable from 'formidable';
// import fs from 'fs';
// import path from 'path';
// import { v4 as uuidv4 } from 'uuid';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// const uploadDir = path.resolve(process.cwd(), 'public/uploads');

// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   const form = new formidable.IncomingForm();
//   form.uploadDir = uploadDir;
//   form.keepExtensions = true;

//   form.parse(req, (err, fields, files) => {
//     if (err) {
//       return res.status(500).json({ error: 'Error parsing the files' });
//     }

//     const file = files.file[0];
//     const randomFileName = `${uuidv4()}.${file.originalFilename?.split('.').pop()}`;
//     const new
