import os
import tempfile

from dotenv import load_dotenv
from openai import OpenAI
from flask import Flask, request, jsonify
from flask_cors import CORS
from markitdown import MarkItDown

# 1) Load environment variables (for local dev, if you have a .env file).
load_dotenv()

# 2) Validate your OpenAI API key
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY is not set in environment variables.")

# 3) Create an OpenAI client using the new style
client = OpenAI(
    api_key=api_key
)

# 4) Create Flask app and enable CORS
app = Flask(__name__)
CORS(app)

# Initialize MarkItDown
md = MarkItDown()

# Replace "gpt-4o" with a valid model your account has access to (e.g. gpt-3.5-turbo, gpt-4, etc.)
gpt_model = "gpt-4o"

@app.route('/api/summarize', methods=['POST'])
def summarize_document():
    """
    Endpoint to summarize a .docx file based on a user-defined prompt.
    Expects:
      - form-data 'file' for the .docx upload
      - form-data 'prompt' for the summary instructions
    """
    print("Received request to /api/summarize")
    # DEBUG prints
    print("request.content_type:", request.content_type)
    print("request.form:", request.form)
    print("request.files:", request.files)
    
    try:
        # Retrieve file and prompt from the request
        uploaded_file = request.files.get('file')
        prompt = request.form.get('prompt', '')
        
        print(f"Received file: {uploaded_file.filename if uploaded_file else 'None'}")
        print(f"Received prompt: {prompt}")
        
        # Validate incoming data
        if not uploaded_file or uploaded_file.filename == "":
            return jsonify({"error": "No .docx file provided"}), 400
        
        if uploaded_file.content_type not in [
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword"
        ]:
            return jsonify({"error": "Only .docx files are supported"}), 400
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        # Store the file in a temporary location so MarkItDown can process it
        with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as temp_file:
            temp_file.write(uploaded_file.read())
            temp_file_path = temp_file.name
        
        try:
            print("Processing file with MarkItDown")
            # Extract text from .docx
            parse_result = md.convert(temp_file_path)
            extracted_text = parse_result.text_content
            
            print("Generating summary with OpenAI")
            # Use the new-style client to create a chat completion
            response = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": (
                            "Summarize the following text based on the user instructions:\n\n"
                            f"Text:\n{extracted_text}\n\n"
                            f"User prompt:\n{prompt}\n\n"
                            "Summary:"
                        )
                    }
                ],
                model=gpt_model
            )
            
            summary = response.choices[0].message.content.strip()
            print("Summary generated successfully")

            return jsonify({"summary": summary}), 200
        
        except Exception as e:
            print(f"Error during processing: {str(e)}")
            return jsonify({"error": str(e)}), 500
        
        finally:
            # Cleanup temporary file
            os.remove(temp_file_path)
    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

# For local debugging:
if __name__ == '__main__':
    app.run(debug=True)
