'use client';

import Image from 'next/image';
import { MapPin } from 'lucide-react';

export interface TimelineActivity {
  day: number;
  title: string;
  description: string;
  image?: string;
  actionLabel?: string;
}

interface RoteiroTimelineProps {
  activities: TimelineActivity[];
}

const FALLBACK =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop';

export function RoteiroTimeline({ activities }: RoteiroTimelineProps) {
  if (!activities.length) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Roteiro em preparação. Nossa equipe entrará em contato em breve.
      </p>
    );
  }

  return (
    <div className="relative mx-auto max-w-2xl">
      <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-lime via-accent-lime to-gray-300" />
      {activities.map((activity) => (
        <div key={`${activity.day}-${activity.title}`} className="relative mb-10 ml-20">
          <div className="absolute -left-[54px] top-0 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-accent-lime text-sm font-bold text-gray-900 shadow-md">
            {activity.day}
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
            {activity.image && (
              <div className="relative h-40 md:h-48">
                <Image
                  src={activity.image || FALLBACK}
                  alt={activity.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4 md:p-5">
              <h3 className="mb-1 text-base font-bold text-gray-900 md:text-lg">{activity.title}</h3>
              <p className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4 shrink-0" />
                {activity.description}
              </p>
              {activity.actionLabel && (
                <button
                  type="button"
                  className="mt-3 w-full rounded-lg border-2 border-gray-900 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
                >
                  {activity.actionLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
