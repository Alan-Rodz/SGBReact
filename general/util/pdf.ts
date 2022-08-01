// ********************************************************************************
// == Type ========================================================================
export type PDFJSONBuffer = { type: 'Buffer'; data: number[]; };

// == Util ========================================================================
export const pdfBlobToJSONBuffer = async (pdfBlob: Blob) => Buffer.from(await pdfBlob.arrayBuffer()).toJSON();
export const pdfJSONBufferToURL = (pdfJSONBuffer: PDFJSONBuffer) => window.URL.createObjectURL(new Blob([new Uint8Array(pdfJSONBuffer.data)], { type: 'application/pdf' }))
