import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  CalendarDays,
  Users,
  Stethoscope,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  X,
  RefreshCw,
  Clock3,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API = "/api";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@clinicflow.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      onLogin();
      navigate("/dashboard");
    } catch {
      setError("Unable to connect to ClinicFlow server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-5 shadow-lg">
            <Stethoscope size={32} />
          </div>

          <h1 className="text-4xl font-bold text-white">
            Clinic<span className="text-blue-400">Flow</span>
          </h1>

          <p className="text-slate-400 mt-2">
            Modern clinic front-desk management
          </p>
        </div>

        <form
          onSubmit={submit}
          className="bg-white rounded-3xl p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back
          </h2>

          <p className="text-slate-500 text-sm mt-1 mb-7">
            Sign in to manage today's clinic operations.
          </p>

          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email
          </label>

          <input
            className="w-full border border-slate-200 rounded-xl px-4 py-3 mb-5 outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />

          <label className="block text-sm font-medium text-slate-700 mb-2">
            Password
          </label>

          <input
            className="w-full border border-slate-200 rounded-xl px-4 py-3 mb-5 outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />

          {error && (
            <div className="flex gap-2 items-center bg-red-50 text-red-600 rounded-xl p-3 mb-5 text-sm">
              <AlertCircle size={17} />
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-xs text-slate-400 text-center mt-5">
            Demo: admin@clinicflow.com / admin123
          </p>
        </form>
      </div>
    </div>
  );
}

function Layout({ children, onLogout }) {
  const location = useLocation();

  const links = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/appointments",
      label: "Appointments",
      icon: CalendarDays,
    },
    {
      to: "/appointments/new",
      label: "Book Appointment",
      icon: Plus,
    },
    {
      to: "/patients",
      label: "Patients",
      icon: Users,
    },
    {
      to: "/doctors",
      label: "Doctors",
      icon: Stethoscope,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-slate-950 text-white fixed inset-y-0 left-0 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Stethoscope size={22} />
            </div>

            <div>
              <div className="text-xl font-bold">
                Clinic<span className="text-blue-400">Flow</span>
              </div>
              <div className="text-xs text-slate-500">Front Desk</div>
            </div>
          </div>
        </div>

        <nav className="px-4 space-y-1 flex-1">
          {links.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 min-h-screen">{children}</main>
    </div>
  );
}

function Header({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-500 mt-1">{subtitle}</p>
      </div>

      {action}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {description && (
            <p className="text-xs text-slate-400 mt-2">{description}</p>
          )}
        </div>

        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const load = async () => {
    try {
      const headers = authHeaders();

      const [a, d, p] = await Promise.all([
        fetch(`${API}/appointments`, { headers }).then((r) => r.json()),
        fetch(`${API}/doctors`, { headers }).then((r) => r.json()),
        fetch(`${API}/patients`, { headers }).then((r) => r.json()),
      ]);

      if (a.success) setAppointments(a.data || []);
      if (d.success) setDoctors(d.data || []);
      if (p.success) setPatients(p.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Header
        title="Good morning 👋"
        subtitle="Here's what's happening at your clinic."
        action={
          <Link
            to="/appointments/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <Plus size={18} />
            Book Appointment
          </Link>
        }
      />

      <div className="grid grid-cols-3 gap-5 mb-8">
        <StatCard
          title="Appointments"
          value={appointments.length}
          icon={CalendarDays}
          description="Scheduled appointments"
        />

        <StatCard
          title="Patients"
          value={patients.length}
          icon={Users}
          description="Registered patients"
        />

        <StatCard
          title="Doctors"
          value={doctors.length}
          icon={Stethoscope}
          description="Available doctors"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-900">
                Upcoming Appointments
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Current scheduled visits
              </p>
            </div>

            <Link
              to="/appointments"
              className="text-sm text-blue-600 font-semibold"
            >
              View all
            </Link>
          </div>

          {appointments.slice(0, 6).map((a) => (
            <div
              key={a.id}
              className="p-5 border-b last:border-0 flex justify-between hover:bg-slate-50"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {a.patient_name}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {a.patient_code} · {a.doctor_name}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-slate-900">
                  {a.start_time} – {a.end_time}
                </p>
                <p className="text-sm text-slate-400">
                  {a.appointment_date}
                </p>
              </div>
            </div>
          ))}

          {appointments.length === 0 && (
            <div className="p-10 text-center text-slate-400">
              No appointments found.
            </div>
          )}
        </div>

        <div className="bg-slate-950 text-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Clock3 size={20} />
            </div>
            <div>
              <h2 className="font-bold">Clinic Pulse</h2>
              <p className="text-xs text-slate-400">
                Front-desk overview
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-slate-400 text-sm">Confirmed</p>
              <p className="text-2xl font-bold mt-1">
                {
                  appointments.filter((a) => a.status === "CONFIRMED")
                    .length
                }
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm">Cancelled</p>
              <p className="text-2xl font-bold mt-1">
                {
                  appointments.filter((a) => a.status === "CANCELLED")
                    .length
                }
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm">No Shows</p>
              <p className="text-2xl font-bold mt-1">
                {
                  appointments.filter((a) => a.status === "NO_SHOW")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [reschedule, setReschedule] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    appointment_date: "",
    start_time: "",
    end_time: "",
  });

  const load = async (query = "") => {
    setLoading(true);

    try {
      const url = query
        ? `${API}/appointments?search=${encodeURIComponent(query)}`
        : `${API}/appointments`;

      const res = await fetch(url, {
        headers: authHeaders(),
      });

      const data = await res.json();

      if (data.success) setAppointments(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;

    const res = await fetch(`${API}/appointments/${id}/cancel`, {
      method: "PATCH",
      headers: authHeaders(),
    });

    const data = await res.json();

    if (data.success) {
      setMessage(
        data.data.cancellation_fee === 0
          ? "Appointment cancelled — ₹0 fee"
          : "Appointment cancelled — ₹500 late cancellation fee"
      );
      load(search);
    } else {
      setMessage(data.message);
    }
  };

  const openReschedule = (appointment) => {
    setReschedule(appointment);
    setRescheduleForm({
      appointment_date: appointment.appointment_date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
    });
    setMessage("");
  };

  const submitReschedule = async (e) => {
    e.preventDefault();

    if (!reschedule) return;

    const res = await fetch(
      `${API}/appointments/${reschedule.id}/reschedule`,
      {
        method: "PATCH",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rescheduleForm),
      }
    );

    const data = await res.json();

    if (!data.success) {
      setMessage(data.message || "Unable to reschedule appointment.");
      return;
    }

    setReschedule(null);
    setMessage("Appointment rescheduled successfully.");
    load(search);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Header
        title="Appointments"
        subtitle="Search, manage and monitor clinic appointments."
        action={
          <Link
            to="/appointments/new"
            className="bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <Plus size={18} />
            Book Appointment
          </Link>
        }
      />

      {message && (
        <div className="mb-5 bg-blue-50 text-blue-700 border border-blue-100 p-4 rounded-xl flex justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage("")}>
            <X size={18} />
          </button>
        </div>
      )}

      <form onSubmit={submitSearch} className="mb-5 flex gap-3">
        <div className="relative flex-1">
          <Search
            size={19}
            className="absolute left-4 top-3.5 text-slate-400"
          />

          <input
            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search patient, patient ID, phone or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="bg-slate-900 text-white px-6 rounded-xl font-semibold">
          Search
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4 text-xs uppercase text-slate-500">
                  Patient
                </th>
                <th className="text-left p-4 text-xs uppercase text-slate-500">
                  Doctor
                </th>
                <th className="text-left p-4 text-xs uppercase text-slate-500">
                  Date
                </th>
                <th className="text-left p-4 text-xs uppercase text-slate-500">
                  Time
                </th>
                <th className="text-left p-4 text-xs uppercase text-slate-500">
                  Status
                </th>
                <th className="text-right p-4 text-xs uppercase text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">
                      {a.patient_name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {a.patient_code}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="text-sm font-medium">
                      {a.doctor_name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {a.specialization}
                    </div>
                  </td>

                  <td className="p-4 text-sm">{a.appointment_date}</td>

                  <td className="p-4 text-sm font-medium">
                    {a.start_time} – {a.end_time}
                  </td>

                  <td className="p-4">
                    <StatusBadge status={a.status} />
                  </td>

                  <td className="p-4 text-right">
                    {a.status === "CONFIRMED" && (
                      <div className="flex justify-end items-center gap-4">
                        <button
                          onClick={() => openReschedule(a)}
                          className="text-blue-600 text-sm font-semibold hover:underline"
                        >
                          Reschedule
                        </button>

                        <button
                          onClick={() => cancel(a.id)}
                          className="text-red-600 text-sm font-semibold hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="p-10 text-center text-slate-400">
              Loading appointments...
            </div>
          )}

          {!loading && appointments.length === 0 && (
            <div className="p-10 text-center text-slate-400">
              No appointments found.
            </div>
          )}
        </div>
      </div>

      {reschedule && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Reschedule Appointment
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {reschedule.patient_name} · {reschedule.doctor_name}
                </p>
              </div>

              <button onClick={() => setReschedule(null)}>
                <X />
              </button>
            </div>

            <form onSubmit={submitReschedule} className="p-6 space-y-5">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                The same patient and doctor will be kept. ClinicFlow will
                re-check the new time for doctor overlap before saving.
              </div>

              <Field label="New Appointment Date">
                <input
                  className="input"
                  type="date"
                  value={rescheduleForm.appointment_date}
                  onChange={(e) =>
                    setRescheduleForm({
                      ...rescheduleForm,
                      appointment_date: e.target.value,
                    })
                  }
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="New Start Time">
                  <input
                    className="input"
                    type="time"
                    value={rescheduleForm.start_time}
                    onChange={(e) =>
                      setRescheduleForm({
                        ...rescheduleForm,
                        start_time: e.target.value,
                      })
                    }
                    required
                  />
                </Field>

                <Field label="New End Time">
                  <input
                    className="input"
                    type="time"
                    value={rescheduleForm.end_time}
                    onChange={(e) =>
                      setRescheduleForm({
                        ...rescheduleForm,
                        end_time: e.target.value,
                      })
                    }
                    required
                  />
                </Field>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReschedule(null)}
                  className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold"
                >
                  Keep Current Time
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    CONFIRMED: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-red-50 text-red-700",
    COMPLETED: "bg-blue-50 text-blue-700",
    NO_SHOW: "bg-orange-50 text-orange-700",
  };

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    doctor_id: "",
    patient_id: "",
    appointment_date: "",
    start_time: "",
    end_time: "",
  });

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch(`${API}/doctors`, { headers: authHeaders() }).then((r) =>
        r.json()
      ),
      fetch(`${API}/patients`, { headers: authHeaders() }).then((r) =>
        r.json()
      ),
    ]).then(([d, p]) => {
      if (d.success) setDoctors(d.data || []);
      if (p.success) setPatients(p.data || []);
    });
  }, []);

  const update = (field, value) => {
    setForm((old) => ({ ...old, [field]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    const res = await fetch(`${API}/appointments`, {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        doctor_id: Number(form.doctor_id),
        patient_id: Number(form.patient_id),
      }),
    });

    const data = await res.json();

    if (!data.success) {
      setMessage(data.message);
      return;
    }

    setSuccess(true);
    setMessage("Appointment booked successfully.");

    setTimeout(() => navigate("/appointments"), 900);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Header
        title="Book Appointment"
        subtitle="Create a new patient appointment safely."
      />

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-7">
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl ${
              success
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={submit} className="grid grid-cols-2 gap-5">
          <Field label="Doctor">
            <select
              className="input"
              value={form.doctor_id}
              onChange={(e) => update("doctor_id", e.target.value)}
              required
            >
              <option value="">Select doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialization}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Patient">
            <select
              className="input"
              value={form.patient_id}
              onChange={(e) => update("patient_id", e.target.value)}
              required
            >
              <option value="">Select patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.patient_code} — {p.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Appointment Date">
            <input
              className="input"
              type="date"
              value={form.appointment_date}
              onChange={(e) =>
                update("appointment_date", e.target.value)
              }
              required
            />
          </Field>

          <div />

          <Field label="Start Time">
            <input
              className="input"
              type="time"
              value={form.start_time}
              onChange={(e) => update("start_time", e.target.value)}
              required
            />
          </Field>

          <Field label="End Time">
            <input
              className="input"
              type="time"
              value={form.end_time}
              onChange={(e) => update("end_time", e.target.value)}
              required
            />
          </Field>

          <div className="col-span-2 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 flex gap-3">
            <CheckCircle2 size={20} />
            <span>
              ClinicFlow automatically checks for overlapping appointments
              before confirming the booking.
            </span>
          </div>

          <button className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold">
            Confirm Appointment
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const url = search
      ? `${API}/patients/search?q=${encodeURIComponent(search)}`
      : `${API}/patients`;

    const res = await fetch(url, { headers: authHeaders() });
    const data = await res.json();

    if (data.success) setPatients(data.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const showPatient = async (id) => {
    const res = await fetch(`${API}/patients/${id}/appointments`, {
      headers: authHeaders(),
    });

    const data = await res.json();

    if (data.success) setSelected(data.data);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Header
        title="Patients"
        subtitle="Search patients and view their appointment history."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="flex gap-3 mb-6"
      >
        <div className="relative flex-1">
          <Search
            size={19}
            className="absolute left-4 top-3.5 text-slate-400"
          />

          <input
            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3"
            placeholder="Search by Patient ID, name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="bg-slate-900 text-white px-6 rounded-xl font-semibold">
          Search
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {patients.map((p) => (
          <button
            key={p.id}
            onClick={() => showPatient(p.id)}
            className="w-full text-left p-5 border-b hover:bg-slate-50 flex justify-between"
          >
            <div>
              <p className="font-semibold text-slate-900">{p.name}</p>
              <p className="text-sm text-blue-600 mt-1">
                {p.patient_code}
              </p>
            </div>

            <div className="text-right text-sm text-slate-500">
              <p>{p.phone}</p>
              <p>{p.email}</p>
            </div>
          </button>
        ))}

        {patients.length === 0 && (
          <div className="p-10 text-center text-slate-400">
            No patients found.
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto shadow-2xl">
            <div className="p-6 border-b flex justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {selected.patient.name}
                </h2>
                <p className="text-sm text-blue-600">
                  {selected.patient.patient_code}
                </p>
              </div>

              <button onClick={() => setSelected(null)}>
                <X />
              </button>
            </div>

            <div className="p-6">
              <h3 className="font-semibold mb-4">Appointment History</h3>

              {selected.appointments.map((a) => (
                <div
                  key={a.id}
                  className="border rounded-xl p-4 mb-3 flex justify-between"
                >
                  <div>
                    <p className="font-semibold">{a.doctor_name}</p>
                    <p className="text-sm text-slate-500">
                      {a.specialization}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">
                      {a.appointment_date}
                    </p>
                    <p className="text-sm text-slate-500">
                      {a.start_time} – {a.end_time}
                    </p>
                    <StatusBadge status={a.status} />
                  </div>
                </div>
              ))}

              {selected.appointments.length === 0 && (
                <p className="text-slate-400">No appointment history.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Doctors() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetch(`${API}/doctors`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setDoctors(data.data || []);
      });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Header
        title="Doctors"
        subtitle="Clinic specialists and availability."
      />

      <div className="grid grid-cols-3 gap-5">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
              <Stethoscope />
            </div>

            <h2 className="font-bold text-lg">{doctor.name}</h2>

            <p className="text-blue-600 text-sm mt-1">
              {doctor.specialization}
            </p>

            <Link
              to={`/doctors/${doctor.id}/schedule`}
              className="block text-center mt-5 border border-slate-200 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50"
            >
              View Schedule
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function DoctorSchedule({ id }) {
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState("2026-09-25");

  const load = async () => {
    const res = await fetch(
      `${API}/doctors/${id}/schedule?date=${date}`,
      {
        headers: authHeaders(),
      }
    );

    const data = await res.json();

    if (data.success) setDoctor(data.data);
  };

  useEffect(() => {
    load();
  }, [id]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Header
        title="Doctor Timeline"
        subtitle="Daily appointment schedule."
      />

      <div className="flex gap-3 mb-6">
        <input
          type="date"
          className="input max-w-xs"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button
          onClick={load}
          className="bg-slate-900 text-white px-5 rounded-xl flex items-center gap-2"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {doctor && (
        <div className="bg-white border rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold">{doctor.doctor.name}</h2>
            <p className="text-blue-600">
              {doctor.doctor.specialization}
            </p>
          </div>

          <div className="space-y-3">
            {doctor.appointments.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-5 border rounded-xl p-4"
              >
                <div className="w-28 font-semibold text-blue-600">
                  {a.start_time}
                </div>

                <div className="flex-1">
                  <p className="font-semibold">{a.patient_name}</p>
                  <p className="text-sm text-slate-500">
                    {a.patient_code}
                  </p>
                </div>

                <StatusBadge status={a.status} />
              </div>
            ))}

            {doctor.appointments.length === 0 && (
              <div className="text-center p-8 text-slate-400">
                No appointments for this date.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ScheduleRoute() {
  const { pathname } = useLocation();
  const id = pathname.split("/")[2];

  return <DoctorSchedule id={id} />;
}

function App() {
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  return (
    <BrowserRouter>
      {!loggedIn ? (
        <Login onLogin={() => setLoggedIn(true)} />
      ) : (
        <Layout onLogout={logout}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={<Dashboard />} />

            <Route
              path="/appointments"
              element={<Appointments />}
            />

            <Route
              path="/appointments/new"
              element={<BookAppointment />}
            />

            <Route path="/patients" element={<Patients />} />

            <Route path="/doctors" element={<Doctors />} />

            <Route
              path="/doctors/:id/schedule"
              element={<ScheduleRoute />}
            />

            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />
          </Routes>
        </Layout>
      )}
    </BrowserRouter>
  );
}

export default App;