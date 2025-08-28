import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Filter,
  Eye,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const FinancialDashboard = () => {
  const [dateFilter, setDateFilter] = useState<Date | undefined>(new Date());
  const [periodFilter, setPeriodFilter] = useState("month");
  const [customDateStart, setCustomDateStart] = useState<Date | undefined>(
    undefined
  );
  const [customDateEnd, setCustomDateEnd] = useState<Date | undefined>(
    undefined
  );
  const [filterType, setFilterType] = useState<
    "preset" | "custom" | "specific"
  >("preset");
  const [isAddCostItemOpen, setIsAddCostItemOpen] = useState(false);
  const [isAddCostRecordOpen, setIsAddCostRecordOpen] = useState(false);
  const [newCostItem, setNewCostItem] = useState({
    name: "",
    description: "",
    unit_price: "",
    category: "",
  });
  const [newCostRecord, setNewCostRecord] = useState({
    cost_item_id: "",
    quantity: "1",
    purchase_date: new Date(),
    notes: "",
  });

  // Buscar transações financeiras com dados da tabela clients
  const { data: transactions = [], refetch: refetchTransactions } = useQuery({
    queryKey: ["financial-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select(
          `
          *,
          appointments (
            clients (name, phone, cpf),
            services (name)
          )
        `
        )
        .order("transaction_date", { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        return [];
      }
      return data;
    },
  });

  // Buscar items de custo
  const { data: costItems = [], refetch: refetchCostItems } = useQuery({
    queryKey: ["cost-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cost_items")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching cost items:", error);
        return [];
      }
      return data;
    },
  });

  // Buscar registros de custo
  const { data: costRecords = [], refetch: refetchCostRecords } = useQuery({
    queryKey: ["cost-records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cost_records")
        .select(
          `
          *,
          cost_items (name, category, unit_price)
        `
        )
        .order("purchase_date", { ascending: false });

      if (error) {
        console.error("Error fetching cost records:", error);
        return [];
      }
      return data;
    },
  });

  // ✅ Calcular estatísticas financeiras com filtros aprimorados
  const calculateStats = () => {
    const now = new Date();
    let startDate, endDate;

    // ✅ Determinar período baseado no tipo de filtro
    if (filterType === "specific" && dateFilter) {
      // Data específica - filtrar apenas este dia
      startDate = new Date(
        dateFilter.getFullYear(),
        dateFilter.getMonth(),
        dateFilter.getDate()
      );
      endDate = new Date(
        dateFilter.getFullYear(),
        dateFilter.getMonth(),
        dateFilter.getDate() + 1
      );
    } else if (filterType === "custom" && customDateStart && customDateEnd) {
      // Período personalizado
      startDate = new Date(
        customDateStart.getFullYear(),
        customDateStart.getMonth(),
        customDateStart.getDate()
      );
      endDate = new Date(
        customDateEnd.getFullYear(),
        customDateEnd.getMonth(),
        customDateEnd.getDate() + 1
      );
    } else {
      // Períodos predefinidos
      switch (periodFilter) {
        case "day":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          endDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1
          );
          break;
        case "week":
          startDate = startOfWeek(now);
          endDate = endOfWeek(now);
          break;
        case "month":
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case "year":
          startDate = startOfYear(now);
          endDate = endOfYear(now);
          break;
        default:
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
      }
    }

    // ✅ Aplicar filtros às transações
    const filteredTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.transaction_date);
      return transactionDate >= startDate && transactionDate < endDate;
    });

    // ✅ Aplicar filtros aos custos
    const filteredCostRecords = costRecords.filter((c) => {
      const purchaseDate = new Date(c.purchase_date);
      return purchaseDate >= startDate && purchaseDate < endDate;
    });

    const totalIncome = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = filteredCostRecords.reduce(
      (sum, c) => sum + Number(c.total_amount),
      0
    );

    const profit = totalIncome - totalExpenses;

    // ✅ Calcular dados por tipo de pagamento
    const paymentByMethod = {
      pix: 0,
      cartao: 0,
      dinheiro: 0,
      outros: 0,
    };

    filteredTransactions
      .filter((t) => t.type === "income")
      .forEach((t) => {
        const amount = Number(t.amount);
        if (t.payment_method === "pix") {
          paymentByMethod.pix += amount;
        } else if (t.payment_method === "cartao") {
          paymentByMethod.cartao += amount;
        } else if (t.payment_method === "dinheiro") {
          paymentByMethod.dinheiro += amount;
        } else {
          paymentByMethod.outros += amount;
        }
      });

    // ✅ Calcular média diária
    const days = Math.max(
      1,
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    const dailyAverage = totalIncome / days;

    // ✅ Calcular transações por dia para mostrar tendências
    const transactionsByDay = new Map();
    filteredTransactions
      .filter((t) => t.type === "income")
      .forEach((t) => {
        const date = new Date(t.transaction_date).toISOString().split("T")[0];
        transactionsByDay.set(
          date,
          (transactionsByDay.get(date) || 0) + Number(t.amount)
        );
      });

    return {
      totalIncome,
      totalExpenses,
      profit,
      filteredTransactions,
      filteredCostRecords,
      paymentByMethod,
      dailyAverage,
      daysInPeriod: days,
      transactionsByDay,
      startDate,
      endDate,
    };
  };

  const {
    totalIncome,
    totalExpenses,
    profit,
    filteredTransactions,
    filteredCostRecords,
    paymentByMethod,
    dailyAverage,
    daysInPeriod,
    transactionsByDay,
    startDate,
    endDate,
  } = calculateStats();

  // ✅ Função para resetar filtros
  const resetFilters = () => {
    setFilterType("preset");
    setPeriodFilter("month");
    setDateFilter(undefined);
    setCustomDateStart(undefined);
    setCustomDateEnd(undefined);
  };

  // ✅ Função para aplicar data específica
  const applySpecificDate = (date: Date) => {
    setFilterType("specific");
    setDateFilter(date);
    setCustomDateStart(undefined);
    setCustomDateEnd(undefined);
  };

  // ✅ Função para aplicar período personalizado
  const applyCustomPeriod = (start: Date, end: Date) => {
    setFilterType("custom");
    setCustomDateStart(start);
    setCustomDateEnd(end);
    setDateFilter(undefined);
  };

  // ✅ Função para aplicar período predefinido
  const applyPresetPeriod = (period: string) => {
    setFilterType("preset");
    setPeriodFilter(period);
    setDateFilter(undefined);
    setCustomDateStart(undefined);
    setCustomDateEnd(undefined);
  };

  const handleAddCostItem = async () => {
    if (!newCostItem.name || !newCostItem.unit_price) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }

    const { error } = await supabase.from("cost_items").insert([
      {
        name: newCostItem.name,
        description: newCostItem.description || null,
        unit_price: parseFloat(newCostItem.unit_price),
        category: newCostItem.category || null,
      },
    ]);

    if (error) {
      console.error("Error adding cost item:", error);
      toast.error("Erro ao adicionar item");
      return;
    }

    toast.success("Item adicionado com sucesso!");
    setNewCostItem({ name: "", description: "", unit_price: "", category: "" });
    setIsAddCostItemOpen(false);
    refetchCostItems();
  };

  const handleAddCostRecord = async () => {
    if (!newCostRecord.cost_item_id || !newCostRecord.quantity) {
      toast.error("Item e quantidade são obrigatórios");
      return;
    }

    const selectedItem = costItems.find(
      (item) => item.id === newCostRecord.cost_item_id
    );
    if (!selectedItem) return;

    const totalAmount =
      selectedItem.unit_price * parseInt(newCostRecord.quantity);

    const { error } = await supabase.from("cost_records").insert([
      {
        cost_item_id: newCostRecord.cost_item_id,
        quantity: parseInt(newCostRecord.quantity),
        total_amount: totalAmount,
        purchase_date: format(newCostRecord.purchase_date, "yyyy-MM-dd"),
        notes: newCostRecord.notes || null,
      },
    ]);

    if (error) {
      console.error("Error adding cost record:", error);
      toast.error("Erro ao registrar custo");
      return;
    }

    toast.success("Custo registrado com sucesso!");
    setNewCostRecord({
      cost_item_id: "",
      quantity: "1",
      purchase_date: new Date(),
      notes: "",
    });
    setIsAddCostRecordOpen(false);
    refetchCostRecords();
  };

  return (
    <div className="space-y-6">
      {/* ✅ Filtros Aprimorados */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filtros Financeiros
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black"
            >
              Limpar Filtros
            </Button>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Personalize a visualização dos dados financeiros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Tipo de Filtro */}
            <div className="space-y-3">
              <Label className="text-white font-medium">Tipo de Filtro</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  variant={filterType === "preset" ? "default" : "outline"}
                  onClick={() => setFilterType("preset")}
                  className={
                    filterType === "preset"
                      ? "bg-amber-500 text-black"
                      : "border-slate-600 text-gray-300"
                  }
                >
                  📅 Períodos Rápidos
                </Button>
                <Button
                  variant={filterType === "specific" ? "default" : "outline"}
                  onClick={() => setFilterType("specific")}
                  className={
                    filterType === "specific"
                      ? "bg-amber-500 text-black"
                      : "border-slate-600 text-gray-300"
                  }
                >
                  📆 Data Específica
                </Button>
                <Button
                  variant={filterType === "custom" ? "default" : "outline"}
                  onClick={() => setFilterType("custom")}
                  className={
                    filterType === "custom"
                      ? "bg-amber-500 text-black"
                      : "border-slate-600 text-gray-300"
                  }
                >
                  🗓️ Período Personalizado
                </Button>
              </div>
            </div>

            {/* Filtros Condicionais */}
            {filterType === "preset" && (
              <div className="space-y-3">
                <Label className="text-white font-medium">
                  Período Predefinido
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant={periodFilter === "day" ? "default" : "outline"}
                    onClick={() => applyPresetPeriod("day")}
                    className={
                      periodFilter === "day"
                        ? "bg-green-500 text-white"
                        : "border-slate-600 text-gray-300"
                    }
                  >
                    Hoje
                  </Button>
                  <Button
                    variant={periodFilter === "week" ? "default" : "outline"}
                    onClick={() => applyPresetPeriod("week")}
                    className={
                      periodFilter === "week"
                        ? "bg-green-500 text-white"
                        : "border-slate-600 text-gray-300"
                    }
                  >
                    Esta Semana
                  </Button>
                  <Button
                    variant={periodFilter === "month" ? "default" : "outline"}
                    onClick={() => applyPresetPeriod("month")}
                    className={
                      periodFilter === "month"
                        ? "bg-green-500 text-white"
                        : "border-slate-600 text-gray-300"
                    }
                  >
                    Este Mês
                  </Button>
                  <Button
                    variant={periodFilter === "year" ? "default" : "outline"}
                    onClick={() => applyPresetPeriod("year")}
                    className={
                      periodFilter === "year"
                        ? "bg-green-500 text-white"
                        : "border-slate-600 text-gray-300"
                    }
                  >
                    Este Ano
                  </Button>
                </div>
              </div>
            )}

            {filterType === "specific" && (
              <div className="space-y-3">
                <Label className="text-white font-medium">
                  Selecione uma Data
                </Label>
                <Input
                  type="date"
                  value={dateFilter ? format(dateFilter, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      applySpecificDate(new Date(e.target.value));
                    }
                  }}
                  className="bg-slate-700 border-slate-600 text-white max-w-xs"
                />
              </div>
            )}

            {filterType === "custom" && (
              <div className="space-y-3">
                <Label className="text-white font-medium">
                  Período Personalizado
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">
                      Data Inicial
                    </Label>
                    <Input
                      type="date"
                      value={
                        customDateStart
                          ? format(customDateStart, "yyyy-MM-dd")
                          : ""
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          const newStart = new Date(e.target.value);
                          setCustomDateStart(newStart);
                          if (customDateEnd && newStart <= customDateEnd) {
                            applyCustomPeriod(newStart, customDateEnd);
                          }
                        }
                      }}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Data Final</Label>
                    <Input
                      type="date"
                      value={
                        customDateEnd ? format(customDateEnd, "yyyy-MM-dd") : ""
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          const newEnd = new Date(e.target.value);
                          setCustomDateEnd(newEnd);
                          if (customDateStart && customDateStart <= newEnd) {
                            applyCustomPeriod(customDateStart, newEnd);
                          }
                        }
                      }}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                {customDateStart &&
                  customDateEnd &&
                  customDateStart > customDateEnd && (
                    <p className="text-red-400 text-sm">
                      ⚠️ Data inicial deve ser anterior à data final
                    </p>
                  )}
              </div>
            )}

            {/* Resumo do Período Ativo */}
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <Label className="text-white font-medium">Período Ativo</Label>
              <div className="mt-2 space-y-1">
                <p className="text-amber-400 font-medium">
                  {filterType === "preset" &&
                    (periodFilter === "day"
                      ? "📅 Hoje"
                      : periodFilter === "week"
                        ? "📅 Esta Semana"
                        : periodFilter === "month"
                          ? "📅 Este Mês"
                          : "📅 Este Ano")}
                  {filterType === "specific" &&
                    dateFilter &&
                    `📆 ${format(dateFilter, "dd/MM/yyyy", { locale: ptBR })}`}
                  {filterType === "custom" &&
                    customDateStart &&
                    customDateEnd &&
                    `🗓️ ${format(customDateStart, "dd/MM/yyyy", { locale: ptBR })} até ${format(customDateEnd, "dd/MM/yyyy", { locale: ptBR })}`}
                </p>
                <p className="text-gray-400 text-sm">
                  📊 {daysInPeriod} {daysInPeriod === 1 ? "dia" : "dias"}{" "}
                  analisados
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Receitas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              R$ {totalIncome.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400">
              {filterType === "preset" &&
                (periodFilter === "day"
                  ? "Hoje"
                  : periodFilter === "week"
                    ? "Esta semana"
                    : periodFilter === "month"
                      ? "Este mês"
                      : "Este ano")}
              {filterType === "specific" &&
                dateFilter &&
                format(dateFilter, "dd/MM/yyyy", { locale: ptBR })}
              {filterType === "custom" &&
                customDateStart &&
                customDateEnd &&
                `${format(customDateStart, "dd/MM", { locale: ptBR })} - ${format(customDateEnd, "dd/MM", { locale: ptBR })}`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Despesas
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              R$ {totalExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400">
              {filterType === "preset" &&
                (periodFilter === "day"
                  ? "Hoje"
                  : periodFilter === "week"
                    ? "Esta semana"
                    : periodFilter === "month"
                      ? "Este mês"
                      : "Este ano")}
              {filterType === "specific" &&
                dateFilter &&
                format(dateFilter, "dd/MM/yyyy", { locale: ptBR })}
              {filterType === "custom" &&
                customDateStart &&
                customDateEnd &&
                `${format(customDateStart, "dd/MM", { locale: ptBR })} - ${format(customDateEnd, "dd/MM", { locale: ptBR })}`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Lucro
            </CardTitle>
            <DollarSign
              className={`h-4 w-4 ${profit >= 0 ? "text-green-400" : "text-red-400"}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${profit >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              R$ {profit.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400">
              {filterType === "preset" &&
                (periodFilter === "day"
                  ? "Hoje"
                  : periodFilter === "week"
                    ? "Esta semana"
                    : periodFilter === "month"
                      ? "Este mês"
                      : "Este ano")}
              {filterType === "specific" &&
                dateFilter &&
                format(dateFilter, "dd/MM/yyyy", { locale: ptBR })}
              {filterType === "custom" &&
                customDateStart &&
                customDateEnd &&
                `${format(customDateStart, "dd/MM", { locale: ptBR })} - ${format(customDateEnd, "dd/MM", { locale: ptBR })}`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Média Diária
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              R$ {dailyAverage.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400">
              Em {daysInPeriod} {daysInPeriod === 1 ? "dia" : "dias"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Cards de Pagamento por Método */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            Receitas por Método de Pagamento
          </CardTitle>
          <CardDescription className="text-gray-400">
            Distribuição das receitas por forma de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 font-medium">PIX</p>
                  <p className="text-white text-xl font-bold">
                    R$ {paymentByMethod.pix.toFixed(2)}
                  </p>
                </div>
                <div className="bg-purple-500 p-2 rounded">
                  <span className="text-white text-xs">📱</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {totalIncome > 0
                  ? ((paymentByMethod.pix / totalIncome) * 100).toFixed(1)
                  : 0}
                % do total
              </p>
            </div>

            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 font-medium">Cartão</p>
                  <p className="text-white text-xl font-bold">
                    R$ {paymentByMethod.cartao.toFixed(2)}
                  </p>
                </div>
                <div className="bg-blue-500 p-2 rounded">
                  <span className="text-white text-xs">💳</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {totalIncome > 0
                  ? ((paymentByMethod.cartao / totalIncome) * 100).toFixed(1)
                  : 0}
                % do total
              </p>
            </div>

            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 font-medium">Dinheiro</p>
                  <p className="text-white text-xl font-bold">
                    R$ {paymentByMethod.dinheiro.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-500 p-2 rounded">
                  <span className="text-white text-xs">💵</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {totalIncome > 0
                  ? ((paymentByMethod.dinheiro / totalIncome) * 100).toFixed(1)
                  : 0}
                % do total
              </p>
            </div>

            <div className="p-4 bg-gray-500/10 rounded-lg border border-gray-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 font-medium">Outros</p>
                  <p className="text-white text-xl font-bold">
                    R$ {paymentByMethod.outros.toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-500 p-2 rounded">
                  <span className="text-white text-xs">❓</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {totalIncome > 0
                  ? ((paymentByMethod.outros / totalIncome) * 100).toFixed(1)
                  : 0}
                % do total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs principais */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger
            value="transactions"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
          >
            <Eye className="mr-2 h-4 w-4" />
            Transações
          </TabsTrigger>
          <TabsTrigger
            value="costs"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
          >
            <TrendingDown className="mr-2 h-4 w-4" />
            Custos
          </TabsTrigger>
          <TabsTrigger
            value="cost-items"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
          >
            <Plus className="mr-2 h-4 w-4" />
            Itens de Custo
          </TabsTrigger>
        </TabsList>

        {/* Transações */}
        <TabsContent value="transactions">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                Transações Financeiras
              </CardTitle>
              <CardDescription className="text-gray-400">
                Histórico de receitas por agendamentos concluídos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-gray-400">Data</TableHead>
                    <TableHead className="text-gray-400">Cliente</TableHead>
                    <TableHead className="text-gray-400">Serviço</TableHead>
                    <TableHead className="text-gray-400">Tipo</TableHead>
                    <TableHead className="text-gray-400">Método</TableHead>
                    <TableHead className="text-gray-400">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow className="border-slate-700">
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-gray-400">
                          <p className="text-lg">
                            📊 Nenhuma transação encontrada
                          </p>
                          <p className="text-sm mt-2">
                            Não há dados para o período selecionado
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        className="border-slate-700"
                      >
                        <TableCell className="text-gray-300">
                          {format(
                            new Date(transaction.transaction_date),
                            "dd/MM/yyyy"
                          )}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {transaction.appointments?.clients?.name ||
                            "Cliente não identificado"}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {transaction.appointments?.services?.name || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              transaction.type === "income"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }
                          >
                            {transaction.type === "income"
                              ? "Receita"
                              : "Despesa"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transaction.payment_method ? (
                            <div className="flex items-center space-x-2">
                              {transaction.payment_method === "pix" && (
                                <>
                                  <span className="text-purple-400">📱</span>
                                  <Badge className="bg-purple-500/20 text-purple-400">
                                    PIX
                                  </Badge>
                                </>
                              )}
                              {transaction.payment_method === "cartao" && (
                                <>
                                  <span className="text-blue-400">💳</span>
                                  <Badge className="bg-blue-500/20 text-blue-400">
                                    Cartão
                                  </Badge>
                                </>
                              )}
                              {transaction.payment_method === "dinheiro" && (
                                <>
                                  <span className="text-green-400">💵</span>
                                  <Badge className="bg-green-500/20 text-green-400">
                                    Dinheiro
                                  </Badge>
                                </>
                              )}
                              {transaction.payment_method?.startsWith(
                                "misto"
                              ) && (
                                <>
                                  <span className="text-amber-400">🔀</span>
                                  <Badge className="bg-amber-500/20 text-amber-400">
                                    Misto
                                  </Badge>
                                </>
                              )}
                              {!["pix", "cartao", "dinheiro"].includes(
                                transaction.payment_method
                              ) &&
                                !transaction.payment_method?.startsWith(
                                  "misto"
                                ) && (
                                  <Badge className="bg-gray-500/20 text-gray-400">
                                    {transaction.payment_method}
                                  </Badge>
                                )}
                            </div>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400">
                              N/A
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-green-400 font-bold">
                          R$ {Number(transaction.amount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custos */}
        <TabsContent value="costs">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">
                  Registros de Custos
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Histórico de gastos e despesas
                </CardDescription>
              </div>
              <Dialog
                open={isAddCostRecordOpen}
                onOpenChange={setIsAddCostRecordOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold">
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Custo
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Registrar Novo Custo
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Registre uma nova despesa
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">Item</Label>
                      <Select
                        value={newCostRecord.cost_item_id}
                        onValueChange={(value) =>
                          setNewCostRecord((prev) => ({
                            ...prev,
                            cost_item_id: value,
                          }))
                        }
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Selecione um item" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {costItems.map((item) => (
                            <SelectItem
                              key={item.id}
                              value={item.id}
                              className="text-white"
                            >
                              {item.name} - R$ {item.unit_price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white">Quantidade</Label>
                      <Input
                        type="number"
                        value={newCostRecord.quantity}
                        onChange={(e) =>
                          setNewCostRecord((prev) => ({
                            ...prev,
                            quantity: e.target.value,
                          }))
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Data da Compra</Label>
                      <Input
                        type="date"
                        value={format(
                          newCostRecord.purchase_date,
                          "yyyy-MM-dd"
                        )}
                        onChange={(e) =>
                          setNewCostRecord((prev) => ({
                            ...prev,
                            purchase_date: new Date(e.target.value),
                          }))
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Observações</Label>
                      <Input
                        value={newCostRecord.notes}
                        onChange={(e) =>
                          setNewCostRecord((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Observações opcionais"
                      />
                    </div>
                    <Button
                      onClick={handleAddCostRecord}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                    >
                      Registrar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-gray-400">Data</TableHead>
                    <TableHead className="text-gray-400">Item</TableHead>
                    <TableHead className="text-gray-400">Categoria</TableHead>
                    <TableHead className="text-gray-400">Quantidade</TableHead>
                    <TableHead className="text-gray-400">Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCostRecords.length === 0 ? (
                    <TableRow className="border-slate-700">
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="text-gray-400">
                          <p className="text-lg">📋 Nenhum custo registrado</p>
                          <p className="text-sm mt-2">
                            Não há despesas para o período selecionado
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCostRecords.map((record) => (
                      <TableRow key={record.id} className="border-slate-700">
                        <TableCell className="text-gray-300">
                          {format(new Date(record.purchase_date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {record.cost_items?.name || "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {record.cost_items?.category || "Sem categoria"}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {record.quantity}
                        </TableCell>
                        <TableCell className="text-red-400 font-bold">
                          R$ {Number(record.total_amount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Itens de Custo */}
        <TabsContent value="cost-items">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Itens de Custo</CardTitle>
                <CardDescription className="text-gray-400">
                  Catálogo de produtos e serviços para controle de custos
                </CardDescription>
              </div>
              <Dialog
                open={isAddCostItemOpen}
                onOpenChange={setIsAddCostItemOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Novo Item de Custo
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Adicione um novo item ao catálogo de custos
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">Nome do Item</Label>
                      <Input
                        value={newCostItem.name}
                        onChange={(e) =>
                          setNewCostItem((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Descrição</Label>
                      <Input
                        value={newCostItem.description}
                        onChange={(e) =>
                          setNewCostItem((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Preço Unitário</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newCostItem.unit_price}
                          onChange={(e) =>
                            setNewCostItem((prev) => ({
                              ...prev,
                              unit_price: e.target.value,
                            }))
                          }
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Categoria</Label>
                        <Input
                          value={newCostItem.category}
                          onChange={(e) =>
                            setNewCostItem((prev) => ({
                              ...prev,
                              category: e.target.value,
                            }))
                          }
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleAddCostItem}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                    >
                      Adicionar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {costItems.map((item) => (
                  <Card
                    key={item.id}
                    className="bg-slate-700/50 border-slate-600"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-gray-400 text-sm">
                              {item.description}
                            </p>
                          )}
                          {item.category && (
                            <Badge
                              variant="secondary"
                              className="mt-1 bg-amber-500/20 text-amber-400"
                            >
                              {item.category}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">
                            R$ {Number(item.unit_price).toFixed(2)}
                          </p>
                          <Badge
                            className={
                              item.active
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }
                          >
                            {item.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialDashboard;
