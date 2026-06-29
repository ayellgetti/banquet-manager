import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROCUREMENT_ITEMS, type ProcurementItem } from "@/data/procurementOptions";
import { useT } from "@/i18n";
import { useProcurementLabels } from "@/i18n/procurementLabels";
import type { CreateInventoryOrderLineInput } from "@/lib/inventoryOrdersApi";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingMaterialIds: string[];
  onAdd: (item: CreateInventoryOrderLineInput) => void;
};

export const AddMaterialModal = ({ open, onOpenChange, existingMaterialIds, onAdd }: Props) => {
  const { t } = useT();
  const { itemName, unitName } = useProcurementLabels();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProcurementItem | null>(null);
  const [quantity, setQuantity] = useState("1");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return PROCUREMENT_ITEMS.slice(0, 40);

    return PROCUREMENT_ITEMS.filter((item) => {
      const label = itemName(item).toLowerCase();
      return (
        label.includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.unit.toLowerCase().includes(query)
      );
    }).slice(0, 40);
  }, [itemName, search]);

  const reset = () => {
    setSearch("");
    setSelected(null);
    setQuantity("1");
  };

  const handleAdd = () => {
    if (!selected) return;
    const qty = Number.parseFloat(quantity);
    if (!Number.isFinite(qty) || qty <= 0) return;

    onAdd({
      materialId: selected.id,
      materialName: itemName(selected),
      materialCategory: selected.category,
      unit: selected.unit,
      quantity: qty,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("orderInventory.addMaterial")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-hidden">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("orderInventory.searchMaterial")}
            autoFocus
          />

          <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border/70 p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                {t("common.search.noResults")}
              </p>
            ) : (
              filtered.map((item) => {
                const isAdded = existingMaterialIds.includes(item.id);
                const isSelected = selected?.id === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isAdded}
                    onClick={() => setSelected(item)}
                    className={`flex w-full items-start justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/60"
                    } ${isAdded ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <span>
                      <span className="font-medium">{itemName(item)}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {item.category} · {unitName(item.unit)}
                      </span>
                    </span>
                    {isAdded ? (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {t("orderInventory.alreadyAdded")}
                      </span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>

          {selected ? (
            <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3">
              <p className="text-sm font-medium">{itemName(selected)}</p>
              <div className="space-y-2">
                <Label htmlFor="material-qty">{t("orderInventory.quantity")}</Label>
                <Input
                  id="material-qty"
                  type="number"
                  min={0.01}
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button type="button" onClick={handleAdd} disabled={!selected} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("orderInventory.addToOrder")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
