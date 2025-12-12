import React, { useState, useEffect } from "react";
import axios from "axios";
import MusicForm from "../components/MusicForm";
import MusicList from "../components/MusicList";
import MusicFusion from "../components/MusicFusion";
import { Track } from "../types";

const HomePage: React.FC = () => {
  const [activeView, setActiveView] = useState<"home" | "upload" | "fuse music" | "library">("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTracks = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Track[]>("http://localhost:3001/api/tracks");
      setTracks(res.data || []);
    } catch {
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const filteredTracks = tracks.filter((t) =>
    ["sound_id", "title", "category", "community", "region", "context", "performer", "description"]
      .some((k) => t[k as keyof Track]?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const menuItems = [
    { name: "Home", key: "home", icon: "dashbard.png" },
    { name: "Fuse Music", key: "fuse music", icon: "fuse.png" },
    { name: "Upload", key: "upload", icon: "upload.jpg" },
    { name: "Library", key: "library", icon: "lib.png" },
  ];

  const handleSetActiveView = (view: typeof activeView) => {
    setActiveView(view);
    if (view === "home" || view === "library") setSearchTerm("");
  };

  const renderContent = () => {
    if (loading) return <p>Loading tracks...</p>;
    switch (activeView) {
      case "upload":
        return (
          <MusicForm
            editingTrack={editingTrack}
            onTrackAdded={() => { fetchTracks(); handleSetActiveView("home"); }}
            onTrackUpdated={() => { fetchTracks(); setEditingTrack(null); handleSetActiveView("home"); }}
            onCancelEdit={() => {
                setEditingTrack(null);
                setActiveView("home");   // 👈 go back to home
            }}
          />
        );
      case "fuse music":
        return <MusicFusion tracks={filteredTracks} />;
      default:
        return <MusicList tracks={filteredTracks} onEdit={(t) => { setEditingTrack(t); handleSetActiveView("upload"); }} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <div className={`relative flex-shrink-0 h-screen bg-white border-r p-4 shadow-xl transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"}`}>
        <div className="flex items-center mb-6 relative justify-center">
          {isSidebarOpen && <img src="Wits_MIND.jpg" alt="Logo" className="w-36 h-auto object-contain" />}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute top-0 right-0 w-6 h-6 flex flex-col justify-between">
            <span className="w-full h-0.5 bg-gray-600"></span>
            <span className="w-full h-0.5 bg-gray-600"></span>
            <span className="w-full h-0.5 bg-gray-600"></span>
          </button>
        </div>
        {menuItems.map((item) => (
          <div key={item.name} onClick={() => handleSetActiveView(item.key as any)} className={`flex items-center p-2 rounded-lg cursor-pointer mb-2 ${activeView === item.key ? "bg-pink-100 text-pink-600 font-semibold" : "text-gray-600 hover:bg-gray-100"}`}>
            <div className={`flex-shrink-0 flex justify-center items-center transition-all duration-300 ${isSidebarOpen ? "w-8 h-8" : "w-6 h-6"}`}>
              <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
            </div>
            <span className={`ml-3 transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}>{item.name}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex justify-between items-center bg-white p-3 shadow-lg border m-4 rounded-lg">
          <span className="text-xl font-bold text-gray-800">AI and African Music</span>
          <div className="relative flex items-center w-full max-w-xl ml-4">
            <input type="text" placeholder="Search sounds..." className="w-full p-2 border border-gray-300 rounded-l-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button className="bg-pink-600 text-white p-2.5 rounded-r-lg">Search</button>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-pink-600 text-white text-sm px-4 py-2 rounded-full hidden sm:block">Go Premium</button>
            <button className="bg-pink-500 text-white text-sm px-4 py-2 rounded-full">Log Out</button>
          </div>
        </div>
        <div className="p-4 lg:p-6">{renderContent()}</div>
      </div>
    </div>
  );
};

export default HomePage;
