"use client";

import * as React from "react";
import type {
  EnvelopeElement,
  EnvelopeType,
  Orientation,
  BoundaryCondition,
} from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Plus, Trash2 } from "lucide-react";
import { uid, cn } from "@/lib/utils";
import { DEFAULT_U_VALUES } from "@/lib/defaults/uvalues";

const TYPES: EnvelopeType[] = ["wall", "roof", "floor", "window", "door"];
const ORIENTATIONS: Orientation[] = [
  "N", "NE", "E", "SE", "S", "SW", "W", "NW", "horizontal",
];
const BOUNDARIES: BoundaryCondition[] = [
  "outside",
  "ground",
  "unconditioned",
  "adjacent_conditioned",
];

export function EnvelopeElementTable({
  envelope,
  onChange,
}: {
  envelope: EnvelopeElement[];
  onChange: (e: EnvelopeElement[]) => void;
}) {
  function add() {
    const el: EnvelopeElement = {
      id: uid(),
      name: "Wall",
      type: "wall",
      area: 10,
      uValue: 0.35,
      orientation: "N",
      boundary: "outside",
    };
    onChange([...envelope, el]);
  }

  function update(idx: number, patch: Partial<EnvelopeElement>) {
    onChange(envelope.map((e, i) => (i === idx ? { ...e, ...patch } : e)));
  }

  function remove(idx: number) {
    onChange(envelope.filter((_, i) => i !== idx));
  }

  function applyPreset(idx: number, presetId: string) {
    const preset = DEFAULT_U_VALUES.find((p) => p.id === presetId);
    if (!preset) return;
    update(idx, { uValue: preset.uValue, type: preset.type });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-xs">
            <tr className="text-left text-muted-foreground">
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Area m²</Th>
              <Th>U W/m²K</Th>
              <Th>Preset</Th>
              <Th>Orient.</Th>
              <Th>Boundary</Th>
              <Th>SHGC</Th>
              <Th>Shading</Th>
              <Th>Glass m²</Th>
              <Th>ψ·L W/K</Th>
              <Th>Adj. T° W</Th>
              <Th>Adj. T° S</Th>
              <Th className="sticky right-0 bg-muted/40 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.1)]">
                Del.
              </Th>
            </tr>
          </thead>
          <tbody>
            {envelope.length === 0 && (
              <tr>
                <td colSpan={14} className="text-center text-muted-foreground p-6">
                  No envelope elements yet.
                </td>
              </tr>
            )}
            {envelope.map((el, idx) => (
              <tr key={el.id} className="border-t">
                <Td>
                  <Input
                    value={el.name}
                    onChange={(e) => update(idx, { name: e.target.value })}
                    className="h-8"
                  />
                </Td>
                <Td>
                  <Select
                    value={el.type}
                    onChange={(e) => update(idx, { type: e.target.value as EnvelopeType })}
                    className="h-8"
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    value={el.area}
                    onChange={(e) => update(idx, { area: Math.max(0, Number(e.target.value)) })}
                    className="h-8 w-20"
                  />
                </Td>
                <Td>
                  <Input
                    type="number"
                    step="0.01"
                    min={0.001}
                    value={el.uValue}
                    onChange={(e) => update(idx, { uValue: Math.max(0.001, Number(e.target.value)) })}
                    className="h-8 w-20"
                  />
                </Td>
                <Td>
                  <Select
                    value=""
                    onChange={(e) => e.target.value && applyPreset(idx, e.target.value)}
                    className="h-8 w-32"
                  >
                    <option value="">…</option>
                    {DEFAULT_U_VALUES.filter((p) => p.type === el.type).map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Select
                    value={el.orientation}
                    onChange={(e) =>
                      update(idx, { orientation: e.target.value as Orientation })
                    }
                    className="h-8 w-24"
                  >
                    {ORIENTATIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Select
                    value={el.boundary}
                    onChange={(e) =>
                      update(idx, { boundary: e.target.value as BoundaryCondition })
                    }
                    className="h-8 w-36"
                  >
                    {BOUNDARIES.map((b) => (
                      <option key={b} value={b}>{b.replace("_", " ")}</option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Input
                    type="number"
                    step="0.05"
                    min={0}
                    max={1}
                    value={el.shgc ?? ""}
                    placeholder={el.type === "window" ? "0.55" : "—"}
                    onChange={(e) =>
                      update(idx, {
                        shgc: e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                    className="h-8 w-16"
                  />
                </Td>
                <Td>
                  <Input
                    type="number"
                    step="0.05"
                    min={0}
                    max={1}
                    value={el.shadingFactor ?? ""}
                    placeholder={el.type === "window" ? "1.0" : "—"}
                    onChange={(e) =>
                      update(idx, {
                        shadingFactor:
                          e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                    className="h-8 w-16"
                  />
                </Td>
                <Td>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    value={el.glassArea ?? ""}
                    placeholder={el.type === "window" ? String(el.area) : "—"}
                    onChange={(e) =>
                      update(idx, {
                        glassArea:
                          e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="h-8 w-16"
                  />
                </Td>
                <Td>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    value={el.thermalBridgeWPerK ?? ""}
                    onChange={(e) =>
                      update(idx, {
                        thermalBridgeWPerK:
                          e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="h-8 w-16"
                  />
                </Td>
                <Td>
                  <Input
                    type="number"
                    step="0.5"
                    value={el.adjacentTemperatureWinter ?? ""}
                    placeholder={el.boundary === "outside" ? "—" : "auto"}
                    onChange={(e) =>
                      update(idx, {
                        adjacentTemperatureWinter:
                          e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                    className="h-8 w-16"
                  />
                </Td>
                <Td>
                  <Input
                    type="number"
                    step="0.5"
                    value={el.adjacentTemperatureSummer ?? ""}
                    placeholder={el.boundary === "outside" ? "—" : "auto"}
                    onChange={(e) =>
                      update(idx, {
                        adjacentTemperatureSummer:
                          e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                    className="h-8 w-16"
                  />
                </Td>
                <Td className="sticky right-0 bg-background shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.1)]">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(idx)}
                    title="Delete element"
                    className="hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <Button variant="outline" onClick={add}>
          <Plus className="size-4" />
          Add element
        </Button>
      </div>
    </div>
  );
}

const Th = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <th className={cn("px-2 py-2 font-medium whitespace-nowrap", className)}>
    {children}
  </th>
);
const Td = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <td className={cn("px-2 py-1.5 align-middle", className)}>{children}</td>
);
