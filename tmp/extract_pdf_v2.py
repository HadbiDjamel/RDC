import sys
import os
import PyPDF2

def extract_text_from_pdf(pdf_path):
    print(f"Processing {pdf_path}...")
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            full_text = ""
            for i, page in enumerate(reader.pages):
                print(f"  Extracting page {i+1}/{len(reader.pages)}...")
                text = page.extract_text()
                full_text += f"\n--- PAGE {i+1} ---\n{text}\n"
            return full_text
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_pdf_v2.py <path_to_pdf>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    text = extract_text_from_pdf(pdf_path)
    print(text)
