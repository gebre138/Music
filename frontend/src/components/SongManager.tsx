/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { fetchSongsRequest, deleteSongRequest, updateSongRequest, addSongRequest } from "../redux/songs/songsSlice";
import { Song } from "../types/song";
import SongForm from "./SongForm";
import { css } from "@emotion/react";

const mobile = `@media (max-width: 768px)`;
const tablet = `@media (max-width: 1024px)`;
const cardBase = css({ position: "relative", borderRadius: "1rem", padding: "1rem", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" });
const buttonBase = css({ padding: "0.6rem 1.4rem", borderRadius: "1rem", fontWeight: 500, cursor: "pointer", transition: "all 0.2s", border: "none", outline: "none", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" });
const primaryButton = css(buttonBase, { backgroundColor: "#2563eb", color: "#fff", "&:hover": { backgroundColor: "#1d4ed8" }, [mobile]: { width: '100%', padding: '0.8rem 1.4rem' } });
const secondaryButton = css(buttonBase, { backgroundColor: "#e5e7eb", color: "#000", "&:hover": { backgroundColor: "#d1d5db" }, [mobile]: { width: '100%', padding: '0.8rem 1.4rem' } });

const countByField = (songs: Song[], field: keyof Song) => songs.reduce((acc: Record<string, number>, s) => { acc[s[field] as string] = (acc[s[field] as string] || 0) + 1; return acc; }, {});

const countAlbumsByArtist = (songs: Song[]) => {
    const songsByArtist = songs.reduce((acc, s) => {
        acc[s.Artist] = acc[s.Artist] || [];
        acc[s.Artist].push(s.Album);
        return acc;
    }, {} as Record<string, string[]>);

    const albumCount: Record<string, number> = {};
    for (const artist in songsByArtist) {
        albumCount[artist] = new Set(songsByArtist[artist]).size;
    }
    return albumCount;
};


const BarChart: React.FC<{ data: Record<string, number>, color: string, maxItems?: number, labelSuffix?: string }> = ({ data, color, maxItems = 5, labelSuffix = '' }) => {
    const sortedData = useMemo(() => Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, maxItems), [data, maxItems]);
    if (sortedData.length === 0) return <div css={{ padding: '1rem', color: '#6b7280' }}>No data.</div>;
    const maxCount = sortedData[0]?.[1] || 1;
    return <div css={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
        {sortedData.map(([key, count]) => (
          <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} css={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span css={{ fontSize: '0.75rem', fontWeight: 600, minWidth: '4rem', flexShrink: 0, whiteSpace: 'normal', wordBreak: 'break-word', paddingRight: '0.5rem' }}>{key}</span>
            <div css={{ flex: 1, height: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.25rem', overflow: 'hidden' }}>
              <motion.div initial={{ width: '0%' }} animate={{ width: `${(count / maxCount) * 100}%` }} transition={{ duration: 0.5, delay: 0.1 }} css={{ height: '100%', backgroundColor: color, borderRadius: '0.25rem' }} />
            </div>
            <span css={{ fontSize: '0.75rem', fontWeight: 700, width: '1.5rem', flexShrink: 0, textAlign: 'right' }}>{count}{labelSuffix}</span>
          </motion.div>
        ))}
    </div>;
};

const DonutChart: React.FC<{ data: Record<string, number>, color: string, total: number }> = ({ data, color, total }) => {
    type ChartSlice = { key: string, count: number, start: number, end: number, color: string };
    
    const maxItems = 5; 
    const sortedData = useMemo(() => Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, maxItems), [data]);
    let currentAngle = 0;
    
    const colors = [color, '#6366f1', '#f97316', '#8b5cf6', '#06b6d4']; 
    
    const slices: ChartSlice[] = sortedData.map(([key, count], index) => {
        const angle = (count / total) * 360;
        const slice = { key, count, start: currentAngle, end: currentAngle + angle, color: colors[index % colors.length] };
        currentAngle += angle;
        return slice;
    });
    
    const remaining = total - sortedData.reduce((sum, [, count]) => sum + count, 0);
    if (remaining > 0) {
        slices.push({ key: 'Other', count: remaining, start: currentAngle, end: 360, color: '#d1d5db' });
    }
    
    const conics = slices.map(s => `${s.color} ${s.start}deg ${s.end}deg`).join(', ');
    const legendSlices = slices.filter(s => s.key !== 'Other');

    return <div css={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e5e7eb', [mobile]: { flexDirection: 'column' } }}>
        <div css={{ width: '5rem', height: '5rem', borderRadius: '50%', background: `conic-gradient(${conics})`, position: 'relative', boxShadow: '0 0 0 4px #e5e7eb inset', flexShrink: 0 }}>
            <div css={{ position: 'absolute', inset: '1.5rem', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: color }}>{total}</div>
        </div>
        <div css={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, [mobile]: { width: '100%' } }}>
            {legendSlices.map((s) => (
                <div key={s.key} css={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: 500 }}>
                    <span css={{ height: '0.5rem', width: '0.5rem', backgroundColor: s.color, borderRadius: '50%', marginRight: '0.5rem' }}></span>
                    <span css={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{s.key}</span>
                    <span css={{ fontWeight: 700, flexShrink: 0 }}>{s.count} songs</span>
                </div>
            ))}
            {remaining > 0 && (
                <div css={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: 500, marginTop: '0.25rem', borderTop: '1px solid #f3f4f6', paddingTop: '0.25rem' }}>
                    <span css={{ height: '0.5rem', width: '0.5rem', backgroundColor: '#d1d5db', borderRadius: '50%', marginRight: '0.5rem' }}></span>
                    <span css={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, color: '#6b7280' }}>Other Artists</span>
                    <span css={{ fontWeight: 700, flexShrink: 0, color: '#6b7280' }}>{remaining} songs</span>
                </div>
            )}
        </div>
    </div>;
};

const StackedBarChart: React.FC<{ data: Record<string, number>, color: string, maxItems?: number, total: number }> = ({ data, color, maxItems = 5, total }) => {
    const sortedData = useMemo(() => Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, maxItems), [data, maxItems]);
    if (sortedData.length === 0) return <div css={{ padding: '1rem', color: '#6b7280' }}>No data.</div>;
    let currentOffset = 0;
    const segments = sortedData.map(([key, count], index) => {
        const width = (count / total) * 100;
        const segment = { key, count, width, offset: currentOffset, color: index === 0 ? color : (index === 1 ? '#f97316' : '#8b5cf6') };
        currentOffset += width;
        return segment;
    });

    return <div css={{ padding: '0.75rem', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
        <div css={{ display: 'flex', height: '1.5rem', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1) inset' }}>
            {segments.map((s) => (<motion.div key={s.key} initial={{ width: 0 }} animate={{ width: `${s.width}%` }} transition={{ duration: 0.5, delay: s.offset / 100 }} css={{ height: '100%', backgroundColor: s.color, position: 'relative' }} />))}
        </div>
        <div css={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {segments.map((s) => (
                <div key={s.key} css={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <div css={{ display: 'flex', alignItems: 'center' }}>
                        <span css={{ height: '0.5rem', width: '0.5rem', backgroundColor: s.color, borderRadius: '50%', marginRight: '0.5rem' }}></span>
                        <span css={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.key}</span>
                    </div>
                    <span css={{ fontWeight: 700 }}>{s.count} songs</span>
                </div>
            ))}
        </div>
    </div>;
};

const SongManager: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const songs = useSelector((state: RootState) => state.songs.songs);
    const [showForm, setShowForm] = useState(false);
    const [editSong, setEditSong] = useState<Song | null>(null);
    const [deleteSongId, setDeleteSongId] = useState<string | null>(null);
    const [filterText, setFilterText] = useState("");
    const [filterField, setFilterField] = useState<"Title" | "Artist" | "Album" | "Genre">("Title");

    const formRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);

    useEffect(() => { dispatch(fetchSongsRequest()); }, [dispatch]);

    const handleEdit = (song: Song) => { setEditSong(song); setShowForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); };
    const handleAddNew = () => { setEditSong(null); setShowForm(!showForm); if (!showForm) setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); };
    const handleSave = (newSong: Omit<Song, "_id">) => { dispatch(addSongRequest(newSong)); setShowForm(false); };
    const handleUpdate = (updatedSong: Song) => { dispatch(updateSongRequest(updatedSong)); setEditSong(null); setShowForm(false); };
    const handleJumpToStats = () => statsRef.current?.scrollIntoView({ behavior: "smooth" });

    const filteredSongs = songs.filter((s) => (s[filterField] as string).toLowerCase().includes(filterText.toLowerCase()));
    const totalSongs = songs.length;
    
    const genreCount = useMemo(() => countByField(songs, "Genre"), [songs]);
    const artistSongCount = useMemo(() => countByField(songs, "Artist"), [songs]);
    const albumSongCount = useMemo(() => countByField(songs, "Album"), [songs]);
    const artistAlbumCount = useMemo(() => countAlbumsByArtist(songs), [songs]);


    const stats = useMemo(() => [
        { icon: "🎵", value: totalSongs, label: "Total Songs", color: "#8b5cf6" },
        { icon: "🎤", value: new Set(songs.map((s) => s.Artist)).size, label: "Total Artists", color: "#ec4899" },
        { icon: "💿", value: new Set(songs.map((s) => s.Album)).size, label: "Total Albums", color: "#facc15" },
        { icon: "🎧", value: Object.entries(genreCount).sort((a,b)=>b[1]-a[1])[0]?.[0] || "-", label: "Most Common Genre", color: "#22c55e" },
    ], [totalSongs, songs, genreCount]);

    const songActionBase = css({ width: "5.5rem", padding: "0.5rem 0.8rem", borderRadius: "0.75rem", fontWeight: 500, cursor: "pointer", transition: "all 0.2s", border: "none", outline: "none", [mobile]: { flex: 1, width: '100%', padding: '0.8rem 0.5rem' } });
    const editButtonCss = css(songActionBase, { backgroundColor: "#2563eb", color: "#fff", "&:hover":{ backgroundColor:"#1d4ed8" } });
    const deleteButtonCss = css(songActionBase, { backgroundColor: "#dc2626", color: "#fff", "&:hover":{ backgroundColor:"#b91c1c" } });

    const headerCss = css(cardBase, { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem", backgroundColor: "#f9fafb", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", [mobile]: { flexDirection: 'column', alignItems: 'stretch', padding: '1rem' } });
    const filterContainerCss = css(cardBase, { display:"flex", gap:"0.75rem", padding:"1rem", backgroundColor:"#f9fafb", [mobile]: { flexDirection: 'column', gap: '1rem' } });

    return (
        <div css={{ maxWidth: "72rem", margin: "0 auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem", [mobile]: { padding: '1rem', gap: '1rem' } }}>
            <header css={headerCss}>
                <div css={{ position: "absolute", top: 0, left: 0, width: "100%", height: "0.25rem", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem", background: "linear-gradient(to right, #8b5cf6, #6366f1)" }} />
                <h1 css={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "1.5rem", fontWeight: 700, color: "#000", marginRight: "1rem", [mobile]: { marginBottom: '1rem', marginRight: 0, alignSelf: 'flex-start' } }}>
                    <span css={{ fontSize: "2rem", color: "#8b5cf6" }}>🎵</span> Song Catalog
                </h1>
                <div css={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", flexShrink: 0, [mobile]: { width: '100%', flexDirection: 'column' } }}>
                    <button onClick={handleAddNew} css={primaryButton}>{showForm ? "Close Form" : "+ Add New Song"}</button>
                    <button onClick={handleJumpToStats} css={secondaryButton}>📊 Statistics</button>
                </div>
            </header>

            <AnimatePresence>{showForm && (<motion.div ref={formRef} initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} transition={{duration:0.3}}>
                <SongForm songToEdit={editSong||undefined} onSave={handleSave} onUpdate={handleUpdate} onClose={()=>setShowForm(false)} />
            </motion.div>)}</AnimatePresence>

            <div css={filterContainerCss}>
                <div css={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#000', [mobile]: { width: '100%', justifyContent: 'space-between' } }}>
                    Filter by:
                    <select value={filterField} onChange={e=>setFilterField(e.target.value as any)} css={{ borderRadius:"0.5rem", padding:"0.25rem 0.5rem", border:"1px solid #d1d5db" }}>
                        {["Title", "Artist", "Album", "Genre"].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                <input type="text" placeholder="Search songs..." value={filterText} onChange={e=>setFilterText(e.target.value)} css={{ flex:1, borderRadius:"0.5rem", padding:"0.5rem", border:"1px solid #d1d5db", outline:"none", boxShadow:"inset 0 1px 2px rgba(0,0,0,0.05)", [mobile]: { width: '100%' } }} />
            </div>

            <div css={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                {filteredSongs.map((song, index) => (
                    <div key={song._id} css={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"1rem", borderRadius:"1rem", backgroundColor:index%2===0?"#f9fafb":"#f3f4f6", boxShadow:"0 1px 2px rgba(0,0,0,0.05)", [mobile]: { flexDirection: 'column', alignItems: 'stretch', padding: '1rem 0.75rem' } }}>
                        <div css={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"1rem", flex:1, [mobile]: { gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem 0.5rem', width: '100%', marginBottom: '1rem' } }}>
                            {["Title","Artist","Album","Genre"].map(field => (
                                <div key={field}>
                                    <div css={{ fontSize:"0.625rem", fontWeight:700, textTransform:"uppercase", color:"rgba(0,0,0,0.7)" }}>{field}</div>
                                    <div css={{ fontWeight:500 }}>{song[field as keyof Song]}</div>
                                </div>
                            ))}
                        </div>
                        <div css={{ display:"flex", gap:"0.5rem", flexShrink:0, [mobile]: { width: '100%', justifyContent: 'space-between' } }}>
                            <button onClick={() => handleEdit(song)} css={editButtonCss}>Edit</button>
                            <button onClick={() => setDeleteSongId(song._id??null)} css={deleteButtonCss}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <div ref={statsRef} css={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"0.75rem", marginTop:"1.5rem", [mobile]: { gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' } }}>
                {stats.map(({icon,value,label,color}) => (
                    <motion.div key={label} whileHover={{scale:1.05}} css={css(cardBase, { backgroundColor:`${color}20`, border:`1px solid ${color}`, display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", overflow: "hidden", padding: '1rem 0.5rem' })}>
                        <div css={{ position:"absolute", top:0, left:0, width:"100%", height:"0.25rem", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem", background:color }} />
                        <div css={{ fontSize:"1.5rem", marginBottom:"0.25rem" }}>{icon}</div>
                        <div css={{ fontSize:"1.25rem", fontWeight:700, color:"#000" }}>{value}</div>
                        <div css={{ fontSize:"0.875rem", fontWeight:600, color:"#000" }}>{label}</div>
                    </motion.div>
                ))}
            </div>

            <section css={{ marginTop:"1.5rem", display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"1.5rem", [tablet]: { gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }, [mobile]: { gridTemplateColumns: '1fr', gap: '1rem' } }}>
                <h2 css={{ fontSize:"1.25rem", fontWeight:700, color:"#000", marginBottom:"0.5rem", gridColumn: 'span 4', [tablet]: { gridColumn: 'span 2' }, [mobile]: { gridColumn: 'span 1' } }}>Music Statistics Detail 📈</h2>
                
                <div css={{ gridColumn: 'span 1' }}><h3 css={{ fontSize:"1rem", fontWeight:600, borderBottom:"1px solid #d1d5db", paddingBottom:"0.25rem", marginBottom: "0.5rem", color:"#22c55e" }}>Songs in Each Genre </h3><BarChart data={genreCount} color="#22c55e" maxItems={5}  /></div>
                
                <div css={{ gridColumn: 'span 1' }}><h3 css={{ fontSize:"1rem", fontWeight:600, borderBottom:"1px solid #d1d5db", paddingBottom:"0.25rem", marginBottom: "0.5rem", color:"#ec4899" }}>Number of Songs Each Artist Has </h3><DonutChart data={artistSongCount} color="#ec4899" total={totalSongs} /></div>
                
                <div css={{ gridColumn: 'span 1' }}><h3 css={{ fontSize:"1rem", fontWeight:600, borderBottom:"1px solid #d1d5db", paddingBottom:"0.25rem", marginBottom: "0.5rem", color:"#06b6d4" }}>Number of Albums Each Artist Has </h3><BarChart data={artistAlbumCount} color="#06b6d4" maxItems={5} /></div>

                <div css={{ gridColumn: 'span 1' }}><h3 css={{ fontSize:"1rem", fontWeight:600, borderBottom:"1px solid #d1d5db", paddingBottom:"0.25rem", marginBottom: "0.5rem", color:"#facc15" }}>Songs in Each Album </h3><StackedBarChart data={albumSongCount} color="#facc15" total={totalSongs} maxItems={5} /></div>
            </section>

            {deleteSongId && (
                <div css={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding: '1rem' }}>
                    <div css={{ backgroundColor:"#fff", padding:"1.5rem", borderRadius:"1rem", boxShadow:"0 6px 12px rgba(0,0,0,0.2)", width:"20rem", [mobile]: { width: '100%', maxWidth: '20rem' } }}>
                        <p css={{ marginBottom:"1rem", color:"#000", fontWeight:500 }}>Are you sure you want to delete this song?</p>
                        <div css={{ display:"flex", justifyContent:"space-between", gap:"0.5rem" }}>
                            <button onClick={()=>{dispatch(deleteSongRequest(deleteSongId)); setDeleteSongId(null);}} css={{ flex:1, padding:"0.5rem", backgroundColor:"#dc2626", color:"#fff", borderRadius:"0.75rem", fontWeight:500, cursor:"pointer", border:"none", "&:hover":{ backgroundColor:"#b91c1c" } }}>Yes</button>
                            <button onClick={()=>setDeleteSongId(null)} css={{ flex:1, padding:"0.5rem", backgroundColor:"#e5e7eb", color:"#000", borderRadius:"0.75rem", fontWeight:500, cursor:"pointer", border:"none", "&:hover":{ backgroundColor:"#d1d5db" } }}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default SongManager;