// app/api/messages/upload.js
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import { IncomingMessage } from 'http';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Enable formidable for parsing form data
export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadHandler = async (req: IncomingMessage, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: string; url?: string; }): void | PromiseLike<void>; new(): any; }; }; }) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing the file.' });
    }

    try {
      if (!files.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }
      const file = files.file[0]; // Assuming you're uploading a single file
      const result = await cloudinary.uploader.upload(file.filepath);

      // Here you can store the file URL in your database as needed
      return res.status(200).json({ url: result.secure_url });
    } catch (uploadError) {
      return res.status(500).json({ error: 'Error uploading to Cloudinary.' });
    }
  });
};

export default uploadHandler;
