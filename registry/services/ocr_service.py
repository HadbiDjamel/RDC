import pytesseract
from pdf2image import convert_from_path
import PIL.Image

def extract_text_from_pdf(pdf_path):
    """
    Perform OCR on a pathology report (Anapath).
    Requires Tesseract-OCR installed on the system.
    """
    try:
        pages = convert_from_path(pdf_path)
        text_content = ""
        for page in pages:
            text_content += pytesseract.image_to_string(page, lang='fra')
        return text_content
    except Exception as e:
        return f"OCR Error: {str(e)}"

def process_anapath_report(pdf_path):
    """
    Full pipeline: PDF -> OCR -> SARA AI -> Structured Data.
    """
    text = extract_text_from_pdf(pdf_path)
    # Then pass 'text' to SARA for coding
    return text
