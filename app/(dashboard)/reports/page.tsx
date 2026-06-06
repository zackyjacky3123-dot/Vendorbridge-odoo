export default function ReportsPage() {
  return (
    <div className="p-6">
      <h2 className="page-title">Procurement Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="card p-6"><h3>Spend Trends</h3></div>
        <div className="card p-6"><h3>Vendor Performance</h3></div>
      </div>
    </div>
  );
}