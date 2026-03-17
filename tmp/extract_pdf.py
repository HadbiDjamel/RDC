import sys
import os
from pdf2image import convert_from_path
import pytesseract

def extract_text_from_pdf(pdf_path):
    print(f"Processing {pdf_path}...")
    try:
        # Convert PDF to images
        images = convert_from_path(pdf_path)
        full_text = ""
        for i, image in enumerate(images):
            print(f"  OCR page {i+1}/{len(images)}...")
            text = pytesseract.image_to_string(image, lang='fra')
            full_text += f"\n--- PAGE {i+1} ---\n{text}\n"
        return full_text
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_pdf.py <path_to_pdf>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    text = extract_text_from_pdf(pdf_path)
    print(text)
