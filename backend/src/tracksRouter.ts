import express, { Request, Response, Router } from "express";
import multer from "multer";
import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const singleUpload = upload.fields([
  { name: "sound_track_url", maxCount: 1 },
  { name: "album_file_url", maxCount: 1 }
]);

async function uploadFileToSupabase(file: Express.Multer.File, bucket: string): Promise<string> {
  const ext = file.originalname.split(".").pop();
  const path = `${bucket}/${uuidv4()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file.buffer, { upsert: true, contentType: file.mimetype });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

router.post("/", singleUpload, async (req: Request, res: Response) => {
  try {
    const { sound_id, title, performer, category, community, region, context, description } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Check if track already exists
    const { data: existingTrack } = await supabase.from("tracks").select("sound_id").eq("sound_id", sound_id).single();
    if (existingTrack) return res.status(400).json({ message: `Track ID "${sound_id}" already exists.` });

    // Upload files in parallel
    const [sound_track_url, album_file_url] = await Promise.all([
      files.sound_track_url?.[0] ? uploadFileToSupabase(files.sound_track_url[0], "audio-tracks") : null,
      files.album_file_url?.[0] ? uploadFileToSupabase(files.album_file_url[0], "album-art") : null
    ]);

    const { data, error } = await supabase.from("tracks").insert([{
      sound_id, title, performer, category, community, region, context, description, sound_track_url, album_file_url
    }]).select();

    if (error) throw new Error(error.message);
    res.status(201).json({ message: "Track uploaded successfully.", track: data[0] });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to upload track: " + err.message });
  }
});

export default router;
