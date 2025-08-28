// Servidor MCP simples para Elite Barber
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Resposta para qualquer método
  const response = {
    server: "Elite Barber MCP",
    status: "funcionando",
    timestamp: new Date().toISOString(),
    message: "🚀 Servidor MCP Elite Barber está online!",
    project: {
      name: "Sistema de Agendamento para Barbearia",
      url: "https://barbernow-kappa.vercel.app",
      technology: "React + TypeScript + Vite + Supabase",
      developer: "Rodolfo Pironato - Turnbold",
    },
    tools: [
      "system_status - Verificar status do sistema",
      "get_appointments_count - Contar agendamentos",
      "project_info - Informações do projeto",
    ],
  };

  res.status(200).json(response);
}
