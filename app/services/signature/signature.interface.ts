import type { ZapsignDocumentStatus } from '@prisma/client'

export enum ZapSignSignerStatus {
  new = 'new',
  link_opened = 'link-opened',
  signed = 'signed',
}

/** This format is taken from the ZapSign docs 
/   https://docs.zapsign.com.br/v/english/documentos/criar-documento-via-modelo#create-document-via-template
*/
export interface RequestSignatureResponse {
  open_id: number
  token: string
  status: ZapsignDocumentStatus
  name: string
  original_file: string
  signed_file: string | null
  created_at: Date
  last_update_at: Date
  signers: {
    token: string
    status: ZapSignSignerStatus
    email: string
    phone_country: string
    phone_number: string
    times_viewed: number
    last_view_at: string | null
    signed_at: string | null
  }[]
}

/** This format is taken from the ZapSign docs 
/   https://docs.zapsign.com.br/v/english/documentos/detalhar-documento
*/
export interface SignatureDetailsResponse {
  sandbox: boolean
  external_id: string
  open_id: number
  token: string
  name: string
  folder_path: string
  status: ZapsignDocumentStatus
  lang: string
  original_file: string
  signed_file: string | null
  extra_docs: {
    open_id: number
    token: string
    name: string
    original_file: string
    signed_file: string | null
  }[]
  created_through: number
  deleted: boolean
  deleted_at: Date | null
  signed_file_only_finished: boolean
  disable_signer_emails: boolean
  brand_logo: string
  brand_primary_color: string
  created_at: Date
  last_update_at: Date
  created_by: {
    email: string
  }
  signers: {
    external_id: string
    token: 'ca63b929-c053-4f7b-8680-8f0380ca4a57'
    status: ZapSignSignerStatus
    name: string
    lock_name: boolean
    email: string
    lock_email: boolean
    phone_country: string
    phone_number: string
    lock_phone: boolean
    times_viewed: number
    last_view_at: Date | null
    signed_at: Date | null
    auth_mode: string
    qualification: string
    require_selfie_photo: boolean
    require_document_photo: boolean
    geo_latitude: string | null
    geo_longitude: string | null
    redirect_link: string
  }[]
}
