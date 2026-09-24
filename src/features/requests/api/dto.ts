// Wire types for the hosted SOA API (OpenAPI spec: /openapi/v1.json).

export interface DocumentInfoDto {
  id: string
  name: string
  /** int64; the spec allows it to serialise as a string. */
  size: number | string
  uploadedDate?: string | null
  blobPath: string
  contentType?: string | null
  kind?: string | null
}

export interface SoaExtractionRequestDto {
  id: string
  requestId: string
  type: string
  title: string
  description?: string | null
  submittedDate: string
  status?: string | null
  /** Why the extraction failed; set only while status is 'Failed'. */
  error?: string | null
  documentSections?: string[] | null
  documents: DocumentInfoDto[]
}

export interface SoaVisitDto {
  visitId?: string | null
  phase?: string | null
  period?: string | null
  week?: string | null
  studyDay?: string | null
  hour?: string | null
  visitWindow?: string | null
}

export interface SoaProcedureDto {
  procedureId?: string | null
  name?: string | null
}

export interface SoaScheduleItemDto {
  visitId?: string | null
  procedureId?: string | null
}

export interface SoaFootnoteDto {
  footnoteId?: string | null
  procedureIds?: string[] | null
  text?: string | null
}

export interface SoaTableDto {
  caption?: string | null
  visits?: SoaVisitDto[] | null
  procedures?: SoaProcedureDto[] | null
  scheduleItems?: SoaScheduleItemDto[] | null
  footnotes?: SoaFootnoteDto[] | null
}

export interface SoaTableExtractionResultDto {
  id: string
  requestId: string
  type: string
  documentId: string
  extractedDate: string
  soaTable?: SoaTableDto | null
}

export interface UploadDocumentResponseDto {
  requestId: string
  status: string
}

export interface SoaExtractionResponseDto {
  requestId: string
}

export interface ErrorResponseDto {
  error: string
  requestId?: string | null
}
