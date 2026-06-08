import os
import re

html_path = "video-editing-work.html"
videos_dir = "Videos Edits"

# List all mp4 files
videos = [f for f in os.listdir(videos_dir) if f.endswith('.mp4')]

# Sort them alphabetically or keep as is. Let's sort alphabetically
videos.sort()

cards_html = ""
for i, filename in enumerate(videos):
    title = filename.rsplit('.', 1)[0]
    
    # Calculate delay class
    delay_class = ""
    if i % 3 == 1:
        delay_class = " delay-1"
    elif i % 3 == 2:
        delay_class = " delay-2"
        
    card = f"""                        <!-- Video Card {i+1} -->
                        <div class="x-card fade-up{delay_class}" role="button" data-video="Videos Edits/{filename}">
                            <div class="x-card-thumb">
                                <video src="Videos Edits/{filename}" muted loop playsinline preload="metadata" style="width:100%; height:100%; object-fit:cover; pointer-events:none; filter: brightness(0.7) contrast(1.1); transition: transform 0.6s ease;"></video>
                                <div class="x-hover-overlay"><span>Play Video</span></div>
                            </div>
                            <div class="x-card-content">
                                <span class="x-tag">Video Edit</span>
                                <h3 style="font-size:1.1rem; min-height: 50px;">{title}</h3>
                            </div>
                        </div>
"""
    cards_html += card

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace everything inside <div class="x-grid mt-4" id="projectGrid"> ... </div>
# Use regex to find the block
pattern = r'(<div class="x-grid mt-4" id="projectGrid">)(.*?)(                    </div>\s+</div>\s+</section>)'

def repl(match):
    return match.group(1) + "\n" + cards_html + match.group(3)

new_content = re.sub(pattern, repl, content, flags=re.DOTALL)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Updated HTML with {len(videos)} video cards.")
