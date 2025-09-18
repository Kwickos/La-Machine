import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Settings, 
  Server, 
  Zap, 
  Clock, 
  Brain, 
  Hash, 
  Globe, 
  Save,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useGuilds, useGuildDetails } from '../hooks/useGuilds';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Label,
  Input,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  Separator,
  Skeleton
} from '@/components/ui';

export default function ServerConfig() {
  const [selectedGuild, setSelectedGuild] = useState<string>('');
  const [activeTab, setActiveTab] = useState('general');
  const { data: guilds, isLoading: guildsLoading } = useGuilds();
  const { data: guildDetails } = useGuildDetails(selectedGuild);

  const { data: config, refetch, isLoading: configLoading } = useQuery({
    queryKey: ['config', selectedGuild],
    queryFn: async () => {
      if (!selectedGuild) return null;
      const response = await axios.get(`/api/config/guild/${selectedGuild}`);
      return response.data.data;
    },
    enabled: !!selectedGuild,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      return axios.put(`/api/config/guild/${selectedGuild}`, updates);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const handleToggleFeature = (feature: string) => {
    if (!config) return;
    
    updateMutation.mutate({
      features: {
        ...config.features,
        [feature]: !config.features[feature],
      },
    });
  };

  const handleScheduleDayToggle = (dayIndex: number) => {
    if (!config) return;
    
    const days = config.scheduleDays || [];
    const newDays = days.includes(dayIndex)
      ? days.filter((d: number) => d !== dayIndex)
      : [...days, dayIndex];
    updateMutation.mutate({ scheduleDays: newDays });
  };

  const getFeatureIcon = (key: string) => {
    switch (key) {
      case 'aiGeneration': return <Brain className="h-4 w-4" />;
      case 'submissions': return <CheckCircle className="h-4 w-4" />;
      case 'reactions': return <Zap className="h-4 w-4" />;
      case 'notifications': return <AlertCircle className="h-4 w-4" />;
      case 'analytics': return <Settings className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getFeatureName = (key: string) => {
    switch (key) {
      case 'aiGeneration': return 'Génération IA';
      case 'submissions': return 'Soumissions';
      case 'reactions': return 'Réactions automatiques';
      case 'notifications': return 'Notifications';
      case 'analytics': return 'Analytics';
      default: return key;
    }
  };

  const getFeatureDescription = (key: string) => {
    switch (key) {
      case 'aiGeneration': return 'Génération automatique de briefs avec IA';
      case 'submissions': return 'Permet aux utilisateurs de soumettre leurs créations';
      case 'reactions': return 'Réactions automatiques sur les nouveaux briefs';
      case 'notifications': return 'Notifications pour les nouveaux briefs et soumissions';
      case 'analytics': return 'Collecte de données d\'utilisation et statistiques';
      default: return 'Configuration de cette fonctionnalité';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Configuration du Serveur</h1>
        <p className="text-muted-foreground">
          Gérez les paramètres de votre bot pour chaque serveur Discord
        </p>
      </div>

      {/* Guild Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <CardTitle>Sélection du Serveur</CardTitle>
          </div>
          <CardDescription>
            Choisissez le serveur Discord que vous souhaitez configurer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Select value={selectedGuild} onValueChange={setSelectedGuild} disabled={guildsLoading}>
              <SelectTrigger>
                <SelectValue placeholder={
                  guildsLoading ? 'Chargement des serveurs...' : 
                  guilds?.length === 0 ? 'Aucun serveur disponible' : 
                  'Sélectionner un serveur'
                } />
              </SelectTrigger>
              <SelectContent>
                {guilds?.map(guild => (
                  <SelectItem key={guild.id} value={guild.id}>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-primary rounded-full"></div>
                      <span>{guild.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {guilds?.length === 0 && !guildsLoading && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Aucun serveur trouvé. Assurez-vous que vous êtes administrateur et que le bot est présent.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      {selectedGuild && (
        <Card>
          <CardContent className="p-0">
            {configLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            ) : config ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="general" className="flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">Général</span>
                    </TabsTrigger>
                    <TabsTrigger value="features" className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span className="hidden sm:inline">Fonctionnalités</span>
                    </TabsTrigger>
                    <TabsTrigger value="schedule" className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span className="hidden sm:inline">Planification</span>
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="flex items-center space-x-2">
                      <Brain className="h-4 w-4" />
                      <span className="hidden sm:inline">IA</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  {/* General Settings */}
                  <TabsContent value="general" className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">Paramètres Généraux</h3>
                      <p className="text-sm text-muted-foreground">
                        Configuration de base pour votre serveur Discord
                      </p>
                    </div>

                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="briefChannel" className="flex items-center space-x-2">
                          <Hash className="h-4 w-4" />
                          <span>Canal des Briefs</span>
                          <Badge variant="outline" className="text-xs">Requis</Badge>
                        </Label>
                        <Select 
                          value={config.briefChannel || ''} 
                          onValueChange={(value) => updateMutation.mutate({ briefChannel: value })}
                          disabled={!guildDetails || updateMutation.isPending}
                        >
                          <SelectTrigger className="max-w-md">
                            <SelectValue placeholder="Sélectionner un canal" />
                          </SelectTrigger>
                          <SelectContent>
                            {guildDetails?.channels?.map((channel: any) => (
                              <SelectItem key={channel.id} value={channel.id}>
                                # {channel.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Canal où les nouveaux briefs seront publiés
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="language" className="flex items-center space-x-2">
                            <Globe className="h-4 w-4" />
                            <span>Langue</span>
                          </Label>
                          <Select 
                            value={config.language} 
                            onValueChange={(value) => updateMutation.mutate({ language: value })}
                            disabled={updateMutation.isPending}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fr">🇫🇷 Français</SelectItem>
                              <SelectItem value="en">🇺🇸 English</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="timezone">Fuseau Horaire</Label>
                          <Select 
                            value={config.timezone} 
                            onValueChange={(value) => updateMutation.mutate({ timezone: value })}
                            disabled={updateMutation.isPending}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Europe/Paris">Europe/Paris (UTC+1)</SelectItem>
                              <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                              <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Features */}
                  <TabsContent value="features" className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">Fonctionnalités</h3>
                      <p className="text-sm text-muted-foreground">
                        Activez ou désactivez les fonctionnalités selon vos besoins
                      </p>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(config.features || {}).map(([key, enabled]) => (
                        <Card key={key} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="mt-1">
                                {getFeatureIcon(key)}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium">{getFeatureName(key)}</h4>
                                  <Badge variant={enabled ? 'default' : 'secondary'} className="text-xs">
                                    {enabled ? 'Activé' : 'Désactivé'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {getFeatureDescription(key)}
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={enabled as boolean}
                              onCheckedChange={() => handleToggleFeature(key)}
                              disabled={updateMutation.isPending}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Schedule Settings */}
                  <TabsContent value="schedule" className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">Planification Automatique</h3>
                      <p className="text-sm text-muted-foreground">
                        Configurez la publication automatique de briefs
                      </p>
                    </div>

                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                          <h4 className="font-medium">Planification activée</h4>
                          <p className="text-sm text-muted-foreground">
                            Active la publication automatique de briefs
                          </p>
                        </div>
                        <Switch
                          checked={config.scheduleEnabled}
                          onCheckedChange={(checked) => updateMutation.mutate({ scheduleEnabled: checked })}
                          disabled={updateMutation.isPending}
                        />
                      </div>

                      {config.scheduleEnabled && (
                        <div className="space-y-4 pt-4 border-t">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="scheduleTime">Heure de publication</Label>
                              <Input
                                id="scheduleTime"
                                type="time"
                                value={config.scheduleTime}
                                onChange={(e) => updateMutation.mutate({ scheduleTime: e.target.value })}
                                disabled={updateMutation.isPending}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="scheduleFrequency">Fréquence</Label>
                              <Select 
                                value={config.scheduleFrequency} 
                                onValueChange={(value) => updateMutation.mutate({ scheduleFrequency: value })}
                                disabled={updateMutation.isPending}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="daily">📅 Quotidien</SelectItem>
                                  <SelectItem value="weekly">📆 Hebdomadaire</SelectItem>
                                  <SelectItem value="biweekly">🗓️ Bi-hebdomadaire</SelectItem>
                                  <SelectItem value="monthly">📋 Mensuel</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {config.scheduleFrequency === 'weekly' && (
                            <div className="space-y-2">
                              <Label>Jours de la semaine</Label>
                              <div className="flex gap-2">
                                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                                  <Button
                                    key={index}
                                    type="button"
                                    variant={config.scheduleDays?.includes(index) ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => handleScheduleDayToggle(index)}
                                    disabled={updateMutation.isPending}
                                    className="w-10 h-10"
                                  >
                                    {day}
                                  </Button>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Sélectionnez les jours où publier automatiquement
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  </TabsContent>

                  {/* AI Settings */}
                  <TabsContent value="ai" className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">Paramètres IA</h3>
                      <p className="text-sm text-muted-foreground">
                        Configuration des paramètres d'intelligence artificielle
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="aiModel">Modèle IA</Label>
                        <Select 
                          value={config.aiSettings?.model || 'gpt-3.5-turbo'} 
                          onValueChange={(value) => updateMutation.mutate({
                            aiSettings: { ...config.aiSettings, model: value }
                          })}
                          disabled={updateMutation.isPending}
                        >
                          <SelectTrigger className="max-w-md">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4">
                              <div className="space-y-1">
                                <div className="font-medium">GPT-4</div>
                                <div className="text-xs text-muted-foreground">Plus précis, plus lent</div>
                              </div>
                            </SelectItem>
                            <SelectItem value="gpt-3.5-turbo">
                              <div className="space-y-1">
                                <div className="font-medium">GPT-3.5 Turbo</div>
                                <div className="text-xs text-muted-foreground">Plus rapide, moins cher</div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="temperature">
                            Température ({config.aiSettings?.temperature || 0.7})
                          </Label>
                          <div className="space-y-2">
                            <Input
                              id="temperature"
                              type="range"
                              min="0"
                              max="2"
                              step="0.1"
                              value={config.aiSettings?.temperature || 0.7}
                              onChange={(e) => updateMutation.mutate({
                                aiSettings: { ...config.aiSettings, temperature: parseFloat(e.target.value) }
                              })}
                              disabled={updateMutation.isPending}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Conservateur</span>
                              <span>Créatif</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="maxTokens">Tokens Maximum</Label>
                          <Input
                            id="maxTokens"
                            type="number"
                            min="100"
                            max="4000"
                            value={config.aiSettings?.maxTokens || 1000}
                            onChange={(e) => updateMutation.mutate({
                              aiSettings: { ...config.aiSettings, maxTokens: parseInt(e.target.value) }
                            })}
                            disabled={updateMutation.isPending}
                          />
                          <p className="text-xs text-muted-foreground">
                            Limite de tokens pour les réponses IA
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>

                {/* Status Indicator */}
                {updateMutation.isPending && (
                  <div className="fixed bottom-4 right-4">
                    <Card className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Sauvegarde en cours...</span>
                      </div>
                    </Card>
                  </div>
                )}

                {updateMutation.isSuccess && (
                  <div className="fixed bottom-4 right-4">
                    <Card className="p-3 bg-green-50 border-green-200">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800">Configuration sauvegardée</span>
                      </div>
                    </Card>
                  </div>
                )}
              </Tabs>
            ) : (
              <div className="p-8 text-center space-y-4">
                <Info className="h-12 w-12 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Aucune configuration trouvée</h3>
                  <p className="text-muted-foreground">
                    Sélectionnez un serveur pour voir ses paramètres de configuration.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}