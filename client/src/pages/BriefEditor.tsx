import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Save,
  ArrowLeft,
  Plus,
  X,
  FileText,
  Target,
  Settings,
  Tag,
  AlertTriangle,
  CheckCircle,
  Info
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
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Separator,
  ScrollArea
} from '@/components/ui';

export default function BriefEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  // Get real Discord guilds
  const { data: guilds, isLoading: guildsLoading } = useGuilds();

  const [formData, setFormData] = useState({
    guildId: '',
    title: '',
    content: '',
    category: 'Design Graphique',
    difficulty: 'Débutant',
    objectives: [''],
    constraints: [''],
    deliverables: [''],
    tags: [''],
  });

  const { data: brief, isLoading: briefLoading } = useQuery({
    queryKey: ['brief', id],
    queryFn: async () => {
      const response = await axios.get(`/api/briefs/${id}`);
      return response.data.data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (brief) {
      setFormData({
        guildId: brief.guildId,
        title: brief.title,
        content: brief.content,
        category: brief.category,
        difficulty: brief.difficulty,
        objectives: brief.objectives || [''],
        constraints: brief.constraints || [''],
        deliverables: brief.deliverables || [''],
        tags: brief.tags || [''],
      });
    }
  }, [brief]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const cleanedData = {
        ...formData,
        objectives: formData.objectives.filter(o => o.trim()),
        constraints: formData.constraints.filter(c => c.trim()),
        deliverables: formData.deliverables.filter(d => d.trim()),
        tags: formData.tags.filter(t => t.trim()),
      };

      if (isEdit) {
        return axios.put(`/api/briefs/${id}`, cleanedData);
      } else {
        return axios.post('/api/briefs', cleanedData);
      }
    },
    onSuccess: () => {
      navigate('/briefs');
    },
  });

  const handleArrayFieldChange = (field: string, index: number, value: string) => {
    const newArray = [...(formData as any)[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field: string) => {
    setFormData({ ...formData, [field]: [...(formData as any)[field], ''] });
  };

  const removeArrayField = (field: string, index: number) => {
    const newArray = [...(formData as any)[field]];
    newArray.splice(index, 1);
    setFormData({ ...formData, [field]: newArray.length > 0 ? newArray : [''] });
  };

  if (isEdit && briefLoading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-muted rounded w-1/4"></div>
                      <div className="h-20 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/briefs')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Modifier le Brief' : 'Nouveau Brief'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Modifiez les détails du brief existant' : 'Créez un nouveau brief créatif pour votre communauté'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }} className="space-y-6">
          
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <CardTitle>Informations Générales</CardTitle>
              </div>
              <CardDescription>
                Définissez les informations de base de votre brief
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Guild Selection */}
              <div className="space-y-2">
                <Label htmlFor="guildId" className="flex items-center gap-2">
                  Serveur Discord
                  <Badge variant="outline" className="text-xs">Requis</Badge>
                </Label>
                <Select 
                  value={formData.guildId} 
                  onValueChange={(value) => setFormData({ ...formData, guildId: value })}
                  disabled={guildsLoading || isEdit}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      guildsLoading ? 'Chargement...' : 
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
                {isEdit && (
                  <p className="text-xs text-muted-foreground">
                    Le serveur ne peut pas être modifié après création
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                  Titre du Brief
                  <Badge variant="outline" className="text-xs">Requis</Badge>
                </Label>
                <Input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Création d'une identité visuelle moderne"
                  className="text-lg"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content" className="flex items-center gap-2">
                  Description
                  <Badge variant="outline" className="text-xs">Requis</Badge>
                </Label>
                <Textarea
                  id="content"
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  placeholder="Décrivez le brief en détail. Soyez clair sur le contexte, les attentes et les objectifs..."
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.content.length} caractères
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <CardTitle>Configuration</CardTitle>
              </div>
              <CardDescription>
                Catégorisez et configurez la difficulté de votre brief
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Design Graphique">Design Graphique</SelectItem>
                      <SelectItem value="Développement Web">Développement Web</SelectItem>
                      <SelectItem value="Marketing Digital">Marketing Digital</SelectItem>
                      <SelectItem value="Création de Contenu">Création de Contenu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Niveau de Difficulté</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Débutant">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Débutant
                        </div>
                      </SelectItem>
                      <SelectItem value="Intermédiaire">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          Intermédiaire
                        </div>
                      </SelectItem>
                      <SelectItem value="Avancé">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Avancé
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Objectives */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <CardTitle>Objectifs</CardTitle>
              </div>
              <CardDescription>
                Définissez les objectifs spécifiques que les participants doivent atteindre
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.objectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={objective}
                      onChange={(e) => handleArrayFieldChange('objectives', index, e.target.value)}
                      placeholder={`Objectif ${index + 1}`}
                    />
                  </div>
                  {formData.objectives.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayField('objectives', index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayField('objectives')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un objectif
              </Button>
            </CardContent>
          </Card>

          {/* Constraints and Deliverables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Constraints */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <CardTitle className="text-base">Contraintes</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Limites et restrictions à respecter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.constraints.map((constraint, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={constraint}
                        onChange={(e) => handleArrayFieldChange('constraints', index, e.target.value)}
                        placeholder={`Contrainte ${index + 1}`}
                      />
                    </div>
                    {formData.constraints.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayField('constraints', index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField('constraints')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une contrainte
                </Button>
              </CardContent>
            </Card>

            {/* Deliverables */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <CardTitle className="text-base">Livrables</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Ce qui doit être produit et livré
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.deliverables.map((deliverable, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={deliverable}
                        onChange={(e) => handleArrayFieldChange('deliverables', index, e.target.value)}
                        placeholder={`Livrable ${index + 1}`}
                      />
                    </div>
                    {formData.deliverables.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayField('deliverables', index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField('deliverables')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un livrable
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Tags */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Tag className="h-5 w-5" />
                <CardTitle>Tags</CardTitle>
              </div>
              <CardDescription>
                Ajoutez des mots-clés pour faciliter la recherche (optionnel)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input
                  id="tags"
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
                  placeholder="design, créativité, innovation (séparés par des virgules)"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.filter(tag => tag.trim()).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>
                    {isEdit ? 'Les modifications seront sauvegardées' : 'Le brief sera créé en mode brouillon'}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/briefs')}
                    disabled={saveMutation.isPending}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="min-w-[120px]"
                  >
                    {saveMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Enregistrement...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Save className="h-4 w-4" />
                        <span>{isEdit ? 'Mettre à jour' : 'Créer le Brief'}</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}