"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const supabase_1 = require("./supabase");
const uuid_1 = require("uuid");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const singleUpload = upload.fields([
    { name: "sound_track_url", maxCount: 1 },
    { name: "album_file_url", maxCount: 1 }
]);
function uploadFileToSupabase(file, bucket) {
    return __awaiter(this, void 0, void 0, function* () {
        const ext = file.originalname.split(".").pop();
        const path = `${bucket}/${(0, uuid_1.v4)()}.${ext}`;
        const { error } = yield supabase_1.supabase.storage.from(bucket).upload(path, file.buffer, { upsert: true, contentType: file.mimetype });
        if (error)
            throw new Error(error.message);
        const { data } = supabase_1.supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    });
}
router.post("/", singleUpload, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { sound_id, title, performer, category, community, region, context, description } = req.body;
        const files = req.files;
        // Check if track already exists
        const { data: existingTrack } = yield supabase_1.supabase.from("tracks").select("sound_id").eq("sound_id", sound_id).single();
        if (existingTrack)
            return res.status(400).json({ message: `Track ID "${sound_id}" already exists.` });
        // Upload files in parallel
        const [sound_track_url, album_file_url] = yield Promise.all([
            ((_a = files.sound_track_url) === null || _a === void 0 ? void 0 : _a[0]) ? uploadFileToSupabase(files.sound_track_url[0], "audio-tracks") : null,
            ((_b = files.album_file_url) === null || _b === void 0 ? void 0 : _b[0]) ? uploadFileToSupabase(files.album_file_url[0], "album-art") : null
        ]);
        const { data, error } = yield supabase_1.supabase.from("tracks").insert([{
                sound_id, title, performer, category, community, region, context, description, sound_track_url, album_file_url
            }]).select();
        if (error)
            throw new Error(error.message);
        res.status(201).json({ message: "Track uploaded successfully.", track: data[0] });
    }
    catch (err) {
        res.status(500).json({ message: "Failed to upload track: " + err.message });
    }
}));
exports.default = router;
