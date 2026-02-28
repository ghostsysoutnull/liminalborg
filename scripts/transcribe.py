import whisper
import sys
import warnings

# Suppress FP16 warning on CPU
warnings.filterwarnings("ignore", message="FP16 is not supported on CPU; using FP32 instead")

def transcribe(file_path):
    try:
        # Using 'base' model for a good balance of speed and accuracy
        model = whisper.load_model("base")
        result = model.transcribe(file_path)
        print(result["text"].strip())
    except Exception as e:
        print(f"Error during transcription: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 transcribe.py <file_path>", file=sys.stderr)
        sys.exit(1)
    
    transcribe(sys.argv[1])
