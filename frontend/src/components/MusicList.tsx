import React, { useState } from "react";
import { Track } from "../types";
import { FORM_FIELDS } from "./attributes";

interface Props {
  tracks: Track[];
  onEdit: (track: Track) => void;
}

const MusicList: React.FC<Props> = ({ tracks, onEdit }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!tracks?.length) return <p>No tracks available</p>;

  return (
    <div>
      <h2 className="text-2xl font-extrabold mb-6">Traditional Sound Library</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tracks.map(track => (
          <div key={track.sound_id} className="bg-white rounded-lg shadow-md border flex flex-col overflow-hidden">
            <div className="w-full h-32">
              <img src={track.album_file_url || "/placeholder.png"} alt={track.title || "Track"} className="w-full h-full object-cover" />
            </div>
            <div className="p-3 flex flex-col flex-1">
              <h3 className="font-bold truncate">{track.title}</h3>
              <p className="text-sm text-gray-500 truncate">{track.performer}</p>
              {track.sound_track_url ? (
                <audio controls className="w-full mt-2">
                  <source src={track.sound_track_url} type="audio/mpeg" />
                </audio>
              ) : <p className="text-xs text-gray-400 mt-2">No audio available</p>}

              <div className="mt-2 flex gap-2 flex-wrap text-xs">
                <span className="bg-gray-200 text-pink-600 px-2 py-0.5 rounded-full">{track.category}</span>
                <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{track.community}</span>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <button className="text-blue-600 text-sm font-medium" onClick={() => onEdit(track)}>Edit</button>
                <button className="text-indigo-600 text-sm font-medium underline" onClick={() => setExpanded(expanded === track.sound_id ? null : track.sound_id)}>
                  {expanded === track.sound_id ? "Hide Details" : "Show More"}
                </button>
              </div>

              {expanded === track.sound_id && (
                <div className="mt-2 text-xs text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {FORM_FIELDS.filter(f => f.type !== "file").map(f => (
                    <p key={f.name}><strong>{f.label}:</strong> {track[f.name as keyof Track] || "-"}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MusicList;
