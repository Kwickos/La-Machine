import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  FileText, 
  Users, 
  Clock,
  TrendingUp,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Button,
  Skeleton,
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui';
import axios from 'axios';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await axios.get('/api/stats/overview');
      return response.data.data;
    },
  });

  const metricCards = [
    {
      title: 'Total Briefs',
      value: stats?.briefs?.total || 0,
      change: '+12%',
      changeType: 'positive',
      icon: FileText,
      description: 'Tous les briefs créés',
    },
    {
      title: 'Briefs Publiés',
      value: stats?.briefs?.published || 0,
      change: '+8%',
      changeType: 'positive',
      icon: TrendingUp,
      description: 'Briefs actuellement actifs',
    },
    {
      title: 'Soumissions',
      value: stats?.submissions?.total || 0,
      change: '+23%',
      changeType: 'positive',
      icon: Users,
      description: 'Réponses aux briefs',
    },
    {
      title: 'Taux d\'engagement',
      value: `${stats?.engagement?.average || 0}%`,
      change: '-2%',
      changeType: 'negative',
      icon: Activity,
      description: 'Engagement moyen',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'brief_published',
      title: 'Nouveau brief publié',
      description: 'Brief "Interface Design" publié',
      time: 'Il y a 2h',
      icon: FileText,
    },
    {
      id: 2,
      type: 'submissions',
      title: '5 nouvelles soumissions',
      description: 'Brief "Logo Creation"',
      time: 'Il y a 4h',
      icon: Users,
    },
    {
      id: 3,
      type: 'brief_completed',
      title: 'Brief complété',
      description: 'Brief "Design UI" terminé',
      time: 'Il y a 6h',
      icon: TrendingUp,
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenue dans votre tableau de bord. Voici un aperçu de l'activité récente.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
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
                  {metric.changeType === 'positive' ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                  <span className={metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                    {metric.change}
                  </span>
                  <span className="text-muted-foreground">ce mois</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base">Activité Récente</CardTitle>
              <CardDescription>
                Les dernières actions sur la plateforme
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Voir tout</DropdownMenuItem>
                <DropdownMenuItem>Actualiser</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="bg-muted rounded-full p-2">
                  <activity.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.time}
                </Badge>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-6">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucune activité récente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base">Top Contributeurs</CardTitle>
              <CardDescription>
                Les membres les plus actifs
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Voir tout
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.topContributors?.map((user: any, index: number) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={index === 0 ? 'default' : 'secondary'} 
                    className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs font-bold"
                  >
                    {index + 1}
                  </Badge>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.submissions} soumissions
                    </p>
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-6">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucun contributeur pour le moment</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Statistiques Rapides</CardTitle>
            <CardDescription>
              Vue d'ensemble des performances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.stats?.totalViews || 0}
                </div>
                <div className="text-xs text-muted-foreground">Vues totales</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stats?.stats?.completionRate || 0}%
                </div>
                <div className="text-xs text-muted-foreground">Taux de réussite</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {stats?.stats?.avgResponseTime || 0}h
                </div>
                <div className="text-xs text-muted-foreground">Temps de réponse moyen</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {stats?.stats?.activeUsers || 0}
                </div>
                <div className="text-xs text-muted-foreground">Utilisateurs actifs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}