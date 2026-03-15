import { Fragment, type ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import type { BandConfig, PricingRow } from '../utils/calcEngine';

interface TierTabsProps {
  bands: Array<{ band: BandConfig; rows: PricingRow[] }>;
  renderContent: (rows: PricingRow[], band: BandConfig, index: number) => ReactNode;
  activeBand?: number;
  onBandChange?: (index: number) => void;
}

export function TierTabs({ bands, renderContent, activeBand, onBandChange }: TierTabsProps) {
  return (
    <Tabs
      value={String(activeBand ?? 0)}
      onValueChange={(v) => onBandChange?.(Number(v))}
      defaultValue="0"
    >
      <TabsList className="mb-4">
        {bands.map((b, i) => (
          <Fragment key={i}>
            <TabsTrigger value={String(i)}>
              {b.band.label}
            </TabsTrigger>
          </Fragment>
        ))}
      </TabsList>
      {bands.map((b, i) => (
        <Fragment key={i}>
          <TabsContent value={String(i)}>
            {renderContent(b.rows, b.band, i)}
          </TabsContent>
        </Fragment>
      ))}
    </Tabs>
  );
}
