import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Send,
  Filter,
  Search,
  MoreHorizontal,
  FileText,
  Clock,
  Users
} from 'lucide-react';
import axios from 'axios';
import { useGuilds } from '../hooks/useGuilds';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Skeleton,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  Separator
} from '@/components/ui';

export default function Briefs() {
  const [selectedGuild, setSelectedGuild] = useState<string>('');
  const [filter, setFilter] = useState({ status: '', category: '', difficulty: '' });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get real Discord guilds
  const { data: guilds, isLoading: guildsLoading, error: guildsError } = useGuilds();

  const { data: briefs, isLoading, refetch } = useQuery({
    queryKey: ['briefs', selectedGuild, filter, searchQuery],
    queryFn: async () => {
      if (!selectedGuild) return [];
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.category) params.append('category', filter.category);
      if (filter.difficulty) params.append('difficulty', filter.difficulty);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await axios.get(`/api/briefs/guild/${selectedGuild}?${params}`);
      return response.data.data;
    },
    enabled: !!selectedGuild,
  });

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce brief ?')) {
      await axios.delete(`/api/briefs/${id}`);
      refetch();
    }
  };

  const handlePublish = async (id: string) => {
    await axios.post(`/api/briefs/${id}/publish`);
    refetch();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Publié</Badge>;
      case 'draft':
        return <Badge variant="secondary">Brouillon</Badge>;
      case 'archived':
        return <Badge variant="outline">Archivé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Débutant</Badge>;
      case 'Intermédiaire':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Intermédiaire</Badge>;
      case 'Avancé':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Avancé</Badge>;
      default:
        return <Badge variant="outline">{difficulty}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Briefs</h1>
          <p className="text-muted-foreground">
            Créez et gérez vos briefs créatifs pour votre communauté
          </p>
        </div>
        <Button asChild>
          <Link to="/briefs/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Brief
          </Link>
        </Button>
      </div>

      {/* Error message if guilds fail to load */}
      {guildsError && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-destructive rounded-full"></div>
              <p className="text-destructive font-medium">
                Erreur lors du chargement des serveurs. Veuillez vous reconnecter.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-base">Filtres et Recherche</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un brief..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filter selects */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedGuild} onValueChange={setSelectedGuild} disabled={guildsLoading || !!guildsError}>
              <SelectTrigger>
                <SelectValue placeholder={
                  guildsLoading ? 'Chargement...' : 
                  guildsError ? 'Erreur de chargement' :
                  guilds?.length === 0 ? 'Aucun serveur disponible' : 
                  'Sélectionner un serveur'
                } />
              </SelectTrigger>
              <SelectContent>
                {guilds?.map(guild => (
                  <SelectItem key={guild.id} value={guild.id}>
                    {guild.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filter.status} onValueChange={(value) => setFilter({ ...filter, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="published">Publié</SelectItem>
                <SelectItem value="archived">Archivé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filter.category} onValueChange={(value) => setFilter({ ...filter, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les catégories</SelectItem>
                <SelectItem value="Design Graphique">Design Graphique</SelectItem>
                <SelectItem value="Développement Web">Développement Web</SelectItem>
                <SelectItem value="Marketing Digital">Marketing Digital</SelectItem>
                <SelectItem value="Création de Contenu">Création de Contenu</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filter.difficulty} onValueChange={(value) => setFilter({ ...filter, difficulty: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les difficultés" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les difficultés</SelectItem>
                <SelectItem value="Débutant">Débutant</SelectItem>
                <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                <SelectItem value="Avancé">Avancé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Briefs List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {briefs?.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun brief trouvé</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {!selectedGuild 
                    ? "Sélectionnez un serveur pour voir les briefs."
                    : "Commencez par créer votre premier brief créatif."
                  }
                </p>
                {selectedGuild && (
                  <Button asChild>
                    <Link to="/briefs/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Créer votre premier brief
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            briefs?.map((brief: any) => (
              <Card key={brief._id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-foreground">{brief.title}</h3>
                            {getStatusBadge(brief.status)}
                          </div>
                          <p className="text-muted-foreground text-sm line-clamp-2">{brief.content}</p>
                        </div>
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {brief.category}
                          </Badge>
                          {getDifficultyBadge(brief.difficulty)}
                        </div>
                        
                        <Separator orientation="vertical" className="h-4" />
                        
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{brief.submissions?.length || 0} soumissions</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Créé {new Date(brief.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link to={`/briefs/${brief._id}`} className="flex items-center">
                            <Eye className="h-4 w-4 mr-2" />
                            Voir les détails
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/briefs/${brief._id}/edit`} className="flex items-center">
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                        {brief.status === 'draft' && (
                          <DropdownMenuItem 
                            onClick={() => handlePublish(brief._id)}
                            className="flex items-center"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Publier
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(brief._id)}
                          className="flex items-center text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}