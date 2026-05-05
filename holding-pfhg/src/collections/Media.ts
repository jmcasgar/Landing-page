import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',        // Carpeta donde se guardan los archivos
    mimeTypes: ['image/*'],    // Solo imágenes
  },
  fields: [], // No necesita más campos
}