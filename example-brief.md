# Exemple de Brief Créatif

## Format des briefs générés par La Machine

Le bot génère automatiquement des briefs créatifs avec la structure suivante :

### 📋 Titre du Brief
**Exemple :** "Voyage Temporel Typographique"

### Description
Une description détaillée du projet créatif en 2-3 phrases qui explique le concept et l'objectif.

**Exemple :** "Créez une composition typographique qui représente le voyage dans le temps. Mélangez des styles typographiques de différentes époques pour créer une narration visuelle unique qui raconte l'évolution de l'écriture."

### ✅ Exigences (3-5 points)
1. Format carré 1080x1080px minimum
2. Utiliser au moins 3 polices de caractères différentes
3. Intégrer des éléments graphiques représentant le temps
4. Créer une hiérarchie visuelle claire
5. Inclure au moins une animation ou effet de transition

### ⚠️ Contraintes (2-3 points)
1. Palette limitée à 4 couleurs maximum
2. Pas d'images photoréalistes
3. Le texte doit rester lisible

### ⏰ Deadline
48 heures par défaut (configurable)

---

## Exemples de thématiques variées

Le bot peut générer des briefs dans différents domaines :

- **Design graphique** : Affiches, logos, identités visuelles
- **Illustration** : Personnages, scènes, concepts abstraits
- **Photographie** : Compositions, séries thématiques, expérimentations
- **Animation** : Micro-animations, loops, transitions
- **3D** : Modélisation, texturing, éclairage
- **Typographie** : Lettering, compositions, expérimentations
- **Art génératif** : Patterns, algorithmes visuels, data art
- **UX/UI** : Interfaces, prototypes, micro-interactions

## Configuration Discord

### Commandes disponibles

```
/brief nouveau [duree] [channel]  # Créer un nouveau brief
/brief liste                       # Voir les briefs actifs
/brief terminer <id>              # Marquer un brief comme terminé

/config channel <#channel>        # Définir le channel des briefs
/config duree <heures>           # Durée par défaut (1-168h)
/config auto <true/false>        # Génération automatique
/config voir                     # Configuration actuelle
```

### Génération automatique

Quand activée, le bot :
- Génère un nouveau brief quotidien à 10h
- Renouvelle automatiquement les briefs expirés
- Maintient toujours un brief actif dans le channel configuré