
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, TrendingUp, TrendingDown, DollarSign, Plus, Filter, Eye } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const FinancialDashboard = () => {
  const [dateFilter, setDateFilter] = useState<Date | undefined>(new Date());
  const [periodFilter, setPeriodFilter] = useState("month");
  const [isAddCostItemOpen, setIsAddCostItemOpen] = useState(false);
  const [isAddCostRecordOpen, setIsAddCostRecordOpen] = useState(false);
  const [newCostItem, setNewCostItem] = useState({
    name: "",
    description: "",
    unit_price: "",
    category: ""
  });
  const [newCostRecord, setNewCostRecord] = useState({
    cost_item_id: "",
    quantity: "1",
    purchase_date: new Date(),
    notes: ""
  });

  // Buscar transações financeiras
  const { data: transactions = [], refetch: refetchTransactions } = useQuery({
    queryKey: ['financial-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          appointments (
            clients (name),
            services (name)
          )
        `)
        .order('transaction_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
      return data;
    }
  });

  // Buscar items de custo
  const { data: costItems = [], refetch: refetchCostItems } = useQuery({
    queryKey: ['cost-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_items')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching cost items:', error);
        return [];
      }
      return data;
    }
  });

  // Buscar registros de custo
  const { data: costRecords = [], refetch: refetchCostRecords } = useQuery({
    queryKey: ['cost-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_records')
        .select(`
          *,
          cost_items (name, category, unit_price)
        `)
        .order('purchase_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching cost records:', error);
        return [];
      }
      return data;
    }
  });

  // Calcular estatísticas financeiras
  const calculateStats = () => {
    const now = new Date();
    let startDate, endDate;

    switch (periodFilter) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
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

    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.transaction_date);
      return transactionDate >= startDate && transactionDate < endDate;
    });

    const filteredCostRecords = costRecords.filter(c => {
      const purchaseDate = new Date(c.purchase_date);
      return purchaseDate >= startDate && purchaseDate < endDate;
    });

    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = filteredCostRecords
      .reduce((sum, c) => sum + Number(c.total_amount), 0);

    const profit = totalIncome - totalExpenses;

    return { totalIncome, totalExpenses, profit, filteredTransactions, filteredCostRecords };
  };

  const { totalIncome, totalExpenses, profit } = calculateStats();

  const handleAddCostItem = async () => {
    if (!newCostItem.name || !newCostItem.unit_price) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }

    const { error } = await supabase
      .from('cost_items')
      .insert([{
        name: newCostItem.name,
        description: newCostItem.description || null,
        unit_price: parseFloat(newCostItem.unit_price),
        category: newCostItem.category || null
      }]);

    if (error) {
      console.error('Error adding cost item:', error);
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

    const selectedItem = costItems.find(item => item.id === newCostRecord.cost_item_id);
    if (!selectedItem) return;

    const totalAmount = selectedItem.unit_price * parseInt(newCostRecord.quantity);

    const { error } = await supabase
      .from('cost_records')
      .insert([{
        cost_item_id: newCostRecord.cost_item_id,
        quantity: parseInt(newCostRecord.quantity),
        total_amount: totalAmount,
        purchase_date: format(newCostRecord.purchase_date, 'yyyy-MM-dd'),
        notes: newCostRecord.notes || null
      }]);

    if (error) {
      console.error('Error adding cost record:', error);
      toast.error("Erro ao registrar custo");
      return;
    }

    toast.success("Custo registrado com sucesso!");
    setNewCostRecord({
      cost_item_id: "",
      quantity: "1",
      purchase_date: new Date(),
      notes: ""
    });
    setIsAddCostRecordOpen(false);
    refetchCostRecords();
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros Financeiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="day" className="text-white">Hoje</SelectItem>
                <SelectItem value="week" className="text-white">Esta Semana</SelectItem>
                <SelectItem value="month" className="text-white">Este Mês</SelectItem>
                <SelectItem value="year" className="text-white">Este Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">R$ {totalIncome.toFixed(2)}</div>
            <p className="text-xs text-gray-400">
              {periodFilter === 'day' ? 'Hoje' : 
               periodFilter === 'week' ? 'Esta semana' :
               periodFilter === 'month' ? 'Este mês' : 'Este ano'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">R$ {totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-gray-400">
              {periodFilter === 'day' ? 'Hoje' : 
               periodFilter === 'week' ? 'Esta semana' :
               periodFilter === 'month' ? 'Este mês' : 'Este ano'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Lucro</CardTitle>
            <DollarSign className={`h-4 w-4 ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              R$ {profit.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400">
              {periodFilter === 'day' ? 'Hoje' : 
               periodFilter === 'week' ? 'Esta semana' :
               periodFilter === 'month' ? 'Este mês' : 'Este ano'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="transactions" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <Eye className="mr-2 h-4 w-4" />
            Transações
          </TabsTrigger>
          <TabsTrigger value="costs" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <TrendingDown className="mr-2 h-4 w-4" />
            Custos
          </TabsTrigger>
          <TabsTrigger value="cost-items" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <Plus className="mr-2 h-4 w-4" />
            Itens de Custo
          </TabsTrigger>
        </TabsList>

        {/* Transações */}
        <TabsContent value="transactions">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Transações Financeiras</CardTitle>
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
                    <TableHead className="text-gray-400">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="border-slate-700">
                      <TableCell className="text-gray-300">
                        {format(new Date(transaction.transaction_date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {transaction.appointments?.clients?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {transaction.appointments?.services?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge className={transaction.type === 'income' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                          {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-green-400 font-bold">
                        R$ {Number(transaction.amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
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
                <CardTitle className="text-white">Registros de Custos</CardTitle>
                <CardDescription className="text-gray-400">
                  Histórico de gastos e despesas
                </CardDescription>
              </div>
              <Dialog open={isAddCostRecordOpen} onOpenChange={setIsAddCostRecordOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold">
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Custo
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Registrar Novo Custo</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Registre uma nova despesa
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">Item</Label>
                      <Select value={newCostRecord.cost_item_id} onValueChange={(value) => setNewCostRecord(prev => ({ ...prev, cost_item_id: value }))}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Selecione um item" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {costItems.map((item) => (
                            <SelectItem key={item.id} value={item.id} className="text-white">
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
                        onChange={(e) => setNewCostRecord(prev => ({ ...prev, quantity: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white" 
                      />
                    </div>
                    <div>
                      <Label className="text-white">Data da Compra</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(newCostRecord.purchase_date, "dd/MM/yyyy")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600">
                          <Calendar
                            mode="single"
                            selected={newCostRecord.purchase_date}
                            onSelect={(date) => setNewCostRecord(prev => ({ ...prev, purchase_date: date || new Date() }))}
                            initialFocus
                            className="text-white"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label className="text-white">Observações</Label>
                      <Input 
                        value={newCostRecord.notes}
                        onChange={(e) => setNewCostRecord(prev => ({ ...prev, notes: e.target.value }))}
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
                  {costRecords.map((record) => (
                    <TableRow key={record.id} className="border-slate-700">
                      <TableCell className="text-gray-300">
                        {format(new Date(record.purchase_date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {record.cost_items?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {record.cost_items?.category || 'Sem categoria'}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {record.quantity}
                      </TableCell>
                      <TableCell className="text-red-400 font-bold">
                        R$ {Number(record.total_amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
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
              <Dialog open={isAddCostItemOpen} onOpenChange={setIsAddCostItemOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Novo Item de Custo</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Adicione um novo item ao catálogo de custos
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">Nome do Item</Label>
                      <Input 
                        value={newCostItem.name}
                        onChange={(e) => setNewCostItem(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white" 
                      />
                    </div>
                    <div>
                      <Label className="text-white">Descrição</Label>
                      <Input 
                        value={newCostItem.description}
                        onChange={(e) => setNewCostItem(prev => ({ ...prev, description: e.target.value }))}
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
                          onChange={(e) => setNewCostItem(prev => ({ ...prev, unit_price: e.target.value }))}
                          className="bg-slate-700 border-slate-600 text-white" 
                        />
                      </div>
                      <div>
                        <Label className="text-white">Categoria</Label>
                        <Input 
                          value={newCostItem.category}
                          onChange={(e) => setNewCostItem(prev => ({ ...prev, category: e.target.value }))}
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
                  <Card key={item.id} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold">{item.name}</h3>
                          {item.description && (
                            <p className="text-gray-400 text-sm">{item.description}</p>
                          )}
                          {item.category && (
                            <Badge variant="secondary" className="mt-1 bg-amber-500/20 text-amber-400">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">R$ {Number(item.unit_price).toFixed(2)}</p>
                          <Badge className={item.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
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
