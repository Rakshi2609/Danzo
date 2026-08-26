import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <LoadingScreen
        message="Authenticating session..."
        submessage="Connecting to your secure Danzo workspace"
      />
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
