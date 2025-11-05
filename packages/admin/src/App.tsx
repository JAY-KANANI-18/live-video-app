import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Admin Panel
        </h1>
        <p className="text-lg text-gray-600">
          Live Video App Management Dashboard
        </p>
        <div className="mt-8 space-y-2">
          <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-lg">
            ✓ Admin panel initialized
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
