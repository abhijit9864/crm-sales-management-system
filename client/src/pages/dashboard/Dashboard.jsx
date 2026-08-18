import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Calendar,
  CheckCircle2,
  Target,
  Users,
} from "lucide-react";

import { getDashboard } from "../../services/api";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDashboard();

      setDashboard(response.dashboard);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.message || "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <p className="font-inter text-sm font-medium text-[#266DF0]">
            Overview
          </p>

          <h1 className="mt-1 font-gilroy text-3xl font-bold tracking-tight text-[#1D1E20]">
            Dashboard
          </h1>
        </div>

        <div className="rounded-2xl border border-[#EDEEF0] bg-white p-8 text-center font-inter text-sm text-[#9CA1AA]">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <p className="font-inter text-sm font-medium text-[#266DF0]">
            Overview
          </p>

          <h1 className="mt-1 font-gilroy text-3xl font-bold tracking-tight text-[#1D1E20]">
            Dashboard
          </h1>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 font-inter text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  const totals = dashboard?.totals || {};
  const pipeline = dashboard?.pipeline || {};
  const activities = dashboard?.activities || {};

  const activityStats = activities.stats || {
    Pending: 0,
    Completed: 0,
    Cancelled: 0,
    Overdue: 0,
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  return (
    <div>
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8">
        <p className="font-inter text-sm font-medium text-[#266DF0]">
          Overview
        </p>

        <h1 className="mt-1 font-gilroy text-3xl font-bold tracking-tight text-[#1D1E20]">
          Dashboard
        </h1>

        <p className="mt-2 font-inter text-sm text-[#9CA1AA]">
          Here's what's happening with your sales today.
        </p>
      </div>

      {/* ==================================================
          TOP STATS
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Leads"
          value={totals.leads || 0}
          icon={Target}
        />

        <StatCard
          label="Customers"
          value={totals.customers || 0}
          icon={Users}
        />

        <StatCard
          label="Active Deals"
          value={totals.deals || 0}
          icon={BarChart3}
        />

        <StatCard
          label="Pipeline Value"
          value={formatCurrency(
            pipeline.totalValue
          )}
          icon={Activity}
        />
      </div>

      {/* ==================================================
          MAIN GRID
      ================================================== */}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Pipeline */}

        <div className="xl:col-span-2 rounded-2xl border border-[#EDEEF0] bg-white p-5 shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-gilroy text-lg font-bold text-[#1D1E20]">
                Sales Pipeline
              </h2>

              <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                Deals grouped by stage
              </p>
            </div>

            <BarChart3
              size={20}
              className="text-[#266DF0]"
            />
          </div>

          <div className="mt-6 space-y-4">
            {pipeline.stages?.length > 0 ? (
              pipeline.stages.map((stage) => (
                <div key={stage._id}>
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="font-inter text-sm font-semibold text-[#232529]">
                        {stage._id}
                      </p>

                      <p className="font-inter text-xs text-[#9CA1AA]">
                        {stage.count}{" "}
                        {stage.count === 1
                          ? "deal"
                          : "deals"}
                      </p>
                    </div>

                    <p className="font-inter text-sm font-semibold text-[#232529]">
                      {formatCurrency(
                        stage.totalValue
                      )}
                    </p>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#F0F2F5]">
                    <div
                      className="h-full rounded-full bg-[#266DF0]"
                      style={{
                        width: `${
                          pipeline.totalValue
                            ? Math.min(
                                (stage.totalValue /
                                  pipeline.totalValue) *
                                  100,
                                100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-[#F8F9FB] p-6 text-center font-inter text-sm text-[#9CA1AA]">
                No deals in pipeline.
              </div>
            )}
          </div>

          {/* Won / Lost */}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-green-50 p-4">
              <p className="font-inter text-xs text-green-600">
                Closed Won
              </p>

              <p className="mt-1 font-gilroy text-xl font-bold text-green-700">
                {formatCurrency(
                  pipeline.wonValue
                )}
              </p>

              <p className="mt-1 font-inter text-xs text-green-600">
                {pipeline.wonCount || 0} deals
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-4">
              <p className="font-inter text-xs text-red-600">
                Closed Lost
              </p>

              <p className="mt-1 font-gilroy text-xl font-bold text-red-700">
                {formatCurrency(
                  pipeline.lostValue
                )}
              </p>

              <p className="mt-1 font-inter text-xs text-red-600">
                {pipeline.lostCount || 0} deals
              </p>
            </div>
          </div>
        </div>

        {/* Activity Stats */}

        <div className="rounded-2xl border border-[#EDEEF0] bg-white p-5 shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-gilroy text-lg font-bold text-[#1D1E20]">
                Activities
              </h2>

              <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                Current activity status
              </p>
            </div>

            <Calendar
              size={20}
              className="text-[#266DF0]"
            />
          </div>

          <div className="mt-6 space-y-3">
            <ActivityStat
              label="Pending"
              value={activityStats.Pending}
              className="bg-orange-50 text-orange-600"
            />

            <ActivityStat
              label="Completed"
              value={activityStats.Completed}
              className="bg-green-50 text-green-600"
            />

            <ActivityStat
              label="Cancelled"
              value={activityStats.Cancelled}
              className="bg-red-50 text-red-600"
            />

            <ActivityStat
              label="Overdue"
              value={activityStats.Overdue}
              className="bg-red-50 text-red-600"
            />
          </div>
        </div>
      </div>

      {/* ==================================================
          UPCOMING ACTIVITIES
      ================================================== */}

      <div className="mt-6 rounded-2xl border border-[#EDEEF0] bg-white p-5 shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-gilroy text-lg font-bold text-[#1D1E20]">
              Upcoming Activities
            </h2>

            <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
              Your next scheduled activities
            </p>
          </div>

          <Calendar
            size={20}
            className="text-[#266DF0]"
          />
        </div>

        <div className="mt-5">
          {activities.upcoming?.length > 0 ? (
            <div className="divide-y divide-[#EDEEF0]">
              {activities.upcoming.map(
                (activity) => (
                  <div
                    key={activity._id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5F8FE] text-[#266DF0]">
                        <Calendar size={17} />
                      </div>

                      <div>
                        <p className="font-inter text-sm font-semibold text-[#232529]">
                          {activity.subject}
                        </p>

                        <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                          {activity.type}
                          {activity.customer
                            ? ` • ${activity.customer.name}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <p className="font-inter text-sm font-medium text-[#555E67]">
                        {new Date(
                          activity.dueDate
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>

                      <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                        {new Date(
                          activity.dueDate
                        ).toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-[#F8F9FB] p-6 text-center font-inter text-sm text-[#9CA1AA]">
              No upcoming activities.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   STAT CARD
====================================================== */

function StatCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-[#EDEEF0] bg-white p-5 shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
      <div className="flex items-center justify-between">
        <p className="font-inter text-sm text-[#9CA1AA]">
          {label}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F8FE] text-[#266DF0]">
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-3 font-gilroy text-3xl font-bold text-[#1D1E20]">
        {value}
      </p>
    </div>
  );
}

/* ======================================================
   ACTIVITY STAT
====================================================== */

function ActivityStat({
  label,
  value,
  className,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#F0F1F3] p-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${className}`}
        >
          <CheckCircle2 size={16} />
        </div>

        <span className="font-inter text-sm font-medium text-[#555E67]">
          {label}
        </span>
      </div>

      <span className="font-gilroy text-lg font-bold text-[#232529]">
        {value || 0}
      </span>
    </div>
  );
}

export default Dashboard;