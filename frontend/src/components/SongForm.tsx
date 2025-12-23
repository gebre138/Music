/** @jsxImportSource @emotion/react */
/** @jsxRuntime automatic */
import React, { useState, useEffect, useCallback } from "react";
import { Song } from "../types/song";
import { css } from "@emotion/react";

type SongWithoutId = Omit<Song, "_id">;
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

interface SongFormProps {
  songToEdit?: Song;
  onUpdate?: (updatedSong: Song) => void;
  onSave?: (newSong: SongWithoutId) => void;
  onClose?: () => void;
}

const fields: (keyof SongWithoutId)[] = ["Title", "Artist", "Album", "Genre"];
const initialSongState: SongWithoutId = { Title: "", Artist: "", Album: "", Genre: "" };

const inputBase = (error: string) => css({
  width: "100%", padding: "0.75rem", borderRadius: "0.5rem", fontSize: "1rem", transition: "all 0.2s", outline: "none",
  border: error ? "1px solid #ef4444" : "1px solid #d1d5db",
  boxShadow: error ? "0 0 0 3px rgba(248,113,113,0.3)" : "none",
  "&:focus": { boxShadow: `0 0 0 3px ${error ? "rgba(248,113,113,0.3)" : "rgba(59,130,246,0.3)"}`, borderColor: error ? "#ef4444" : "#3b82f6" },
});

const buttonStyles = (bgColor: string, hoverColor: string, textColor: string) => css({
  flex: 1, padding: "0.75rem", borderRadius: "0.5rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
  border: "none", outline: "none", backgroundColor: bgColor, color: textColor, "&:hover": { backgroundColor: hoverColor },
});

const submitButton = buttonStyles("#2563eb", "#1d4ed8", "#fff");
const cancelButton = buttonStyles("#d1d5db", "#9ca3af", "#374151");

const formContainer = css({
    backgroundColor: "#fff", padding: "1.5rem", borderRadius: "1rem", boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
    maxWidth: "32rem", margin: "0 auto", display: "flex", flexDirection: "column", gap: "0.75rem",
});

const SongForm: React.FC<SongFormProps> = ({ songToEdit, onUpdate, onSave, onClose }) => {
  const [song, setSong] = useState<SongWithoutId>(initialSongState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (songToEdit) setSong({ ...songToEdit });
  }, [songToEdit]);

  const validateField = useCallback((name: keyof SongWithoutId, value: string) => {
    let error = "";
    if (!value.trim()) error = `${name} is required`;
    else if ((name === "Title" || name === "Artist") && /[^a-zA-Z0-9\s]/.test(value))
      error = `${name} can only contain letters, numbers, and spaces`;
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof SongWithoutId;
    setSong(prev => ({ ...prev, [fieldName]: value }));
    validateField(fieldName, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fields.every(f => validateField(f, song[f]))) {
        songToEdit ? onUpdate?.({ ...songToEdit, ...song }) : onSave?.(song);
        setSong(initialSongState);
        onClose?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} css={formContainer}>
      <h2 css={{ 
        fontSize: "1.25rem", fontWeight: 700, color: "#1f2937", borderBottom: "1px solid #e5e7eb", paddingBottom: "0.5rem", marginBottom: "1rem" 
      }}>
        {songToEdit ? "Edit Song" : "Add New Song"}
      </h2>
      {fields.map(f => (
        <div key={f}>
          <input
            type="text" name={f} placeholder={f} value={song[f]} onChange={handleChange}
            css={inputBase(errors[f] || "")}
          />
          {errors[f] && <p css={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.25rem" }}>{errors[f]}</p>}
        </div>
      ))}
      <div css={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button type="submit" css={submitButton}>{songToEdit ? "Update Song" : "Add Song"}</button>
        {onClose && <button type="button" onClick={onClose} css={cancelButton}>Cancel</button>}
      </div>
    </form>
  );
};
export default SongForm;