import type { RoomItem } from '../types';
import { RoomStatusCard } from './RoomStatusCard';

export function FloorMap({ rooms }: { rooms: RoomItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rooms.map((room) => <RoomStatusCard key={room.id} room={room} />)}
    </div>
  );
}
