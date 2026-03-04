import React, { useState } from "react";
import type { ZodError } from "zod";

import ContainerPropsSchema, {
  ContainerProps
} from "../../../../documents/blocks/Container/ContainerPropsSchema";

import BaseSidebarPanel from "./helpers/BaseSidebarPanel";
import MultiStylePropertyPanel from "./helpers/style-inputs/MultiStylePropertyPanel";

type ContainerSidebarPanelProps = {
  data: ContainerProps;
  setData: (v: ContainerProps) => void;
};

export default function ContainerSidebarPanel({
  data,
  setData
}: ContainerSidebarPanelProps) {
  const [, setErrors] = useState<ZodError | null>(null);
  const updateData = (d: unknown) => {
    const res = ContainerPropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };
  return (
    <BaseSidebarPanel title="Container block">
      <MultiStylePropertyPanel
        names={["backgroundColor", "borderColor", "borderRadius", "padding"]}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
