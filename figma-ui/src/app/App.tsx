import { RouterProvider } from 'react-router';
import { createBrowserRouter, Navigate } from 'react-router';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import LanguageSelectPage from './pages/LanguageSelectPage';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import ExploreSchemesPage from './pages/ExploreSchemesPage';
import SchemeDetailPage from './pages/SchemeDetailPage';
import ServiceCenterPage from './pages/ServiceCenterPage';
import MyApplicationsPage from './pages/MyApplicationsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LanguageSelectPage />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: 'home', element: <HomePage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'explore', element: <ExploreSchemesPage /> },
      { path: 'scheme/:id', element: <SchemeDetailPage /> },
      { path: 'service-center', element: <ServiceCenterPage /> },
      { path: 'my-applications', element: <MyApplicationsPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}