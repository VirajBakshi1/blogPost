"use client";

import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────────
interface BlogDoc {
  _id: string;
  title: string;
  imageUrl: string;
  shortText: string;
  fullText: string;
  createdBy: string;
  createdAt: string;
}

interface UserDoc {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
}

// ── Tab badge ──────────────────────────────────────────────────────────────────
function Tab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-[12px] text-sm font-semibold tracking-[-0.28px] transition-colors ${
        active
          ? "bg-[#1f4e4e] text-[#f5f5f0]"
          : "text-[#7a7a76] hover:bg-black/5"
      }`}
    >
      {label}
    </button>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────────
export default function AdminPanel({
  adminName,
  adminEmail,
}: {
  adminName: string;
  adminEmail: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"stories" | "write" | "members">(
    "stories"
  );

  // ── Logout ──────────────────────────────────────────────────────────────────
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-[#1f4e4e] text-[#f5f5f0]">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-10 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f5f5f0] rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
                <path d="M11 2L3 9V20H9V14H13V20H19V9L11 2Z" fill="#1f4e4e" />
              </svg>
            </div>
            <div>
              <p className="text-[#f5f5f0] text-base font-semibold leading-none tracking-[-0.32px]">
                Helium Admin
              </p>
              <p className="text-[#a8c4b8] text-xs font-medium mt-0.5 truncate max-w-[200px]">
                {adminEmail}
              </p>
            </div>
          </div>

          {/* User + logout */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-[#a8c4b8] text-sm font-medium">
              {adminName}
            </span>
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-[#f5f5f0] text-sm font-semibold px-4 py-2 rounded-[10px] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Tab bar ────────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-black/10">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-10 h-14 flex items-center gap-2">
          <Tab
            label="Stories"
            active={activeTab === "stories"}
            onClick={() => setActiveTab("stories")}
          />
          <Tab
            label="Write"
            active={activeTab === "write"}
            onClick={() => setActiveTab("write")}
          />
          <Tab
            label="Members"
            active={activeTab === "members"}
            onClick={() => setActiveTab("members")}
          />
        </div>
      </nav>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <main className="max-w-[1200px] mx-auto px-5 sm:px-10 py-10">
        {activeTab === "stories" && <StoriesTab />}
        {activeTab === "write" && <WriteTab />}
        {activeTab === "members" && <MembersTab />}
      </main>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// STORIES TAB
// ════════════════════════════════════════════════════════════════════════════════

function StoriesTab() {
  const [blogs, setBlogs] = useState<BlogDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function fetchBlogs() {
    setLoading(true);
    try {
      const res = await fetch("/api/blog/all");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBlogs(data.blogs);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to load stories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchBlogs();
  }, []);

  async function handleDelete(id: string) {
    setDeleteLoading(true);
    const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
    setDeleteLoading(false);
    setDeleteId(null);
    if (res.ok) {
      setBlogs((prev) => prev.filter((b) => b._id !== id));
    }
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[#1f4e4e] text-xl font-semibold tracking-[-0.4px]">
          All Stories ({blogs.length})
        </h2>
      </div>

      {blogs.length === 0 ? (
        <EmptyState msg="No stories yet. Use the Write tab to create one." />
      ) : (
        blogs.map((blog) => (
          <div key={blog._id} className="bg-white rounded-[16px] overflow-hidden border border-black/10">
            <div className="flex gap-4 p-4">
              {/* Thumbnail */}
              <div className="w-24 h-24 rounded-[12px] overflow-hidden shrink-0">
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[#1f4e4e] text-base font-semibold tracking-[-0.32px] truncate">
                  {blog.title}
                </p>
                <p className="text-[#7a7a76] text-sm font-medium mt-1 line-clamp-2 leading-5">
                  {blog.shortText}
                </p>
                <p className="text-[#aaa] text-xs font-medium mt-2">
                  {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() =>
                    setEditingId(editingId === blog._id ? null : blog._id)
                  }
                  className="px-4 py-2 bg-[#1f4e4e] text-[#f5f5f0] text-sm font-semibold rounded-[10px] hover:bg-[#173c3c] transition-colors"
                >
                  {editingId === blog._id ? "Cancel" : "Edit"}
                </button>
                <button
                  onClick={() => setDeleteId(blog._id)}
                  className="px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-[10px] hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Inline edit form */}
            {editingId === blog._id && (
              <div className="border-t border-black/10 p-4 bg-[#f5f5f0]">
                <EditBlogForm
                  blog={blog}
                  onSave={(updated) => {
                    setBlogs((prev) =>
                      prev.map((b) => (b._id === updated._id ? updated : b))
                    );
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            )}
          </div>
        ))
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-[20px] p-6 max-w-sm w-full">
            <h3 className="text-[#1f4e4e] text-lg font-semibold mb-2">
              Delete Story?
            </h3>
            <p className="text-[#7a7a76] text-sm font-medium mb-6">
              This action cannot be undone. The story will be permanently
              removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-[12px] border border-black/10 text-[#2b2b2a] text-sm font-semibold hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deleteLoading}
                onClick={() => void handleDelete(deleteId)}
                className="flex-1 py-3 rounded-[12px] bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleteLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inline edit form ───────────────────────────────────────────────────────────
function EditBlogForm({
  blog,
  onSave,
  onCancel,
}: {
  blog: BlogDoc;
  onSave: (updated: BlogDoc) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: blog.title,
    shortText: blog.shortText,
    fullText: blog.fullText,
    imageUrl: blog.imageUrl,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title || !form.shortText || !form.fullText || !form.imageUrl) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/${blog._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSave({ ...blog, ...form });
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to update.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
      <p className="text-[#1f4e4e] text-sm font-semibold">Edit Story</p>
      <AdminInput
        label="Title"
        value={form.title}
        onChange={(v) => setForm((p) => ({ ...p, title: v }))}
      />
      <AdminInput
        label="Image URL"
        value={form.imageUrl}
        onChange={(v) => setForm((p) => ({ ...p, imageUrl: v }))}
      />
      <AdminTextarea
        label="Short Text"
        value={form.shortText}
        rows={3}
        onChange={(v) => setForm((p) => ({ ...p, shortText: v }))}
      />
      <AdminTextarea
        label="Full Text"
        value={form.fullText}
        rows={6}
        onChange={(v) => setForm((p) => ({ ...p, fullText: v }))}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-[12px] border border-black/10 text-sm font-semibold hover:bg-black/5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-[12px] bg-[#1f4e4e] text-[#f5f5f0] text-sm font-semibold hover:bg-[#173c3c] transition-colors disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// WRITE TAB
// ════════════════════════════════════════════════════════════════════════════════

function WriteTab() {
  const [form, setForm] = useState({
    title: "",
    shortText: "",
    fullText: "",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview("");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title || !form.shortText || !form.fullText) {
      setError("Title, short text, and full text are all required.");
      return;
    }
    if (uploadMode === "file" && !imageFile) {
      setError("Please select an image file.");
      return;
    }
    if (uploadMode === "url" && !form.imageUrl.trim()) {
      setError("Please enter an image URL.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("shortText", form.shortText.trim());
      fd.append("fullText", form.fullText.trim());

      if (uploadMode === "file" && imageFile) {
        fd.append("image", imageFile);
      } else {
        fd.append("imageUrl", form.imageUrl.trim());
      }

      const res = await fetch("/api/blog/create", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess("Story published successfully!");
      setForm({ title: "", shortText: "", fullText: "", imageUrl: "" });
      setImageFile(null);
      setImagePreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to publish story.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[720px]">
      <h2 className="text-[#1f4e4e] text-xl font-semibold tracking-[-0.4px] mb-6">
        Write a New Story
      </h2>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="flex flex-col gap-6 bg-white rounded-[20px] p-6 border border-black/10"
      >
        <AdminInput
          label="Title"
          value={form.title}
          placeholder="e.g. Morya Hospital, Chinchwad"
          onChange={(v) => setForm((p) => ({ ...p, title: v }))}
        />

        <AdminTextarea
          label="Short Text (shown on the card)"
          value={form.shortText}
          rows={3}
          placeholder="A one-paragraph summary of the story…"
          onChange={(v) => setForm((p) => ({ ...p, shortText: v }))}
        />

        <AdminTextarea
          label="Full Text (shown on the detail page)"
          value={form.fullText}
          rows={8}
          placeholder="The complete story with all details…"
          onChange={(v) => setForm((p) => ({ ...p, fullText: v }))}
        />

        {/* Image upload mode toggle */}
        <div className="flex flex-col gap-3">
          <label className="text-[#7a7a76] text-xs font-semibold uppercase tracking-wide">
            Cover Image
          </label>
          <div className="flex gap-2 mb-1">
            <button
              type="button"
              onClick={() => setUploadMode("file")}
              className={`px-4 py-2 rounded-[10px] text-sm font-semibold transition-colors ${
                uploadMode === "file"
                  ? "bg-[#1f4e4e] text-[#f5f5f0]"
                  : "bg-black/5 text-[#7a7a76] hover:bg-black/10"
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setUploadMode("url")}
              className={`px-4 py-2 rounded-[10px] text-sm font-semibold transition-colors ${
                uploadMode === "url"
                  ? "bg-[#1f4e4e] text-[#f5f5f0]"
                  : "bg-black/5 text-[#7a7a76] hover:bg-black/10"
              }`}
            >
              Paste URL
            </button>
          </div>

          {uploadMode === "file" ? (
            <div className="flex flex-col gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-[#7a7a76] file:mr-4 file:py-2 file:px-4 file:rounded-[10px] file:border-0 file:text-sm file:font-semibold file:bg-[#1f4e4e] file:text-[#f5f5f0] hover:file:bg-[#173c3c] cursor-pointer"
              />
              {imagePreview && (
                <div className="relative w-full aspect-[16/9] rounded-[12px] overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          ) : (
            <AdminInput
              label=""
              value={form.imageUrl}
              placeholder="https://images.unsplash.com/…"
              onChange={(v) => setForm((p) => ({ ...p, imageUrl: v }))}
            />
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm font-medium bg-red-50 rounded-[10px] px-4 py-3">
            {error}
          </p>
        )}
        {success && (
          <p className="text-emerald-700 text-sm font-medium bg-emerald-50 rounded-[10px] px-4 py-3">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#1f4e4e] text-[#f5f5f0] text-base font-semibold rounded-[14px] hover:bg-[#173c3c] transition-colors disabled:opacity-60"
        >
          {loading ? "Publishing…" : "Publish Story"}
        </button>
      </form>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MEMBERS TAB
// ════════════════════════════════════════════════════════════════════════════════

function MembersTab() {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setUsers(data.users);
      } catch (e: unknown) {
        setError((e as Error).message ?? "Failed to load members.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <div>
      <h2 className="text-[#1f4e4e] text-xl font-semibold tracking-[-0.4px] mb-6">
        Members ({users.length})
      </h2>

      {users.length === 0 ? (
        <EmptyState msg="No registered members yet." />
      ) : (
        <div className="bg-white rounded-[20px] border border-black/10 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-black/10">
                {["Full Name", "Email", "Phone", "Role", "Joined"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[#7a7a76] text-xs font-semibold uppercase tracking-wide px-5 py-4"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr
                  key={user._id}
                  className={`${i < users.length - 1 ? "border-b border-black/5" : ""} hover:bg-[#f5f5f0] transition-colors`}
                >
                  <td className="px-5 py-4 text-[#2b2b2a] text-sm font-medium">
                    {user.name}
                  </td>
                  <td className="px-5 py-4 text-[#2b2b2a] text-sm font-medium">
                    {user.email}
                  </td>
                  <td className="px-5 py-4 text-[#7a7a76] text-sm font-medium">
                    {user.phone ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.role === "admin"
                          ? "bg-[#1f4e4e] text-[#f5f5f0]"
                          : "bg-[#ebffe0] text-[#238859]"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#7a7a76] text-sm font-medium">
                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// SHARED FORM HELPERS
// ════════════════════════════════════════════════════════════════════════════════

function AdminInput({
  label,
  value,
  placeholder = "",
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[#7a7a76] text-xs font-semibold uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#f5f5f0] border border-black/10 h-12 rounded-[10px] px-4 w-full text-[#2b2b2a] text-sm font-medium placeholder:text-[#aaa] outline-none focus:border-[#1f4e4e] transition-colors"
      />
    </div>
  );
}

function AdminTextarea({
  label,
  value,
  rows,
  placeholder = "",
  onChange,
}: {
  label: string;
  value: string;
  rows: number;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[#7a7a76] text-xs font-semibold uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#f5f5f0] border border-black/10 rounded-[10px] px-4 py-3 w-full text-[#2b2b2a] text-sm font-medium placeholder:text-[#aaa] outline-none focus:border-[#1f4e4e] transition-colors resize-y leading-6"
      />
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#1f4e4e]/20 border-t-[#1f4e4e] rounded-full animate-spin" />
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="text-red-600 text-sm font-medium bg-red-50 rounded-[12px] px-5 py-4">
      {msg}
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="text-center py-16">
      <p className="text-[#7a7a76] text-base font-medium">{msg}</p>
    </div>
  );
}
