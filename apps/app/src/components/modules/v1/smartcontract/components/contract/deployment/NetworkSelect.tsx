import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NetworkSelectProps {
  selectedNetworkId: string;
  setSelectedNetworkId: (value: string) => void;
  networks: any[];
  networksLoading: boolean;
}

export const NetworkSelect = ({
  selectedNetworkId,
  setSelectedNetworkId,
  networks,
  networksLoading,
}: NetworkSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="network">Select Network</Label>
      <Select value={selectedNetworkId} onValueChange={setSelectedNetworkId}>
        <SelectTrigger id="network">
          <SelectValue placeholder="Select a network" />
        </SelectTrigger>
        <SelectContent>
          {networksLoading ? (
            <SelectItem value="loading" disabled>
              Loading networks...
            </SelectItem>
          ) : networks.length === 0 ? (
            <SelectItem value="none" disabled>
              No networks available
            </SelectItem>
          ) : (
            networks.map((network) => (
              <SelectItem key={network.id} value={network.id}>
                {network.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
