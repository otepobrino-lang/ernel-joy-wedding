
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import {
  Download,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  UserCheck,
  HeartHandshake,
} from "lucide-react";
import "./Admin.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"
).replace(/\/+$/, "");

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

type RSVP = {
  id: string;
  full_name: string;
  attendance_response: "attending" | "celebrating_from_afar";
  message: string | null;
  created_at: string;
  email?: string | null;
  contact_number?: string | null;
  relationship_to_couple?: string | null;
  dietary_restrictions?: string | null;
};

type Stats = {
  total: number;
  attending: number;
  celebratingFromAfar: number;
};

type RSVPListResponse = {
  data: RSVP[];
  pagination: {
    total: number;
  };
};

type StatsResponse = {
  data: Stats;
};

async function apiRequest<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : "The request could not be completed.";

    throw new Error(message);
  }

  return body as T;
}

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    attending: 0,
    celebratingFromAfar: 0,
  });
  const [rows, setRows] = useState<RSVP[]>([]);
  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selected, setSelected] = useState<RSVP | null>(null);
  const [editName, setEditName] = useState("");
  const [editAttendance, setEditAttendance] =
    useState<RSVP["attendance_response"]>("attending");
  const [editMessage, setEditMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!supabase) {
      setCheckingSession(false);
      return;
    }

    let active = true;

    void supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;

        if (sessionError) {
          setLoginError(sessionError.message);
        }

        setSession(data.session);
        setCheckingSession(false);
      })
      .catch(() => {
        if (!active) return;

        setLoginError("Unable to check your session. Please try again.");
        setCheckingSession(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession);
        setLoginError("");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setLoginError("Supabase is not configured. Please check your environment settings.");
      return;
    }

    setLoginBusy(true);
    setLoginError("");
    setError("");
    setNotice("");

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setLoginError(authError.message);
      } else {
        setPassword("");
      }
    } catch {
      setLoginError("Unable to contact Supabase. Please check your connection and try again.");
    } finally {
      setLoginBusy(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;

    setError("");
    setNotice("");

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError(signOutError.message);
    }
  };

  const loadData = useCallback(async () => {
    if (!session?.access_token) return;

    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: "25",
        search,
      });

      if (attendance !== "all") {
        query.set("attendance", attendance);
      }

      const [statResult, listResult] = await Promise.all([
        apiRequest<StatsResponse>(
          "/api/admin/rsvps/stats",
          session.access_token,
        ),
        apiRequest<RSVPListResponse>(
          `/api/admin/rsvps?${query.toString()}`,
          session.access_token,
        ),
      ]);

      setStats(statResult.data);
      setRows(listResult.data);
      setTotal(listResult.pagination.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load RSVP responses.",
      );
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, page, search, attendance]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(total / 25)),
    [total],
  );

  const openEdit = (row: RSVP) => {
    setSelected(row);
    setEditName(row.full_name);
    setEditAttendance(row.attendance_response);
    setEditMessage(row.message ?? "");
    setError("");
    setNotice("");
  };

  const saveEdit = async () => {
    if (!session?.access_token || !selected) return;

    if (editName.trim().length < 2) {
      setError("Guest name must contain at least 2 characters.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await apiRequest(`/api/admin/rsvps/${selected.id}`, session.access_token, {
        method: "PATCH",
        body: JSON.stringify({
          fullName: editName.trim(),
          attendanceResponse: editAttendance,
          message: editMessage.trim() || null,
        }),
      });

      setSelected(null);
      setNotice("RSVP updated successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update RSVP.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteRsvp = async (row: RSVP) => {
    if (!session?.access_token) return;

    const confirmed = window.confirm(
      `Delete the RSVP submitted by ${row.full_name}? This cannot be undone.`,
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await apiRequest(
        `/api/admin/rsvps/${row.id}`,
        session.access_token,
        { method: "DELETE" },
      );

      setNotice("RSVP deleted successfully.");

      if (selected?.id === row.id) {
        setSelected(null);
      }

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete RSVP.",
      );
    }
  };

  const exportCsv = async () => {
    if (!session?.access_token) return;

    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/rsvps/export.csv`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);

        const message =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof body.error === "string"
            ? body.error
            : "Unable to export RSVPs.";

        throw new Error(message);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = "wedding-rsvps.csv";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
      setNotice("RSVP CSV export downloaded.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to export RSVPs.",
      );
    }
  };

  if (checkingSession) {
    return (
      <main className="admin-shell">
        <p className="admin-loading">Checking administrator session…</p>
      </main>
    );
  }

  if (!supabase) {
    return (
      <main className="admin-shell">
        <section className="admin-login-card">
          <ShieldCheck size={34} />
          <h1>Admin RSVP Management</h1>
          <p>
            Frontend Supabase settings are missing. Add
            VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to
            frontend/.env, then restart Vite.
          </p>
          <a href="/">Return to invitation</a>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="admin-shell">
        <section className="admin-login-card">
          <a className="admin-back-link" href="/">
            ← Back to wedding invitation
          </a>

          <div className="admin-mark">
            <ShieldCheck size={30} />
          </div>

          <p className="admin-eyebrow">ERNEL & JOY · PRIVATE ACCESS</p>
          <h1>Admin Sign In</h1>

          <p className="admin-subtitle">
            Sign in with your authorized administrator account to manage
            wedding RSVPs.
          </p>

          <form onSubmit={handleLogin} className="admin-login-form">
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            {loginError && (
              <p className="admin-error" role="alert">
                {loginError}
              </p>
            )}

            <button type="submit" disabled={loginBusy}>
              {loginBusy ? "Signing in…" : "Sign in securely"}
            </button>
          </form>

          <p className="admin-security-note">
            Access is limited to accounts registered as active administrators.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell admin-dashboard">
      <header className="admin-topbar">
        <a className="admin-brand" href="/">
          <span className="admin-brand-monogram">
            E <i>&</i> J
          </span>
          <span>Wedding Administration</span>
        </a>

        <div className="admin-account">
          <span>{session.user.email}</span>
          <button
            className="admin-quiet-button"
            onClick={() => void handleSignOut()}
            type="button"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </header>

      <section className="admin-content">
        <div className="admin-page-heading">
          <div>
            <p className="admin-eyebrow">PRIVATE DASHBOARD</p>
            <h1>RSVP Management</h1>
            <p>Guest responses for December 19, 2026</p>
          </div>

          <div className="admin-heading-actions">
            <button
              className="admin-secondary-button"
              onClick={() => void loadData()}
              disabled={loading}
              type="button"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              className="admin-primary-button"
              onClick={() => void exportCsv()}
              type="button"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {error && (
          <p className="admin-error admin-banner" role="alert">
            {error}
          </p>
        )}

        {notice && (
          <p className="admin-success admin-banner" role="status">
            {notice}
          </p>
        )}

        <div className="admin-stat-grid">
          <article className="admin-stat-card">
            <span className="admin-stat-icon">
              <Users size={19} />
            </span>
            <span>Total responses</span>
            <strong>{stats.total}</strong>
          </article>

          <article className="admin-stat-card">
            <span className="admin-stat-icon">
              <UserCheck size={19} />
            </span>
            <span>Joyfully accepts</span>
            <strong>{stats.attending}</strong>
          </article>

          <article className="admin-stat-card">
            <span className="admin-stat-icon">
              <HeartHandshake size={19} />
            </span>
            <span>Celebrating from afar</span>
            <strong>{stats.celebratingFromAfar}</strong>
          </article>
        </div>

        <section className="admin-table-card">
          <div className="admin-list-heading">
            <div>
              <h2>Guest responses</h2>
              <p>
                {total} response{total === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="admin-filters">
              <label className="admin-search">
                <Search size={17} />
                <input
                  placeholder="Search guest name"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  aria-label="Search guest name"
                />
              </label>

              <select
                aria-label="Filter attendance"
                value={attendance}
                onChange={(event) => {
                  setAttendance(event.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All responses</option>
                <option value="attending">Joyfully accepts</option>
                <option value="celebrating_from_afar">
                  Celebrating from afar
                </option>
              </select>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-rsvp-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Attendance</th>
                  <th>Message</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="admin-empty">
                      Loading RSVP responses…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-empty">
                      No RSVP responses found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.full_name}</strong>
                      </td>

                      <td>
                        <span
                          className={`admin-status ${
                            row.attendance_response === "attending"
                              ? "is-attending"
                              : "is-away"
                          }`}
                        >
                          {row.attendance_response === "attending"
                            ? "Joyfully accepts"
                            : "Celebrating from afar"}
                        </span>
                      </td>

                      <td className="admin-message-cell">
                        {row.message || "—"}
                      </td>

                      <td>
                        {new Date(row.created_at).toLocaleDateString(
                          "en-PH",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </td>

                      <td>
                        <div className="admin-row-actions">
                          <button
                            onClick={() => openEdit(row)}
                            type="button"
                          >
                            Edit
                          </button>

                          <button
                            className="admin-delete-button"
                            onClick={() => void deleteRsvp(row)}
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <footer className="admin-pagination">
            <span>
              Page {page} of {pageCount}
            </span>

            <div>
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((value) => value - 1)}
                type="button"
              >
                Previous
              </button>

              <button
                disabled={page >= pageCount || loading}
                onClick={() => setPage((value) => value + 1)}
                type="button"
              >
                Next
              </button>
            </div>
          </footer>
        </section>
      </section>

      {selected && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setSelected(null);
            }
          }}
        >
          <section
            className="admin-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-edit-title"
          >
            <div className="admin-modal-heading">
              <div>
                <p className="admin-eyebrow">GUEST RESPONSE</p>
                <h2 id="admin-edit-title">Edit RSVP</h2>
              </div>

              <button
                className="admin-modal-close"
                onClick={() => setSelected(null)}
                aria-label="Close"
                type="button"
                disabled={saving}
              >
                ×
              </button>
            </div>

            <label>
              Guest full name
              <input
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                required
                minLength={2}
                maxLength={120}
              />
            </label>

            <label>
              Attendance
              <select
                value={editAttendance}
                onChange={(event) =>
                  setEditAttendance(
                    event.target.value as RSVP["attendance_response"],
                  )
                }
              >
                <option value="attending">Joyfully accepts</option>
                <option value="celebrating_from_afar">
                  Celebrating from afar
                </option>
              </select>
            </label>

            <label>
              Message
              <textarea
                rows={4}
                value={editMessage}
                onChange={(event) => setEditMessage(event.target.value)}
                maxLength={1500}
              />
            </label>

            <div className="admin-modal-actions">
              <button
                className="admin-secondary-button"
                onClick={() => setSelected(null)}
                type="button"
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="admin-primary-button"
                disabled={saving || editName.trim().length < 2}
                onClick={() => void saveEdit()}
                type="button"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
