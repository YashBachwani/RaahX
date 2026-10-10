import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Reports from './pages/Reports';
import JourneyPlanner from './pages/JourneyPlanner';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/reports" replace />} />
          <Route path="reports" element={<Reports />} />
          <Route path="journey-planner" element={<JourneyPlanner />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
