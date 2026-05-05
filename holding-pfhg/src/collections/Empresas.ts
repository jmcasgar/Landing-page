import type { CollectionConfig } from 'payload'

export const Empresas: CollectionConfig = {
  slug: 'empresas', // Nombre en la API y en la URL del admin
  labels: {
    singular: 'Empresa',
    plural: 'Empresas',
  },
  admin: {
    useAsTitle: 'nombre', // Campo que se usará como título en la lista
    group: 'Estructura Corporativa', // Agrupa colecciones en el menú lateral
  },
  fields: [
    {
      name: 'nombre',
      type: 'text',
      required: true,
    },
    {
      name: 'cif',
      label: 'CIF / NIT',
      type: 'text',
      required: true,
    },
    {
      name: 'sector',
      type: 'text',
    },
    {
      name: 'sitioWeb',
      label: 'Sitio Web',
      type: 'text',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media', // Lo crearemos luego
    },
    {
      name: 'descripcion',
      type: 'richText',
    },
    {
      name: 'activa',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}