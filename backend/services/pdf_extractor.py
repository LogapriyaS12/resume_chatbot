import os
from PyPDF2 import PdfReader

class PDFExtractionError(Exception):
    """Exception raised for errors during PDF text extraction."""
    pass

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extracts text content from a PDF file.
    
    Args:
        file_path (str): The absolute or relative path to the PDF file.
        
    Returns:
        str: The extracted plain text content.
        
    Raises:
        PDFExtractionError: If the file does not exist, is not a valid PDF, or extraction fails.
    """
    if not os.path.exists(file_path):
        raise PDFExtractionError(f"File not found at: {file_path}")
        
    if not file_path.lower().endswith('.pdf'):
        raise PDFExtractionError("Invalid file format. Only PDF files are supported.")
        
    try:
        reader = PdfReader(file_path)
        extracted_text = []
        
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                extracted_text.append(page_text)
                
        full_text = "\n".join(extracted_text)
        
        # Strip trailing/leading spaces and clean up
        cleaned_text = "\n".join([line.strip() for line in full_text.splitlines() if line.strip()])
        
        if not cleaned_text.strip():
            raise PDFExtractionError("No text could be extracted from the PDF. It might be scanned or image-only. Ocr is not supported.")
            
        return cleaned_text
        
    except Exception as e:
        if isinstance(e, PDFExtractionError):
            raise e
        raise PDFExtractionError(f"Failed to read PDF file: {str(e)}")
