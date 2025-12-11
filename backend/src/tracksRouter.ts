import express, { Request, Response, Router } from "express";
import multer from "multer";
import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const singleUpload = upload.fields([{ name: "sound_track_url", maxCount: 1 }, { name: "album_file_url", maxCount: 1 }]);

async function uploadFileToSupabase(file: Express.Multer.File, bucket: string): Promise<string> {
  const ext = file.originalname.split(".").pop();
  const path = `${bucket}/${uuidv4()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file.buffer, { upsert: true, contentType: file.mimetype });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("tracks").select("*");
    if (error) throw new Error(error.message);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch tracks" });
  }
});

router.post("/", singleUpload, async (req: Request, res: Response) => {
  try {
    const { sound_id, title, performer, category, community, region, context, description } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let sound_track_url = files.sound_track_url?.[0] ? await uploadFileToSupabase(files.sound_track_url[0], "audio-tracks") : null;
    let album_file_url = files.album_file_url?.[0] ? await uploadFileToSupabase(files.album_file_url[0], "album-art") : null;
    const { data, error } = await supabase.from("tracks").insert([{ sound_id, title, performer, category, community, region, context, description, sound_track_url, album_file_url }]).select();
    if (error) throw new Error(error.message);
    res.status(201).json(data[0]);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to upload track: " + err.message });
  }
});

router.put("/:sound_id", singleUpload, async (req: Request, res: Response) => {
  try {
    const { sound_id } = req.params;
    const updateData = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files.sound_track_url?.[0]) updateData.sound_track_url = await uploadFileToSupabase(files.sound_track_url[0], "audio-tracks");
    if (files.album_file_url?.[0]) updateData.album_file_url = await uploadFileToSupabase(files.album_file_url[0], "album-art");
    const { data, error } = await supabase.from("tracks").update(updateData).eq("sound_id", sound_id).select();
    if (error) throw new Error(error.message);
    res.status(200).json(data[0]);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update track: " + err.message });
  }
});

router.post("/batch", upload.any(), async (req: Request, res: Response) => {
  try {
    if (!req.body.tracks) return res.status(400).json({ error: "No tracks data found" });
    const tracksJson: any[] = JSON.parse(req.body.tracks);
    const files = req.files as Express.Multer.File[];
    const insertedTracks: any[] = [];
    const failedRows: any[] = [];
    for (let i = 0; i < tracksJson.length; i++) {
      const row = tracksJson[i];
      if (!row.sound_id) { failedRows.push({ row: i, error: "Missing sound_id" }); continue; }
      const { data: existing } = await supabase.from("tracks").select("sound_id").eq("sound_id", row.sound_id).single();
      if (existing) continue;
      try {
        const soundFile = files.find(f => f.fieldname === `sound_track_${i}`);
        const albumFile = files.find(f => f.fieldname === `album_file_${i}`);
        let sound_track_url = soundFile ? await uploadFileToSupabase(soundFile, "audio-tracks") : null;
        let album_file_url = albumFile ? await uploadFileToSupabase(albumFile, "album-art") : null;
        const { data, error } = await supabase.from("tracks").insert([{ ...row, sound_track_url, album_file_url }]).select();
        if (error) failedRows.push({ row: i, error: error.message });
        else if (data?.length) insertedTracks.push(data[0]);
      } catch (err: any) {
        failedRows.push({ row: i, error: err.message });
      }
    }
    res.status(201).json({ inserted: insertedTracks.length, failedRows, tracks: insertedTracks });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
