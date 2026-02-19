import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/" element={<div className="p-8">
          <h1 className="text-4xl font-bold mb-4">Time Tracker</h1>
          <p className="text-muted-foreground">Welcome to the Time Tracker application</p>
        </div>} />
      </Routes>
    </div>
  );
}

export default App;
