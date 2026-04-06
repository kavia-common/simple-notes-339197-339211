import React, { useEffect, useMemo, useRef, useState } from "react";
import { loadNotes, saveNotes } from "./storage.js";

function uid() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}

function clampText(text, max = 120) {
  const t = (text ?? "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

function extractTitle(note) {
  const firstLine = (note?.content ?? "").split("\n")[0]?.trim() ?? "";
  return firstLine || "Untitled";
}

function extractPreview(note) {
  const content = (note?.content ?? "").trim();
  if (!content) return "No content yet.";
  return clampText(content.replace(/\s+/g, " "), 140);
}

// PUBLIC_INTERFACE
export default function App() {
  /** Notes app: local persistence (localStorage), CRUD, search, responsive modern light UI. */
  const [notes, setNotes] = useState(() => loadNotes());
  const [selectedId, setSelectedId] = useState(() => (loadNotes()[0]?.id ?? null));
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const editorRef = useRef(null);

  // Ensure selected note always points to an existing note.
  useEffect(() => {
    if (!notes.length) {
      setSelectedId(null);
      setDraft("");
      return;
    }
    const exists = notes.some((n) => n.id === selectedId);
    if (!exists) setSelectedId(notes[0].id);
  }, [notes, selectedId]);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId]
  );

  // Keep draft in sync when switching notes.
  useEffect(() => {
    setDraft(selectedNote?.content ?? "");
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist notes on change.
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...notes].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    if (!q) return list;
    return list.filter((n) => {
      const hay = `${extractTitle(n)}\n${n.content ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [notes, search]);

  const hasUnsavedChanges = useMemo(() => {
    if (!selectedNote) return false;
    return (selectedNote.content ?? "") !== draft;
  }, [selectedNote, draft]);

  function createNote() {
    const newNote = {
      id: uid(),
      content: "",
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote.id);
    setSearch("");
    // Focus editor after UI updates.
    setTimeout(() => editorRef.current?.focus(), 0);
  }

  function saveCurrent() {
    if (!selectedNote) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedNote.id
          ? {
              ...n,
              content: draft,
              updatedAt: nowIso()
            }
          : n
      )
    );
  }

  function requestDelete(id) {
    setDeleteConfirmId(id);
  }

  function confirmDelete() {
    const id = deleteConfirmId;
    if (!id) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
    setDeleteConfirmId(null);
  }

  function cancelDelete() {
    setDeleteConfirmId(null);
  }

  function selectNote(id) {
    if (hasUnsavedChanges) {
      // Lightweight safety: auto-save when switching.
      saveCurrent();
    }
    setSelectedId(id);
    setTimeout(() => editorRef.current?.focus(), 0);
  }

  function handleKeyDown(e) {
    const isMac = navigator.platform.toLowerCase().includes("mac");
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveCurrent();
    }
  }

  return (
    <div className="appRoot" onKeyDown={handleKeyDown}>
      <header className="header">
        <div className="headerLeft">
          <div className="logoMark" aria-hidden="true" />
          <div>
            <div className="titleRow">
              <h1 className="appTitle">Simple Notes</h1>
              <span className="pill">Local</span>
            </div>
            <p className="appSubtitle">Create, search, and organize notes — saved in your browser.</p>
          </div>
        </div>

        <div className="headerRight">
          <button className="btn btnPrimary" type="button" onClick={createNote}>
            New note
          </button>
        </div>
      </header>

      <main className="main">
        <section className="panel listPanel" aria-label="Notes list">
          <div className="panelHeader">
            <div className="panelHeaderTop">
              <h2 className="panelTitle">Notes</h2>
              <span className="muted">
                {filteredNotes.length}/{notes.length}
              </span>
            </div>

            <div className="searchWrap">
              <input
                className="input"
                value={search}
                placeholder="Search notes…"
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search notes"
              />
            </div>
          </div>

          <div className="list" role="list">
            {filteredNotes.length === 0 ? (
              <div className="empty">
                <div className="emptyTitle">No matching notes</div>
                <div className="emptyText">Try a different search or create a new note.</div>
              </div>
            ) : (
              filteredNotes.map((n) => {
                const active = n.id === selectedId;
                return (
                  <button
                    key={n.id}
                    type="button"
                    className={`noteCard ${active ? "active" : ""}`}
                    onClick={() => selectNote(n.id)}
                    role="listitem"
                    aria-current={active ? "true" : "false"}
                  >
                    <div className="noteCardTop">
                      <div className="noteTitle">{extractTitle(n)}</div>
                      <div className="noteDate">{formatDate(n.updatedAt || n.createdAt)}</div>
                    </div>
                    <div className="notePreview">{extractPreview(n)}</div>
                    <div className="noteCardActions">
                      <span className="hint">Click to open</span>
                      <span className="spacer" />
                      <span className="dangerLink" onClick={(e) => (e.stopPropagation(), requestDelete(n.id))}>
                        Delete
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className="panel editorPanel" aria-label="Note editor">
          <div className="panelHeader editorHeader">
            <div>
              <h2 className="panelTitle">{selectedNote ? extractTitle({ content: draft }) : "Editor"}</h2>
              <div className="muted small">
                {selectedNote ? (
                  <>
                    Updated {formatDate(selectedNote.updatedAt || selectedNote.createdAt)}
                    {hasUnsavedChanges ? " • Unsaved changes" : ""}
                  </>
                ) : (
                  "Create a note to start writing."
                )}
              </div>
            </div>

            <div className="editorActions">
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setDraft(selectedNote?.content ?? "");
                  editorRef.current?.focus();
                }}
                disabled={!selectedNote || !hasUnsavedChanges}
              >
                Discard
              </button>
              <button className="btn btnPrimary" type="button" onClick={saveCurrent} disabled={!selectedNote}>
                Save <span className="kbd">{navigator.platform.toLowerCase().includes("mac") ? "⌘" : "Ctrl"}S</span>
              </button>
            </div>
          </div>

          <div className="editorBody">
            <textarea
              ref={editorRef}
              className="textarea"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={selectedNote ? "Write your note here…" : "Click “New note” to begin."}
              disabled={!selectedNote}
              aria-label="Note content"
            />
          </div>
        </section>
      </main>

      {deleteConfirmId ? (
        <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Confirm delete">
          <div className="modal">
            <div className="modalTitle">Delete note?</div>
            <div className="modalText">This action cannot be undone.</div>
            <div className="modalActions">
              <button className="btn" type="button" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn btnDanger" type="button" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="footer">
        <span className="muted">
          Data is stored locally in this browser (localStorage). No backend used.
        </span>
      </footer>
    </div>
  );
}
