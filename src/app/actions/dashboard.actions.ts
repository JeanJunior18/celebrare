'use server';

import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';

import { createEvent } from '@/application/use-cases/create-event.use-case';
import { createGalleryPhoto } from '@/application/use-cases/create-gallery-photo.use-case';
import { createGiftItem } from '@/application/use-cases/create-gift-item.use-case';
import { getNextGalleryDisplayOrder } from '@/application/use-cases/get-next-gallery-display-order.use-case';
import { updateEventHero } from '@/application/use-cases/update-event-hero.use-case';
import { updateEventSection } from '@/application/use-cases/update-event-section.use-case';
import type { Event, SectionKey } from '@/domain/entities/event';
import type { BabyAgeStage } from '@/domain/enums/baby-age-stage';
import type { GiftCategory } from '@/domain/enums/gift-category';
import { auth } from '@/infrastructure/auth/auth';
import type { AdminGalleryActionResult } from '@/app/actions/admin-gallery.actions';
import type { AdminGiftActionResult } from '@/app/actions/admin-gift.actions';
import { PostgresAdminGalleryRepository } from '@/infrastructure/postgres/admin-gallery-repository.postgres';
import { PostgresAdminGiftRepository } from '@/infrastructure/postgres/admin-gift-repository.postgres';
import { db } from '@/infrastructure/postgres/client';
import { PostgresEventRepository } from '@/infrastructure/postgres/event-repository.postgres';
import { createMediaStorage } from '@/infrastructure/storage/s3-media-storage';

async function requireHostUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autenticado.');
  return session.user.id;
}

async function requireHostEvent(): Promise<Event> {
  const ownerUserId = await requireHostUserId();
  const repository = new PostgresEventRepository(db);
  const event = await repository.findByOwnerUserId(ownerUserId);
  if (!event) throw new Error('Você ainda não tem um evento criado.');
  return event;
}

async function requireHostEventId(): Promise<string> {
  return (await requireHostEvent()).id;
}

export interface CreateDashboardEventResult {
  success: boolean;
  message?: string;
}

export async function createDashboardEventAction(
  _prevState: CreateDashboardEventResult | null,
  formData: FormData,
): Promise<CreateDashboardEventResult> {
  try {
    const ownerUserId = await requireHostUserId();
    const repository = new PostgresEventRepository(db);

    const result = await createEvent(repository, {
      ownerUserId,
      themeId: String(formData.get('themeId') ?? ''),
      slug: String(formData.get('slug') ?? ''),
      honoreeName: String(formData.get('honoreeName') ?? ''),
      subtitleLabel: String(formData.get('subtitleLabel') ?? ''),
      eventDate: String(formData.get('eventDate') ?? ''),
      eventTime: String(formData.get('eventTime') ?? ''),
      venueName: String(formData.get('venueName') ?? ''),
      venueAddress: String(formData.get('venueAddress') ?? ''),
      googleMapsUrl: formData.get('googleMapsUrl')?.toString() || undefined,
      quoteText: formData.get('quoteText')?.toString() || undefined,
      quoteReference: formData.get('quoteReference')?.toString() || undefined,
      pixKey: formData.get('pixKey')?.toString() || undefined,
      pixQrCodeUrl: formData.get('pixQrCodeUrl')?.toString() || undefined,
    });

    if (!result.success) {
      return { success: false, message: 'Esse link (slug) já está em uso — escolha outro.' };
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, message: error.issues[0]?.message ?? 'Dados inválidos.' };
    }
    return { success: false, message: error instanceof Error ? error.message : 'Erro inesperado.' };
  }
}

export async function createDashboardGiftItemAction(
  _prevState: AdminGiftActionResult | null,
  formData: FormData,
): Promise<AdminGiftActionResult> {
  try {
    const eventId = await requireHostEventId();
    const repository = new PostgresAdminGiftRepository(db, createMediaStorage());

    const imageField = formData.get('image');
    const image = imageField instanceof File && imageField.size > 0 ? imageField : undefined;

    await createGiftItem(repository, {
      eventId,
      name: String(formData.get('name') ?? ''),
      description: formData.get('description')?.toString() || undefined,
      category: formData.get('category') as GiftCategory,
      sizeLabel: formData.get('sizeLabel')?.toString() || undefined,
      quantityNeeded: Number(formData.get('quantityNeeded') ?? 1),
      purchaseUrl: formData.get('purchaseUrl')?.toString() || undefined,
      image,
      imageUrl: formData.get('imageUrl')?.toString() || undefined,
    });

    revalidatePath('/dashboard/gifts');
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Erro inesperado.' };
  }
}

export async function getDashboardNextDisplayOrderAction(): Promise<number> {
  const eventId = await requireHostEventId();
  const repository = new PostgresAdminGalleryRepository(db, createMediaStorage());
  return getNextGalleryDisplayOrder(repository, eventId);
}

export async function createDashboardGalleryPhotoAction(
  _prevState: AdminGalleryActionResult | null,
  formData: FormData,
): Promise<AdminGalleryActionResult> {
  try {
    const eventId = await requireHostEventId();
    const repository = new PostgresAdminGalleryRepository(db, createMediaStorage());

    await createGalleryPhoto(repository, {
      eventId,
      ageLabel: formData.get('ageLabel') as BabyAgeStage,
      displayOrder: Number(formData.get('displayOrder') ?? 0),
      image: formData.get('image') as File,
    });

    revalidatePath('/dashboard/gallery');
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Erro inesperado.' };
  }
}

export interface UpdateDashboardEventSectionResult {
  success: boolean;
  message?: string;
}

export async function updateDashboardEventSectionAction(
  _prevState: UpdateDashboardEventSectionResult | null,
  formData: FormData,
): Promise<UpdateDashboardEventSectionResult> {
  try {
    const event = await requireHostEvent();
    const repository = new PostgresEventRepository(db);

    await updateEventSection(repository, event, {
      section: formData.get('section') as SectionKey,
      visible: formData.get('visible') === 'on',
      copy: {
        title: formData.get('title')?.toString() ?? '',
        subtitle: formData.get('subtitle')?.toString() ?? '',
        description: formData.get('description')?.toString() ?? '',
      },
    });

    revalidatePath('/dashboard/edit');
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Erro inesperado.' };
  }
}

export interface UpdateDashboardEventHeroResult {
  success: boolean;
  message?: string;
}

export async function updateDashboardEventHeroAction(
  _prevState: UpdateDashboardEventHeroResult | null,
  formData: FormData,
): Promise<UpdateDashboardEventHeroResult> {
  try {
    const event = await requireHostEvent();
    const repository = new PostgresEventRepository(db, createMediaStorage());

    const imageField = formData.get('image');
    const image = imageField instanceof File && imageField.size > 0 ? imageField : undefined;

    await updateEventHero(repository, event, {
      image,
      imageUrl: formData.get('imageUrl')?.toString() || undefined,
      heroIntro: formData.get('heroIntro')?.toString() || undefined,
    });

    revalidatePath('/dashboard/edit');
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Erro inesperado.' };
  }
}
