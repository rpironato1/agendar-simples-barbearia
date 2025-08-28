import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Inicializar cliente Supabase
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL ||
        "https://dikfrwaqwbtibasxdvie.supabase.co",
      process.env.VITE_SUPABASE_ANON_KEY ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpa2Zyd2Fxd2J0aWJhc3hkdmllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDI0MDksImV4cCI6MjA2NjM3ODQwOX0.iOOjd_rXKeDhYAMJuuRDQRP47rhthxLG_OlkCSaXmSA"
    );

    const action = req.query.action || "insert";
    const timestamp = new Date().toISOString();

    if (action === "insert") {
      // Inserir registro de keep-alive
      const { data, error } = await supabase
        .from("keep_alive")
        .insert([
          {
            message: `Keep-alive diário - ${timestamp}`,
            created_at: timestamp,
          },
        ])
        .select();

      if (error) throw error;

      console.log(`✅ Keep-alive inserido: ${timestamp}`);

      return res.status(200).json({
        success: true,
        action: "insert",
        timestamp,
        message: "Keep-alive inserido com sucesso",
        data: data[0],
      });
    } else if (action === "cleanup") {
      // Limpar registros antigos (mais de 3 horas)
      const threeHoursAgo = new Date(
        Date.now() - 3 * 60 * 60 * 1000
      ).toISOString();

      const { data, error } = await supabase
        .from("keep_alive")
        .delete()
        .lt("created_at", threeHoursAgo)
        .select();

      if (error) throw error;

      console.log(
        `🧹 Limpeza realizada: ${data?.length || 0} registros removidos`
      );

      return res.status(200).json({
        success: true,
        action: "cleanup",
        timestamp,
        message: `${data?.length || 0} registros antigos removidos`,
        removed: data?.length || 0,
      });
    }

    return res.status(400).json({
      success: false,
      error: "Ação inválida. Use ?action=insert ou ?action=cleanup",
    });
  } catch (error) {
    console.error("❌ Erro no keep-alive:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
