import zipfile
import xml.etree.ElementTree as ET

ppt_path = r"C:\Users\rahul\Documents\code\projects\book\HVAC Revenue Recovery PitchDeck.pptx"
text_runs = []

with zipfile.ZipFile(ppt_path, 'r') as z:
    for filename in z.namelist():
        if filename.startswith('ppt/slides/slide') and filename.endswith('.xml'):
            xml_content = z.read(filename)
            root = ET.fromstring(xml_content)
            text_runs.append(f"\n--- {filename} ---")
            for elem in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t'):
                if elem.text:
                    text_runs.append(elem.text)

with open(r"C:\Users\rahul\Documents\code\projects\book\ppt_text.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(text_runs))
