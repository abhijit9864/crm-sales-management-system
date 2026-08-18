function Dashboard() {
  return (
    <div>
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Leads", "248"],
          ["Customers", "86"],
          ["Active Deals", "42"],
          ["Revenue", "₹8.42L"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-[#EDEEF0] bg-white p-5 shadow-[0_4px_20px_rgba(35,37,41,0.03)]"
          >
            <p className="font-inter text-sm text-[#9CA1AA]">{label}</p>

            <p className="mt-3 font-gilroy text-3xl font-bold text-[#1D1E20]">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;