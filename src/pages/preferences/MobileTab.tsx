
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const MobileTab: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Smartphone className="h-5 w-5 mr-2" />
        Applications mobiles
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">
          Les applications mobiles iOS et Android sont en cours de développement.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" disabled className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            App iOS (Bientôt)
          </Button>
          <Button variant="outline" disabled className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            App Android (Bientôt)
          </Button>
        </div>
        <Badge variant="secondary" className="text-xs">
          En attendant, vous pouvez ajouter cette page à votre écran d'accueil
        </Badge>
      </div>
    </CardContent>
  </Card>
);
