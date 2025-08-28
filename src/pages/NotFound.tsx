import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <main role="main" aria-label="Página não encontrada">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">404</h1>
          <p className="text-xl text-gray-700 mb-4">
            Oops! Página não encontrada
          </p>
          <a
            href="/"
            className="text-blue-700 hover:text-blue-900 underline font-medium"
            aria-label="Voltar para a página inicial"
          >
            Voltar para o Início
          </a>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
