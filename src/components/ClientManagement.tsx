
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { User, Phone, FileText, Edit, Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: number;
  name: string;
  cpf: string;
  phone: string;
  acceptsWhatsapp: boolean;
  totalSpent: number;
  lastVisit: string;
  status: "active" | "blocked";
}

const ClientManagement = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([
    {
      id: 1,
      name: "João Silva Santos",
      cpf: "123.456.789-00",
      phone: "(11) 99999-1111",
      acceptsWhatsapp: true,
      totalSpent: 180,
      lastVisit: "2024-01-20",
      status: "active"
    },
    {
      id: 2,
      name: "Carlos Eduardo Lima",
      cpf: "987.654.321-00",
      phone: "(11) 99999-2222",
      acceptsWhatsapp: false,
      totalSpent: 95,
      lastVisit: "2024-01-18",
      status: "active"
    },
    {
      id: 3,
      name: "Roberto Mendes",
      cpf: "456.789.123-00",
      phone: "(11) 99999-3333",
      acceptsWhatsapp: true,
      totalSpent: 320,
      lastVisit: "2024-01-15",
      status: "blocked"
    }
  ]);

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpf.includes(searchTerm) ||
    client.phone.includes(searchTerm)
  );

  const handleSaveClient = (clientData: Partial<Client>) => {
    if (editingClient) {
      setClients(clients.map(client =>
        client.id === editingClient.id ? { ...client, ...clientData } : client
      ));
      toast({
        title: "Cliente atualizado",
        description: "Dados do cliente foram atualizados com sucesso.",
      });
    } else {
      const newClient: Client = {
        id: Date.now(),
        name: clientData.name || "",
        cpf: clientData.cpf || "",
        phone: clientData.phone || "",
        acceptsWhatsapp: clientData.acceptsWhatsapp || false,
        totalSpent: 0,
        lastVisit: new Date().toISOString().split('T')[0],
        status: "active"
      };
      setClients([...clients, newClient]);
      toast({
        title: "Cliente cadastrado",
        description: "Novo cliente adicionado com sucesso.",
      });
    }
    setEditingClient(null);
    setIsAddingClient(false);
  };

  const toggleClientStatus = (clientId: number) => {
    setClients(clients.map(client =>
      client.id === clientId
        ? { ...client, status: client.status === "active" ? "blocked" : "active" }
        : client
    ));
    
    const client = clients.find(c => c.id === clientId);
    toast({
      title: client?.status === "active" ? "Cliente bloqueado" : "Cliente desbloqueado",
      description: `Status do cliente foi alterado.`,
    });
  };

  const deleteClient = (clientId: number) => {
    setClients(clients.filter(client => client.id !== clientId));
    toast({
      title: "Cliente removido",
      description: "Cliente foi removido do sistema.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gerenciar Clientes</h2>
        <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Adicionar Novo Cliente</DialogTitle>
            </DialogHeader>
            <ClientForm onSave={handleSaveClient} onCancel={() => setIsAddingClient(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Buscar por nome, CPF ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>

      <div className="grid gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-amber-500 p-3 rounded-full">
                    <User className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{client.name}</h3>
                    <div className="flex items-center space-x-4 text-gray-400 text-sm">
                      <span>CPF: {client.cpf}</span>
                      <span>Tel: {client.phone}</span>
                      <span>Gasto: R$ {client.totalSpent}</span>
                      <span>Última visita: {client.lastVisit}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={client.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                        {client.status === "active" ? "Ativo" : "Bloqueado"}
                      </Badge>
                      {client.acceptsWhatsapp && (
                        <Badge className="bg-green-600/20 text-green-400">
                          <Phone className="h-3 w-3 mr-1" />
                          WhatsApp OK
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                        onClick={() => setEditingClient(client)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Editar Cliente</DialogTitle>
                      </DialogHeader>
                      <ClientForm 
                        client={client} 
                        onSave={handleSaveClient} 
                        onCancel={() => setEditingClient(null)} 
                      />
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    className={`border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white`}
                    onClick={() => toggleClientStatus(client.id)}
                  >
                    {client.status === "active" ? "Bloquear" : "Desbloquear"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                    onClick={() => deleteClient(client.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

interface ClientFormProps {
  client?: Client;
  onSave: (client: Partial<Client>) => void;
  onCancel: () => void;
}

const ClientForm = ({ client, onSave, onCancel }: ClientFormProps) => {
  const [formData, setFormData] = useState({
    name: client?.name || "",
    cpf: client?.cpf || "",
    phone: client?.phone || "",
    acceptsWhatsapp: client?.acceptsWhatsapp || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-300">Nome Completo</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="bg-slate-700 border-slate-600 text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf" className="text-gray-300">CPF</Label>
        <Input
          id="cpf"
          value={formData.cpf}
          onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="000.000.000-00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-gray-300">Telefone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="(11) 99999-9999"
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="whatsapp"
          checked={formData.acceptsWhatsapp}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptsWhatsapp: checked }))}
        />
        <Label htmlFor="whatsapp" className="text-gray-300">Aceita contato por WhatsApp</Label>
      </div>

      <div className="flex space-x-2 pt-4">
        <Button type="submit" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold">
          Salvar
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="border-gray-500 text-gray-400">
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default ClientManagement;
