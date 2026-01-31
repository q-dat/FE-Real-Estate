'use client';
import Breadcrumbs from '@/components/userPage/Breadcrumbs';
import { PropertyGallery } from '@/components/userPage/rental/detail/PropertyGallery';
import { IInterior } from '@/types/interiors/interiors.types';
import { mapInteriorImages } from '@/utils/mapInteriorImages.utils';

interface Props {
  interior: IInterior;
}

export default function ClientInteriorDetailPage({ interior }: Props) {
  const images = mapInteriorImages(interior);

  return (
    <div className="pt-mobile-padding-top xl:pt-desktop-padding-top">
      <Breadcrumbs label={`#${interior.category.name}`} />
      <div className="px-2 xl:px-desktop-padding">
        <section>
          <h1 className="mb-2 text-xl font-semibold xl:text-2xl">
            {interior.name}
            {interior.status && <span className="mx-2 rounded-md bg-primary/10 px-2 py-1 text-primary">{interior.status}</span>}
          </h1>
          {images.length > 0 && <PropertyGallery images={images} />}
        </section>
        {interior.description && <p className="text-sm leading-relaxed text-base-content/80">{interior.description}</p>}
      </div>
    </div>
  );
}
