import React, { useState } from 'react';
import { 
  Button,
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Textarea,
  Badge
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';

export default function ComponentsDemo() {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const { toast } = useToast();

  const showToast = (variant: 'default' | 'destructive' = 'default') => {
    toast({
      title: variant === 'destructive' ? 'Erreur!' : 'Succès!',
      description: variant === 'destructive' 
        ? 'Une erreur s\'est produite lors de l\'opération.' 
        : 'L\'opération s\'est déroulée avec succès.',
      variant,
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">ShadCN UI Components Demo</h1>
        <p className="text-muted-foreground mt-2">
          Démonstration des composants ShadCN UI intégrés dans le projet
        </p>
      </div>

      <div className="grid gap-8">
        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Différentes variantes et tailles de boutons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant=\"secondary\">Secondary</Button>
              <Button variant=\"destructive\">Destructive</Button>
              <Button variant=\"outline\">Outline</Button>
              <Button variant=\"ghost\">Ghost</Button>
              <Button variant=\"link\">Link</Button>
            </div>
            <div className=\"flex flex-wrap gap-4 mt-4\">
              <Button size=\"sm\">Small</Button>
              <Button size=\"default\">Default</Button>
              <Button size=\"lg\">Large</Button>
              <Button size=\"icon\">🎨</Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Components */}
        <Card>
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
            <CardDescription>
              Inputs, selects et autres éléments de formulaire
            </CardDescription>
          </CardHeader>
          <CardContent className=\"space-y-6\">
            <div className=\"space-y-2\">
              <Label htmlFor=\"demo-input\">Input Field</Label>
              <Input
                id=\"demo-input\"
                placeholder=\"Tapez quelque chose...\"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>

            <div className=\"space-y-2\">
              <Label htmlFor=\"demo-select\">Select Field</Label>
              <Select value={selectValue} onValueChange={setSelectValue}>
                <SelectTrigger>
                  <SelectValue placeholder=\"Choisissez une option\" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=\"option1\">Option 1</SelectItem>
                  <SelectItem value=\"option2\">Option 2</SelectItem>
                  <SelectItem value=\"option3\">Option 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className=\"space-y-2\">
              <Label htmlFor=\"demo-textarea\">Textarea</Label>
              <Textarea
                id=\"demo-textarea\"
                placeholder=\"Écrivez votre message...\"
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Badges and Status */}
        <Card>
          <CardHeader>
            <CardTitle>Badges & Status</CardTitle>
            <CardDescription>
              Indicateurs de statut et badges informatifs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className=\"flex flex-wrap gap-4\">
              <Badge>Default</Badge>
              <Badge variant=\"secondary\">Secondary</Badge>
              <Badge variant=\"destructive\">Destructive</Badge>
              <Badge variant=\"outline\">Outline</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Dialog Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog & Toasts</CardTitle>
            <CardDescription>
              Modales et notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className=\"flex flex-wrap gap-4\">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant=\"outline\">Ouvrir Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmation</DialogTitle>
                    <DialogDescription>
                      Cette action est irréversible. Êtes-vous sûr de vouloir continuer?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant=\"outline\">Annuler</Button>
                    <Button>Confirmer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button onClick={() => showToast()}>
                Toast Success
              </Button>
              <Button 
                variant=\"destructive\" 
                onClick={() => showToast('destructive')}
              >
                Toast Error
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Complex Card Example */}
        <Card>
          <CardHeader>
            <CardTitle>Example Complex Card</CardTitle>
            <CardDescription>
              Exemple d'utilisation avancée des composants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className=\"space-y-4\">
              <div className=\"flex items-center justify-between\">
                <div className=\"space-y-1\">
                  <h4 className=\"text-sm font-medium\">Brief Designer</h4>
                  <p className=\"text-sm text-muted-foreground\">
                    Créer un design moderne pour une application mobile
                  </p>
                </div>
                <Badge variant=\"secondary\">En cours</Badge>
              </div>
              
              <div className=\"flex items-center space-x-4 text-sm text-muted-foreground\">
                <div className=\"flex items-center\">
                  <span>📅</span>
                  <span className=\"ml-1\">Due le 25/09/2024</span>
                </div>
                <div className=\"flex items-center\">
                  <span>👥</span>
                  <span className=\"ml-1\">5 participants</span>
                </div>
              </div>

              <div className=\"pt-2\">
                <div className=\"flex space-x-2\">
                  <Button size=\"sm\">Voir détails</Button>
                  <Button size=\"sm\" variant=\"outline\">Modifier</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}