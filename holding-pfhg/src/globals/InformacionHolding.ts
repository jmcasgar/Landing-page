import type { GlobalConfig } from 'payload'

export const InformacionHolding: GlobalConfig = {
  slug: 'informacion-holding',
  label: 'Información del Holding',
  admin: {
    group: 'Estructura Corporativa',
  },
  fields: [
    { name: 'nombreOficial', type: 'text', required: true },
    { name: 'direccion', type: 'text' },
    { name: 'telefono', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'mision', type: 'textarea' },
  ],
}