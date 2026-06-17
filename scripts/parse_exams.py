import zipfile
import xml.etree.ElementTree as ET
import re
import json
import os

# XML Namespaces
NS = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
}

def parse_docx(file_path):
    print(f"Parsing {file_path}...")
    with zipfile.ZipFile(file_path) as z:
        xml_content = z.read('word/document.xml')
        root = ET.fromstring(xml_content)
        
        paragraphs = []
        current_numId = None
        list_counter = 0
        
        for elem in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            p_text = []
            for t_elem in elem.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
                if t_elem.text:
                    p_text.append(t_elem.text)
            
            text = "".join(p_text).strip()
            
            # Extract list properties (numId)
            pPr = elem.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/pPr}')
            # Fallback namespace check
            if pPr is None:
                pPr = elem.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}pPr')
                
            numId = None
            if pPr is not None:
                numPr = pPr.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}numPr')
                if numPr is None:
                    numPr = pPr.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/numPr}')
                    
                if numPr is not None:
                    numId_el = numPr.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}numId')
                    if numId_el is None:
                        numId_el = numPr.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/numId}')
                    if numId_el is not None:
                        numId = numId_el.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val') or numId_el.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/val}')
            
            if numId is not None:
                if numId != current_numId:
                    current_numId = numId
                    list_counter = 1
                else:
                    list_counter += 1
                if text:
                    text = f"{list_counter}. {text}"
            else:
                current_numId = None
                list_counter = 0
            
            image_ids = []
            for drawing in elem.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}drawing'):
                for blip in drawing.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}blip'):
                    embed_id = blip.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
                    if embed_id:
                        image_ids.append(embed_id)
            
            paragraphs.append({
                'text': text,
                'image_ids': image_ids
            })
            
        rels_text = z.read('word/_rels/document.xml.rels')
        rels_root = ET.fromstring(rels_text)
        rel_map = {}
        for rel in rels_root.iter('{http://schemas.openxmlformats.org/package/2006/relationships}Relationship'):
            rel_id = rel.get('Id')
            rel_target = rel.get('Target')
            if rel_id and rel_target:
                rel_map[rel_id] = os.path.basename(rel_target)
                
    return paragraphs, rel_map

def extract_images(file_path, output_dir, rel_map):
    os.makedirs(output_dir, exist_ok=True)
    with zipfile.ZipFile(file_path) as z:
        for f in z.namelist():
            if f.startswith('word/media/'):
                base = os.path.basename(f)
                out_path = os.path.join(output_dir, base)
                with open(out_path, 'wb') as out_f:
                    out_f.write(z.read(f))
                print(f"Extracted image: {base}")

def format_links(text):
    url_pattern = r'(https?://[^\s\)]+)'
    return re.sub(url_pattern, r'<a href="\1" target="_blank" rel="noopener noreferrer" style="color: var(--accent-secondary); text-decoration: underline;">\1</a>', text)

def check_and_format_matching_table(content_p):
    try:
        terms_idx = -1
        for idx, p in enumerate(content_p):
            if "Generative AI terms:" in p:
                terms_idx = idx
                break
        
        if terms_idx == -1:
            return content_p
            
        terms = content_p[terms_idx+1 : terms_idx+6]
        desc_p = content_p[terms_idx+6]
        
        if not desc_p.startswith("Descriptions:"):
            return content_p
            
        desc_parts = re.split(r'\s+(?=[A-E]\.)', desc_p)
        descs = desc_parts[1:]
        
        table_html = [
            '<table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden;">',
            '  <thead>',
            '    <tr style="background: rgba(255, 255, 255, 0.03); border-bottom: 2px solid var(--border-color); text-align: left;">',
            '      <th style="padding: 0.8rem; font-weight: 700; width: 35%;">Generative AI Term</th>',
            '      <th style="padding: 0.8rem; font-weight: 700; width: 65%;">Description</th>',
            '    </tr>',
            '  </thead>',
            '  <tbody>'
        ]
        
        for i in range(5):
            raw_term = terms[i] if i < len(terms) else ""
            clean_term = re.sub(r'^\d+\.\s*', '', raw_term).strip()
            term_text = f"{i+1}. {clean_term}" if clean_term else ""
            desc_text = descs[i].strip() if i < len(descs) else ""
            table_html.append('    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">')
            table_html.append(f'      <td style="padding: 0.8rem; font-weight: 600; color: var(--accent-secondary); vertical-align: top;">{term_text}</td>')
            table_html.append(f'      <td style="padding: 0.8rem; color: var(--text-secondary); vertical-align: top; line-height: 1.4;">{desc_text}</td>')
            table_html.append('    </tr>')
            
        table_html.append('  </tbody>')
        table_html.append('</table>')
        
        new_content_p = content_p[:terms_idx] + ["\n".join(table_html)] + content_p[terms_idx+7:]
        return new_content_p
        
    except Exception as e:
        print(f"Error formatting table: {e}")
        return content_p

def format_explanation(explanation_paragraphs, options, correct_answers):
    formatted = []
    in_correct_list = False
    in_incorrect_list = False
    
    correct_option_texts = [options[idx] for idx in correct_answers if idx < len(options)]
    incorrect_option_texts = [opt for idx, opt in enumerate(options) if idx not in correct_answers]
    
    i = 0
    while i < len(explanation_paragraphs):
        p = explanation_paragraphs[i]
        
        if p == "\n\n<strong>Correct Option:</strong>":
            if in_incorrect_list:
                formatted.append("</ul>")
                in_incorrect_list = False
            formatted.append(p)
            formatted.append("<ul style='list-style-type: disc; padding-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.8rem;'>")
            in_correct_list = True
            i += 1
            continue
        elif p == "\n\n<strong>Incorrect Options:</strong>":
            if in_correct_list:
                formatted.append("</ul>")
                in_correct_list = False
            formatted.append(p)
            formatted.append("<ul style='list-style-type: disc; padding-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.8rem;'>")
            in_incorrect_list = True
            i += 1
            continue
            
        matched_option = None
        
        # Check correct options
        for opt_text in correct_option_texts:
            if p.startswith(opt_text):
                matched_option = opt_text
                break
                
        # Check incorrect options
        if not matched_option:
            for opt_text in incorrect_option_texts:
                if p.startswith(opt_text):
                    matched_option = opt_text
                    break
                    
        if matched_option:
            rest = p[len(matched_option):].strip()
            # Strip standard separators
            if rest.startswith("-"):
                rest = rest[1:].strip()
            elif rest.startswith("-\u00a0") or rest.startswith("\u00a0-"):
                rest = rest.replace("-\u00a0", "").replace("\u00a0-", "").strip()
            elif rest.startswith("–"): # en dash
                rest = rest[1:].strip()
                
            if rest:
                bullet_content = f"<strong>{matched_option}</strong> — {rest}"
            else:
                bullet_content = f"<strong>{matched_option}</strong>"
                
            formatted.append(f"<li style='margin-bottom: 0.8rem; line-height: 1.6;'>{bullet_content}</li>")
        else:
            # Not an option paragraph. Close lists if open.
            if in_correct_list:
                formatted.append("</ul>")
                in_correct_list = False
            elif in_incorrect_list:
                formatted.append("</ul>")
                in_incorrect_list = False
                
            formatted.append(p)
            
        i += 1
        
    if in_correct_list or in_incorrect_list:
        formatted.append("</ul>")
        
    return formatted

def process_paragraphs(paragraphs, rel_map, cert_id=""):
    questions = []
    
    # Split paragraphs into chunks starting with Question X
    q_chunks = []
    current_chunk = []
    for p in paragraphs:
        text = p['text']
        if re.match(r'^Question\s+\d+', text):
            if current_chunk:
                q_chunks.append(current_chunk)
            current_chunk = [p]
        else:
            if current_chunk:
                current_chunk.append(p)
    if current_chunk:
        q_chunks.append(current_chunk)
        
    markers = {
        'Correct selection', 'Correct answer', 'Your answer is correct', 
        'Your answer is incorrect', 'Your selection is correct', 'Your selection is incorrect'
    }
    
    for chunk in q_chunks:
        header = chunk[0]['text']
        q_match = re.match(r'^Question\s+(\d+)(Correct|Incorrect|Skipped)?', header)
        if not q_match:
            continue
            
        q_num = int(q_match.group(1))
        status = q_match.group(2) or "Skipped"
        
        # Find 'Overall explanation' index
        exp_idx = -1
        for idx, p in enumerate(chunk):
            if p['text'] == "Overall explanation":
                exp_idx = idx
                break
                
        if exp_idx == -1:
            continue
            
        # Keep paragraphs that have either text OR image embeds
        block = chunk[1:exp_idx]
        block = [p for p in block if p['text'].strip() or p['image_ids']]
        
        # Process the question content and options
        content_p = []
        correct_indices = []
        
        for bp in block:
            text = bp['text']
            if text in markers:
                if text in ['Correct selection', 'Correct answer', 'Your selection is correct', 'Your answer is correct']:
                    correct_indices.append(len(content_p))
            elif text.strip():
                content_p.append(text)
                
        # Apply matching table formatter if applicable
        content_p = check_and_format_matching_table(content_p)
        
        # Determine number of options
        is_select_three = any(re.search(r'(select|choose)\s+(three|3)', p.lower()) for p in content_p)
        is_select_two = any(re.search(r'(select|choose)\s+(two|2)', p.lower()) for p in content_p)
        num_options = 6 if is_select_three else (5 if is_select_two else 4)
        
        options = content_p[-num_options:]
        question_text = "\n".join(content_p[:-num_options])
        
        offset = len(content_p) - num_options
        adjusted_correct = [idx - offset for idx in correct_indices if offset <= idx < len(content_p)]
        
        # Process explanation chunk
        explanation_chunk = chunk[exp_idx + 1:]
        explanation_paragraphs = []
        refs = []
        domain = ""
        
        for ep_idx, ep in enumerate(explanation_chunk):
            text = ep['text'].strip()
            
            # Generate image HTML tags if images exist in this paragraph
            img_htmls = []
            for img_id in ep['image_ids']:
                if img_id in rel_map:
                    img_name = rel_map[img_id]
                    img_path = f"/images/{cert_id}/{img_name}" if cert_id else f"/images/{img_name}"
                    img_htmls.append(f'<div style="display: flex; justify-content: center; margin: 1.5rem 0;"><img src="{img_path}" style="max-width: 100%; max-height: 320px; border-radius: 8px; border: 1px solid var(--border-color); object-fit: contain;" /></div>')
            
            if text:
                lower_text = text.lower()
                if lower_text.startswith("references:") or lower_text.startswith("reference:"):
                    urls = re.findall(r'https?://[^\s]+', text)
                    refs.extend(urls)
                elif lower_text == "domain":
                    pass
                elif ep_idx > 0 and explanation_chunk[ep_idx-1]['text'].strip().lower() == "domain":
                    domain = text
                elif lower_text.startswith("domain:") or lower_text.startswith("domain :"):
                    parts = re.split(r'(?i)domain\s*:', text)
                    if len(parts) > 1 and parts[1].strip():
                        domain = parts[1].strip()
                else:
                    if lower_text.startswith("correct option:") or lower_text.startswith("correct options:"):
                        explanation_paragraphs.append("\n\n<strong>Correct Option:</strong>")
                    elif lower_text.startswith("incorrect options:") or lower_text.startswith("incorrect option:"):
                        explanation_paragraphs.append("\n\n<strong>Incorrect Options:</strong>")
                    else:
                        formatted_text = format_links(text)
                        explanation_paragraphs.append(formatted_text)
            
            # Append images immediately inside the text sequence
            explanation_paragraphs.extend(img_htmls)
            
                    
        # Apply bolding and bullet list layout mapping
        formatted_exp = format_explanation(explanation_paragraphs, options, adjusted_correct)
        
        questions.append({
            'id': q_num,
            'status': status,
            'question_text': question_text,
            'options': options,
            'correct_answers': adjusted_correct,
            'explanation': "\n".join(formatted_exp),
            'references': refs,
            'domain': domain
        })
        
    return questions

# Parse files
CERT_MAPPING = {
    'AWS MLE': 'mle_associate',
    'AWS SAA': 'sa_associate',
    'AWS SAP': 'sa_professional',
    'AWS DVA': 'dv_associate',
    'AWS DEA': 'de_associate',
    'AWS CloudOps': 'sysops_associate',
    'AWS SCS C03': 'security_specialty',
    'AWS AWS DevOpsProf & Network Specialty': 'devops_professional'
}

base_dir = 'QuestionBank'
os.makedirs('public/data', exist_ok=True)

for folder_name, cert_id in CERT_MAPPING.items():
    folder_path = os.path.join(base_dir, folder_name)
    if not os.path.isdir(folder_path):
        print(f"Directory not found: {folder_path}")
        continue
        
    output_data = {}
    test_idx = 1
    
    for filename in sorted(os.listdir(folder_path)):
        if filename.endswith('.docx') and not filename.startswith('~'):
            filepath = os.path.join(folder_path, filename)
            img_out_dir = f'public/images/{cert_id}'
            
            paragraphs, rel_map = parse_docx(filepath)
            extract_images(filepath, img_out_dir, rel_map)
            
            questions = process_paragraphs(paragraphs, rel_map, cert_id)
            title = f"{folder_name} - Practice Exam - #{test_idx}"
            output_data[f"test_{test_idx}"] = {
                "title": title,
                "questions": questions
            }
            test_idx += 1
            
    if output_data:
        json_path = f'public/data/{cert_id}.json'
        with open(json_path, 'w') as f:
            json.dump(output_data, f, indent=2)
        print(f"Saved {json_path} with {len(output_data)} tests.")

print("Parsed successfully!")
