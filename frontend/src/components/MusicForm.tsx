import React, { useState, useEffect } from "react";
import axios from "axios";
import { Track } from "../types";
import { FORM_FIELDS } from "./attributes";
import * as XLSX from "xlsx";

interface MusicFormProps {
  onTrackAdded?: () => void;
  onTrackUpdated?: () => void;
  onCancelEdit?: () => void;
  editingTrack?: Track | null;
}

const REQUIRED_COLUMNS = [
  "sound_id",
  "title",
  "performer",
  "category",
  "community",
  "region",
  "context",
];

// Ensure the API_URL comes from environment
const API_URL = process.env.REACT_APP_API_URL as string;

const MusicForm: React.FC<MusicFormProps> = ({
  onTrackAdded,
  onTrackUpdated,
  onCancelEdit,
  editingTrack,
}) => {
  const initialState = FORM_FIELDS.reduce(
    (acc, f) => ({ ...acc, [f.name]: f.type === "file" ? null : "" }),
    {} as Record<string, any>
  );

  const [formData, setFormData] = useState<Record<string, any>>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState<"success" | "error">("success");
  const [excelData, setExcelData] = useState<any[]>([]);
  const [rowFiles, setRowFiles] = useState<{ [key: string]: File }>({});
  const [excelMode, setExcelMode] = useState(false);

  useEffect(() => {
    if (editingTrack) {
      const newData: Record<string, any> = {};
      FORM_FIELDS.forEach(
        (f) =>
          (newData[f.name] =
            f.type === "file" ? null : editingTrack[f.name as keyof Track] || "")
      );
      setFormData(newData);
    }
  }, [editingTrack]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData({ ...formData, [e.target.name]: file });
  };

  const showPopup = (msg: string, type: "success" | "error" = "success") => {
    setPopupMessage(msg);
    setPopupType(type);
    setTimeout(() => setPopupMessage(""), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const apiFormData = new FormData();
    FORM_FIELDS.forEach((f) =>
      f.type === "file"
        ? formData[f.name] && apiFormData.append(f.name, formData[f.name])
        : apiFormData.append(f.name, formData[f.name] || "")
    );

    try {
      setIsLoading(true);

      if (editingTrack) {
        await axios.put(
          `${API_URL}/api/tracks/${editingTrack.sound_id}`,
          apiFormData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        showPopup("Track updated successfully.");
        onTrackUpdated?.();
      } else {
        await axios.post(`${API_URL}/api/tracks`, apiFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showPopup("Track uploaded successfully.");
        onTrackAdded?.();
      }

      setFormData(initialState);
    } catch (err: any) {
      const backendMsg = err.response?.data?.error || "";
      if (backendMsg.includes("already exists"))
        showPopup(`Track ID "${formData.sound_id}" already exists.`, "error");
      else showPopup(`Upload failed: ${backendMsg}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------- Excel Upload Handlers -----------------

  const validateExcelData = (data: any[], rowFiles: any) => {
    const invalid: any[] = [];

    data.forEach((row, i) => {
      const missingFields = REQUIRED_COLUMNS.filter(
        (col) => !row[col]?.toString().trim()
      );
      const missingFiles = ["sound_track_url", "album_file_url"].filter(
        (f) => !rowFiles[`${i}-${f}`]
      );

      if (missingFields.length || missingFiles.length) {
        invalid.push({ row: i, missingFields, missingFiles });
      }
    });

    return invalid;
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });

      const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
        defval: "",
      });

      setExcelData(
        json.map((row: any) => ({
          ...row,
          description: row.description || "",
        }))
      );

      showPopup(`${json.length} rows loaded. Attach audio/image files.`);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleRowFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number,
    field: string
  ) => {
    const file = e.target.files?.[0];
    if (file) setRowFiles((prev) => ({ ...prev, [`${i}-${field}`]: file }));
  };

  const handleSubmitExcel = async () => {
    if (!excelData.length)
      return showPopup("No Excel data to upload.", "error");

    const invalidRows = validateExcelData(excelData, rowFiles);
    if (invalidRows.length)
      return showPopup(`${invalidRows.length} invalid rows.`, "error");

    setIsLoading(true);

    const batchForm = new FormData();
    batchForm.append("tracks", JSON.stringify(excelData));

    excelData.forEach((row, i) => {
      rowFiles[`${i}-sound_track_url`] &&
        batchForm.append(`sound_track_${i}`, rowFiles[`${i}-sound_track_url`]);
      rowFiles[`${i}-album_file_url`] &&
        batchForm.append(`album_file_${i}`, rowFiles[`${i}-album_file_url`]);
    });

    try {
      const res = await axios.post(`${API_URL}/api/tracks/batch`, batchForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showPopup(`${res.data.inserted} tracks uploaded.`);
      setExcelData([]);
      setRowFiles({});
      setExcelMode(false);
    } catch (err: any) {
      showPopup(`Excel upload failed.`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------------

  return (
    <div className="w-full relative">
      {/* Popup */}
      {popupMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className={`px-6 py-3 rounded shadow text-white text-sm font-semibold ${
              popupType === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {popupMessage}
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40">
          <div className="bg-white p-5 rounded shadow">
            <p className="font-semibold text-gray-700">Submitting...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="w-full bg-pink-600 text-white p-4 rounded-t-lg flex justify-between">
        <h1 className="text-lg font-bold">
          {editingTrack
            ? "Edit Sound"
            : excelMode
            ? "Upload via Excel"
            : "Upload Traditional Sound"}
        </h1>

        <button
          className="bg-white text-pink-600 px-3 py-1 rounded text-sm font-semibold shadow-sm hover:bg-pink-100 transition"
          onClick={() => setExcelMode(!excelMode)}
        >
          {excelMode ? "Back to Form" : "Upload Excel"}
        </button>
      </div>

      <div className="w-full bg-white p-5 rounded-b-lg shadow-md">
        {/* ------------------ Excel Mode ------------------ */}
        {excelMode ? (
          <>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              className="mb-3"
            />

            {excelData.length ? (
              <div className="overflow-x-auto max-h-[350px]">
                <table className="border w-full text-xs">
                  <thead>
                    <tr>
                      {Object.keys(excelData[0]).map((k) => (
                        <th key={k} className="border p-1 bg-gray-200">
                          {k}
                        </th>
                      ))}
                      <th className="border p-1 bg-gray-200">Audio*</th>
                      <th className="border p-1 bg-gray-200">Album*</th>
                    </tr>
                  </thead>

                  <tbody>
                    {excelData.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="border p-1">
                            {String(v)}
                          </td>
                        ))}

                        <td className="border p-1">
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) =>
                              handleRowFileChange(e, i, "sound_track_url")
                            }
                          />
                        </td>

                        <td className="border p-1">
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) =>
                              handleRowFileChange(e, i, "album_file_url")
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button
                  onClick={handleSubmitExcel}
                  className="mt-4 bg-pink-600 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow hover:bg-pink-700 active:bg-pink-800 transition"
                >
                  Submit All
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Upload Excel to continue.</p>
            )}
          </>
        ) : (
          /* ------------------ FORM MODE ------------------ */
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FORM_FIELDS.map((f) =>
                f.type === "file" ? (
                  <div key={f.name} className="space-y-1">
                    <label className="text-xs font-semibold">{f.label}</label>
                    <input
                      type="file"
                      name={f.name}
                      onChange={handleFileChange}
                      required={!editingTrack}
                      className="w-full text-xs p-1 border rounded"
                    />
                  </div>
                ) : (
                  <div key={f.name} className="space-y-1">
                    <label className="text-xs font-semibold">{f.label}</label>

                    {f.type === "textarea" ? (
                      <textarea
                        name={f.name}
                        rows={2}
                        value={formData[f.name] || ""}
                        onChange={handleChange}
                        className="w-full p-1.5 border rounded text-sm"
                      />
                    ) : (
                      <input
                        name={f.name}
                        value={formData[f.name] || ""}
                        onChange={handleChange}
                        required={f.name !== "description"}
                        disabled={f.name === "sound_id" && !!editingTrack}
                        className="w-full p-1.5 border rounded text-sm"
                      />
                    )}
                  </div>
                )
              )}
            </div>

            {/* Buttons */}
            {editingTrack ? (
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-pink-600 text-white py-3 rounded-lg text-sm font-semibold shadow hover:bg-pink-700 active:bg-pink-800 disabled:opacity-50 transition"
                >
                  Update Track
                </button>

                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg text-sm font-semibold shadow hover:bg-gray-400 active:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-pink-600 text-white py-3 rounded-lg text-sm font-semibold shadow hover:bg-pink-700 active:bg-pink-800 disabled:opacity-50 transition"
              >
                Submit Sound
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default MusicForm;
