import React, { useState } from "react";
import { Track } from "../types";

interface Props {
  tracks: Track[];
}

const MusicFusion: React.FC<Props> = ({ tracks }) => {
  const [music1, setMusic1] = useState<Track | null>(null);
  const [music2, setMusic2] = useState<Track | null>(null);

  const fuseTracks = () => {
    if (!music1 || !music2) return;
    alert(
      `Fusing "${music1.sound_id} - ${music1.title}" + "${music2.sound_id} - ${music2.title}"`
    );
  };

  const getTrackLabel = (track: Track) =>
    `${track.sound_id} - ${track.title} - ${track.performer}`;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Music Fusion</h2>

      {/* Track Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Music 1 */}
        <div>
          <label className="block mb-2 font-semibold">Select Music 1</label>
          <select
            className="w-full border p-2 rounded"
            value={music1?.sound_id || ""}
            onChange={(e) => {
              const track = tracks.find((t) => t.sound_id === e.target.value);
              setMusic1(track || null);
              // Avoid duplicate selection
              if (music2?.sound_id === e.target.value) setMusic2(null);
            }}
          >
            <option value="">-- Choose Track --</option>
            {tracks.map((t) => (
              <option key={t.sound_id} value={t.sound_id}>
                {getTrackLabel(t)}
              </option>
            ))}
          </select>
        </div>

        {/* Music 2 */}
        <div>
          <label className="block mb-2 font-semibold">Select Music 2</label>
          <select
            className="w-full border p-2 rounded"
            value={music2?.sound_id || ""}
            onChange={(e) =>
              setMusic2(
                tracks.find((t) => t.sound_id === e.target.value) || null
              )
            }
          >
            <option value="">-- Choose Track --</option>
            {tracks
              .filter((t) => t.sound_id !== music1?.sound_id)
              .map((t) => (
                <option key={t.sound_id} value={t.sound_id}>
                  {getTrackLabel(t)}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Selected Tracks Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[music1, music2].map(
          (music, idx) =>
            music && (
              <div key={idx} className="p-3 border rounded shadow-sm">
                <h4 className="font-bold mb-2">
                  {music.sound_id} - {music.title}
                </h4>
                {music.sound_track_url && (
                  <audio controls className="w-full">
                    <source src={music.sound_track_url} type="audio/mpeg" />
                  </audio>
                )}
              </div>
            )
        )}
      </div>

      {/* Fuse Button */}
      {music1 && music2 && (
        <div className="flex justify-center">
          <button
            onClick={fuseTracks}
            className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 active:bg-pink-800 transition"
          >
            Fuse Music
          </button>
        </div>
      )}
    </div>
  );
};

export default MusicFusion;
