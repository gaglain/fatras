
import React from "react";
import { CustomColorsForm } from "./CustomColorsForm";

export const ColorsTab: React.FC = () => (
  <div>
    <CustomColorsForm />
    <div className="text-xs text-muted-foreground mt-4">
      Les couleurs s&#39;appliquent immédiatement partout. <br />
      Si certains éléments semblent ne pas réagir, rechargez la page, ou contactez le support.
    </div>
  </div>
);
