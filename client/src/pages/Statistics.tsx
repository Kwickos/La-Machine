import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  Users,
  Target,
  Activity,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Server,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { useGuilds } from '../hooks/useGuilds';
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
  Badge,
  Skeleton,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';

const MODERN_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

export default function Statistics() {
  const [selectedGuild, setSelectedGuild] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const { data: guilds, isLoading: guildsLoading } = useGuilds();

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['statistics', selectedGuild],
    queryFn: async () => {
      if (!selectedGuild) return null;
      const response = await axios.get(`/api/stats/guild/${selectedGuild}`);
      return response.data.data;
    },
    enabled: !!selectedGuild,
  });

  const metrics = [
    {
      title: 'Total Briefs',
      value: stats?.overview?.total || 0,
      change: '+12%',
      changeType: 'positive',
      icon: Target,
      description: 'Briefs créés au total',
    },
    {
      title: 'Taux d\'engagement',
      value: `${stats?.engagement?.submissionRate?.toFixed(1) || 0}%`,
      change: '+2.5%',
      changeType: 'positive',
      icon: Activity,
      description: 'Pourcentage de participation',
    },
    {
      title: 'Soumissions Moyennes',
      value: stats?.engagement?.avgSubmissions?.toFixed(1) || 0,
      change: '+0.8',
      changeType: 'positive',
      icon: TrendingUp,
      description: 'Soumissions par brief',
    },
    {
      title: 'Participants Actifs',
      value: stats?.topPerformers?.length || 0,
      change: '+3',
      changeType: 'positive',
      icon: Users,
      description: 'Utilisateurs actifs',
    },
  ];

  if (isLoading && selectedGuild) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
          <p className="text-muted-foreground">
            Analysez les performances et l'engagement de votre communauté
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Guild Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <CardTitle>Sélection du Serveur</CardTitle>
          </div>
          <CardDescription>
            Choisissez le serveur dont vous souhaitez analyser les statistiques
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
          </div>
        </CardContent>
      </Card>

      {!selectedGuild ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune donnée sélectionnée</h3>
            <p className="text-muted-foreground text-center">
              Sélectionnez un serveur pour visualiser ses statistiques et analyses.
            </p>
          </CardContent>
        </Card>
      ) : !stats ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune donnée disponible</h3>
            <p className="text-muted-foreground text-center">
              Ce serveur n'a pas encore de données statistiques à afficher.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <CardDescription className="text-sm font-medium">
                      {metric.title}
                    </CardDescription>
                    <metric.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="flex items-center space-x-1 text-xs">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-600">{metric.change}</span>
                      <span className="text-muted-foreground">ce mois</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Analytics Tabs */}
          <Card>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview" className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Vue d'ensemble</span>
                    </TabsTrigger>
                    <TabsTrigger value="engagement" className="flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span className="hidden sm:inline">Engagement</span>
                    </TabsTrigger>
                    <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Classement</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Time Series Chart */}
                      <Card>
                        <CardHeader>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5" />
                            <CardTitle className="text-base">Activité sur 30 jours</CardTitle>
                          </div>
                          <CardDescription>
                            Évolution des briefs et soumissions dans le temps
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats?.timeSeriesData || []}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                              <XAxis 
                                dataKey="_id.day" 
                                className="text-muted-foreground text-xs"
                              />
                              <YAxis className="text-muted-foreground text-xs" />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'hsl(var(--card))', 
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px'
                                }}
                              />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="briefs" 
                                stroke="hsl(var(--primary))" 
                                name="Briefs"
                                strokeWidth={2}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="submissions" 
                                stroke="hsl(var(--chart-2))" 
                                name="Soumissions"
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Category Distribution */}
                      <Card>
                        <CardHeader>
                          <div className="flex items-center space-x-2">
                            <PieChartIcon className="h-5 w-5" />
                            <CardTitle className="text-base">Répartition par Catégorie</CardTitle>
                          </div>
                          <CardDescription>
                            Distribution des briefs par catégorie
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={stats?.categoryDistribution || []}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ _id, count }) => `${_id}: ${count}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                              >
                                {stats?.categoryDistribution?.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={MODERN_COLORS[index % MODERN_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'hsl(var(--card))', 
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px'
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Difficulty Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Distribution par Difficulté</CardTitle>
                        <CardDescription>
                          Répartition des briefs et soumissions par niveau de difficulté
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={stats?.difficultyDistribution || []}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis 
                              dataKey="_id" 
                              className="text-muted-foreground text-xs"
                            />
                            <YAxis className="text-muted-foreground text-xs" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Legend />
                            <Bar dataKey="count" fill="hsl(var(--primary))" name="Nombre de briefs" />
                            <Bar dataKey="submissions" fill="hsl(var(--chart-2))" name="Soumissions" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Engagement Tab */}
                  <TabsContent value="engagement" className="space-y-6">
                    <div className="text-center py-12">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Données d'engagement</h3>
                      <p className="text-muted-foreground">
                        Les statistiques d'engagement détaillées seront affichées ici.
                      </p>
                    </div>
                  </TabsContent>

                  {/* Leaderboard Tab */}
                  <TabsContent value="leaderboard" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Top Contributeurs</CardTitle>
                        <CardDescription>
                          Classement des utilisateurs les plus actifs
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16">Rang</TableHead>
                              <TableHead>Utilisateur</TableHead>
                              <TableHead className="text-right">Soumissions</TableHead>
                              <TableHead className="text-right">Approuvées</TableHead>
                              <TableHead className="text-right">Taux de réussite</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stats?.topPerformers?.map((user: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Badge 
                                    variant={index < 3 ? 'default' : 'secondary'}
                                    className="w-8 h-8 rounded-full p-0 flex items-center justify-center font-bold"
                                  >
                                    {index + 1}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium">{user.username}</TableCell>
                                <TableCell className="text-right">{user.count}</TableCell>
                                <TableCell className="text-right">{user.approved}</TableCell>
                                <TableCell className="text-right">
                                  <Badge variant="outline" className="text-green-700">
                                    {((user.approved / user.count) * 100).toFixed(0)}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            )) || (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                  <p className="text-muted-foreground">Aucun contributeur pour le moment</p>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}