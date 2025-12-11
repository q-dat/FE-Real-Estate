'use client';
import { IInterior } from '@/types/type/interiors/interiors';
import Image from 'next/image';

interface Props {
  interiors: IInterior[];
}

export default function ClientInteriorsPage({ interiors }: Props) {
  return (
    <div className="px-2 pt-mobile-padding-top xl:px-desktop-padding xl:pt-desktop-padding-top">
      <h1 className="mb-6 text-xl font-semibold xl:text-2xl">Mẫu thiết kế nội thất</h1>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {interiors.map((item) => (
          <article key={item._id} className="rounded-xl bg-base-100 p-4 shadow-md transition-all duration-200 hover:shadow-lg">
            <div className="relative h-56 w-full overflow-hidden rounded-lg">
              <Image src={item.images} alt={item.name} fill className="object-cover" />
            </div>

            <h2 className="mt-4 text-lg font-medium xl:text-xl">{item.name}</h2>

            <p className="mt-1 text-sm opacity-80">{item.description}</p>

            {item.thumbnails && item.thumbnails.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {item.thumbnails.map((thumb, idx) => (
                  <div key={idx} className="relative h-16 w-full overflow-hidden rounded-md">
                    <Image src={thumb} alt={`${item.name}-${idx}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
