"""
Medivision Backend -- Proper AI/ML Flask API
============================================
- POST /predict        : Gemini Vision -> rich medical analysis
- POST /chat           : Stateful medical chatbot with conversation history
- POST /symptom-check  : NLP symptom triage & risk assessment
- GET  /health         : Service health + AI status
- GET  /diseases       : Supported condition catalogue
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from PIL import Image
from google import genai
from google.genai import types
from groq import Groq
import os, io, json, time, random, re, textwrap, base64

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# -------------------------------------------------------
#  Configure AI providers
# -------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_VISION_MODEL = os.getenv("GROQ_VISION_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct")
GROQ_CHAT_MODEL = os.getenv("GROQ_CHAT_MODEL", "llama-3.1-8b-instant")
GROQ_TRIAGE_MODEL = os.getenv("GROQ_TRIAGE_MODEL", GROQ_CHAT_MODEL)

VISION_AI_ENABLED = bool(GROQ_API_KEY)
CHAT_AI_ENABLED = bool(GROQ_API_KEY)

if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)

if not VISION_AI_ENABLED:
    print("WARNING: GROQ_API_KEY not set -- /predict will run in MOCK mode.")

if CHAT_AI_ENABLED:
    groq_client = Groq(api_key=GROQ_API_KEY)
else:
    print("WARNING: GROQ_API_KEY not set -- /chat and /symptom-check will use fallback mode.")

# -------------------------------------------------------
#  Medical Query Validator
# -------------------------------------------------------
def _is_medical_query(text: str) -> tuple[bool, str]:
    """
    Validates if a query is related to medical/health topics.
    Returns (is_medical: bool, reason: str)
    """
    if not text or len(text.strip()) < 3:
        return False, "Query too short to validate."
    
    text_lower = text.lower().strip()
    
    # Medical keywords (symptoms, diseases, medications, health-related)
    medical_keywords = {
        # Symptoms
        "fever", "cough", "pain", "ache", "headache", "sore", "itchy", "rash",
        "swelling", "nausea", "vomiting", "diarrhea", "constipation", "fatigue",
        "weakness", "dizziness", "vertigo", "chills", "cramps", "spasm", "twitch",
        "bleeding", "discharge", "bruise", "burn", "cut", "wound", "fracture",
        "strain", "sprain", "numbness", "tingling", "paralysis", "tremor",
        
        # Conditions & Diseases
        "diabetes", "hypertension", "pneumonia", "influenza", "covid", "coronavirus",
        "cancer", "arthritis", "asthma", "allergy", "migraine", "cold", "flu",
        "infection", "inflammation", "anemia", "obesity", "depression", "anxiety",
        "insomnia", "heart", "cardiac", "stroke", "blood pressure", "cholesterol",
        "kidney", "liver", "stomach", "intestine", "thyroid", "ulcer", "gastritis",
        "dermatitis", "eczema", "psoriasis", "acne", "fungal", "bacterial", "viral",
        "malaria", "typhoid", "hepatitis", "tuberculosis", "bronchitis", "sinusitis",
        "conjunctivitis", "otitis", "meningitis", "encephalitis", "arthritis",
        
        # Medical Topics
        "medicine", "medication", "drug", "treatment", "therapy", "vaccine",
        "immunization", "surgery", "operation", "physical therapy", "rehabilitation",
        "diagnosis", "symptom", "disease", "illness", "disorder", "syndrome",
        "health", "wellness", "fitness", "exercise", "diet", "nutrition", "weight",
        "pregnancy", "childbirth", "maternal", "pediatric", "geriatric", "mental health",
        "psychiatry", "psychology", "dental", "dental", "orthopedic", "cardiology",
        "neurology", "dermatology", "oncology", "gastroenterology", "urology",
        "pediatrics", "gynecology", "obstetrics", "pulmonology", "nephrology",
        "endocrinology", "rheumatology", "ophthalmology", "otolaryngology",
        "anesthesia", "radiology", "pathology", "pharmacology", "toxicology",
        "epidemiology", "public health", "occupational health",
        
        # Medical Actions/Requests
        "doctor", "physician", "hospital", "clinic", "patient", "treatment",
        "prescription", "dosage", "side effect", "adverse", "contraindication",
        "consultation", "checkup", "examination", "test", "lab", "x-ray", "mri",
        "ultrasound", "scan", "blood test", "vaccination", "medical advice",
        "health advice", "wellness tip", "prevention", "precaution", "symptom relief",
        "recovery", "rehabilitation", "convalescence", "disability", "chronic",
        "acute", "emergency", "urgent care", "icu", "specialist", "consulting",
        "home remedy", "natural remedy", "ayurveda", "homeopathy", "traditional medicine",
    }
    
    # Non-medical keywords (to catch off-topic queries)
    non_medical_keywords = {
        "code", "programming", "python", "javascript", "software", "database",
        "movie", "film", "actor", "music", "song", "album", "artist",
        "sports", "football", "cricket", "basketball", "game", "gaming",
        "math", "physics", "chemistry", "history", "geography", "politics",
        "weather", "climate", "recipe", "cooking", "food", "restaurant",
        "travel", "hotel", "flight", "booking", "ticket", "price",
        "car", "bike", "vehicle", "engine", "technology", "gadget",
        "bitcoin", "crypto", "trading", "stock", "investment", "finance",
        "joke", "funny", "meme", "entertainment", "fun", "hobby",
        "love", "relationship", "dating", "breakup", "marriage",
        "homework", "exam", "study", "essay", "report", "project",
        "advice", "help", "question" # Generic terms
    }
    
    # Count medical and non-medical keywords
    words = set(re.findall(r"\b[a-z]+\b", text_lower))
    medical_count = len(words.intersection(medical_keywords))
    non_medical_count = len(words.intersection(non_medical_keywords))
    
    # If the query is very short, check if it contains ANY medical keyword
    if medical_count > 0:
        return True, "Medical query detected."
    
    # If only non-medical keywords found
    if non_medical_count > medical_count:
        return False, "This query is not related to medical or health topics."
    
    # If no clear medical keywords but could be health-related, check context
    # Examples: "I have XYZ", "what is ABC", "how to treat"
    if any(phrase in text_lower for phrase in ["i have", "i am", "i\'m", "i feel", "i\'ve", 
                                                "have you", "help with", "treat", "cure",
                                                "what is", "how to", "is it", "can you",
                                                "should i", "will i", "do i", "am i"]):
        return True, "Potential medical context detected."
    
    # Default to rejection for ambiguous queries
    return False, "Unable to classify as medical query. Please ask a health-related question."

# -------------------------------------------------------
#  Chatbot persona & per-session history
# -------------------------------------------------------
CHATBOT_SYSTEM = textwrap.dedent("""
    You are Medivision AI, a STRICT medical-only assistant designed EXCLUSIVELY for healthcare queries.

    ========== CRITICAL RULES (MUST FOLLOW) ==========

    DOMAIN RESTRICTION:
    1. You MUST ONLY respond to medical, health, and wellness-related questions.
    2. This includes: symptoms, diseases, medications, precautions, health guidance.
    3. If a user asks anything unrelated to medical topics, respond ONLY with:
       "I am a medical assistant AI and can only help with health-related queries. Please ask a medical question."
    4. Do NOT answer or attempt to answer non-medical questions under any circumstance.

    MEDICAL SAFETY:
    5. Do NOT provide definitive diagnoses. Present information as general guidance only.
    6. ALWAYS recommend consulting a qualified healthcare professional.
    7. If a user describes emergency symptoms (chest pain, breathing difficulty, severe bleeding),
       IMMEDIATELY advise them to call emergency services (112/911).

    COMMUNICATION STYLE:
    8. Be clear, simple, and informative. Avoid complex medical jargon unless necessary.
    9. Structure responses with: Possible Causes, Symptoms Explanation, Precautions, When to See Doctor.
    10. If image analysis context is provided, incorporate it explicitly.

    DISCLAIMER (MANDATORY):
    11. Always include: "This is AI-based guidance and not a substitute for professional medical advice."

    TONE:
    12. Be calm, supportive, and professional. Never be casual or humorous about health matters.
    13. Respond in the same language the user writes in (English, Hindi, or Hinglish).
""").strip()

# Simple in-memory chat history: session_id -> list of role/content dicts
_chat_histories: dict = {}


def _chat_fallback_reply(user_msg: str) -> str:
    text = (user_msg or "").lower()
    if any(k in text for k in ["chest pain", "can't breathe", "cannot breathe", "stroke", "faint", "unconscious"]):
        return (
            "Your symptoms may be serious. Please call emergency services (112/911) or go to the nearest ER immediately. "
            "I can still help you find the right specialist after urgent care."
        )
    if any(k in text for k in ["fever", "cough", "cold", "throat", "infection"]):
        return (
            "I can help with general guidance: rest, hydrate, and monitor symptoms. "
            "If high fever, breathing trouble, or worsening symptoms occur, seek urgent care."
        )
    if any(k in text for k in ["hospital", "doctor", "specialist", "clinic"]):
        return "You can use the Hospitals page to find specialists near you. Tell me your condition and I can suggest which specialist to consult."
    return (
        "I am currently in fallback mode due to temporary AI service limits. "
        "I can still provide general health guidance, but for diagnosis please consult a licensed doctor."
    )

# -------------------------------------------------------
#  Fallback mock data (when AI is offline)
# -------------------------------------------------------
MOCK_RESULTS = [
    {
        "disease": "Pneumonia",
        "confidence": 88,
        "category": "Pulmonology",
        "severity": "Moderate",
        "findings": [
            "Consolidation visible in lower-right lobe",
            "Increased opacity suggesting fluid or infection",
            "Mild pleural effusion possible",
        ],
        "recommendations": [
            "Consult a pulmonologist within 24 hours",
            "Complete blood count (CBC) recommended",
            "Antibiotic therapy may be required -- doctor's prescription needed",
        ],
        "next_steps": "Seek medical attention promptly. Bring this report to your appointment.",
        "image_quality": "Good",
        "disclaimer": "This analysis is AI-generated for informational purposes only. Always consult a qualified physician.",
    },
    {
        "disease": "Bone Fracture",
        "confidence": 94,
        "category": "Orthopedics",
        "severity": "High",
        "findings": [
            "Clear cortical break visible",
            "Slight angulation at fracture site",
            "No significant comminution observed",
        ],
        "recommendations": [
            "Immobilise the affected limb immediately",
            "Orthopaedic consultation required",
            "X-ray follow-up after reduction/casting",
        ],
        "next_steps": "Go to the nearest emergency or orthopaedic clinic immediately.",
        "image_quality": "Good",
        "disclaimer": "This analysis is AI-generated for informational purposes only. Always consult a qualified physician.",
    },
    {
        "disease": "Skin Allergy (Contact Dermatitis)",
        "confidence": 79,
        "category": "Dermatology",
        "severity": "Low",
        "findings": [
            "Erythematous patches with defined borders",
            "Possible vesicle formation",
            "Pattern consistent with contact irritant",
        ],
        "recommendations": [
            "Identify and avoid the irritant/allergen",
            "Topical corticosteroid cream may relieve symptoms",
            "Consult a dermatologist if no improvement in 72 hours",
        ],
        "next_steps": "Monitor symptoms. Schedule a dermatology appointment if worsening.",
        "image_quality": "Fair",
        "disclaimer": "This analysis is AI-generated for informational purposes only. Always consult a qualified physician.",
    },
]

# -------------------------------------------------------
#  Helper: strip markdown fences from a JSON string
# -------------------------------------------------------
def _clean_json(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?", "", text)
    text = re.sub(r"```$", "", text)
    return text.strip()


def _extract_json_object(text: str) -> str:
    """Extract the first JSON object from potentially noisy model output."""
    text = _clean_json(text or "")
    if text.startswith("{") and text.endswith("}"):
        return text

    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start:end + 1]

    return text


def _detect_user_language(text: str) -> str:
    s = (text or "").strip().lower()
    if re.search(r"[\u0900-\u097F]", s):
        return "Hindi"

    hinglish_markers = {
        "mujhe", "mera", "meri", "hai", "nahi", "dard", "bukhar", "khansi",
        "saans", "chakkar", "sir", "pet", "kal", "aaj", "se", "aur", "bahut",
    }
    words = set(re.findall(r"[a-z]+", s))
    if words.intersection(hinglish_markers):
        return "Hinglish"

    return "English"


def _build_localized_disclaimer(language: str) -> str:
    if language == "Hindi":
        return "Yeh diagnosis nahi hai. Kripya qualified medical professional se salah karein."
    if language == "Hinglish":
        return "Yeh final diagnosis nahi hai. Please qualified medical professional se consult karein."
    return "This is not a diagnosis. Please consult a qualified medical professional."


def _rule_based_symptom_triage(symptoms: str, language: str) -> dict:
    s = (symptoms or "").lower()

    emergency_terms = {
        "chest pain", "shortness of breath", "can\'t breathe", "cannot breathe",
        "stiff neck", "confusion", "faint", "fainted", "stroke", "seizure",
        "vomiting blood", "black stool", "severe bleeding", "unconscious",
    }
    urgent_terms = {
        "high fever", "103", "102", "persistent vomiting", "dehydration",
        "wheezing", "blood pressure", "migraine", "vision loss", "blurry vision",
    }
    soon_terms = {
        "fever", "cough", "rash", "back pain", "headache", "diarrhea", "nausea",
    }

    red_flags = [term for term in emergency_terms if term in s]

    if red_flags:
        urgency = "Emergency"
    elif any(term in s for term in urgent_terms):
        urgency = "Urgent"
    elif any(term in s for term in soon_terms):
        urgency = "Soon"
    else:
        urgency = "Routine"

    possible_conditions = ["Viral Illness", "Upper Respiratory Infection", "Gastroenteritis"]
    specialist = "General Physician"
    findings = [
        "Symptoms suggest a likely short-term medical issue.",
        "No confirmed diagnosis can be made from text symptoms alone.",
    ]
    medications_common = ["Paracetamol (as per label, if no allergy or liver disease)"]

    if any(k in s for k in ["chest pain", "palpitations", "heart", "left arm"]):
        possible_conditions = ["Acute Coronary Syndrome", "Angina", "Severe Anxiety Episode"]
        specialist = "Cardiologist / Emergency Medicine"
        findings = [
            "Chest-related symptoms can indicate a potentially serious condition.",
            "Urgent in-person evaluation is important to rule out heart and lung emergencies.",
        ]
        medications_common = ["No self-medication until emergency evaluation"]
    elif any(k in s for k in ["stiff neck", "severe headache", "confusion", "light sensitivity"]):
        possible_conditions = ["Meningitis", "Severe Viral Infection", "Migraine with Red Flags"]
        specialist = "Emergency Medicine / Neurologist"
        findings = [
            "Neurological warning symptoms are present.",
            "These symptoms can worsen quickly and need urgent assessment.",
        ]
        medications_common = ["No delay in emergency care; avoid masking severe symptoms"]
    elif any(k in s for k in ["cough", "breath", "wheezing", "fever"]):
        possible_conditions = ["Upper Respiratory Infection", "Influenza", "Pneumonia"]
        specialist = "Pulmonologist / General Physician"
        findings = [
            "Respiratory symptoms with fever may indicate airway or lung infection.",
            "Severity depends on breathing comfort, fever level, and duration.",
        ]
        medications_common = [
            "Paracetamol (as per label, if safe for you)",
            "Oral rehydration / warm fluids",
        ]
    elif any(k in s for k in ["rash", "itch", "allergy", "hives"]):
        possible_conditions = ["Allergic Dermatitis", "Viral Exanthem", "Contact Allergy"]
        specialist = "Dermatologist"
        findings = [
            "Skin irritation pattern suggests an inflammatory or allergic process.",
            "Avoiding new irritants and observing progression is important.",
        ]
        medications_common = [
            "Cetirizine (if age-appropriate and no contraindication)",
            "Calamine lotion for itch relief",
        ]
    elif any(k in s for k in ["back pain", "joint pain", "sprain", "injury"]):
        possible_conditions = ["Muscle Strain", "Ligament Sprain", "Inflammatory Pain"]
        specialist = "Orthopedic Specialist"
        findings = [
            "Pain pattern is consistent with musculoskeletal strain.",
            "Rest and movement modification often help, but persistent pain needs review.",
        ]
        medications_common = [
            "Paracetamol (as per label, if safe for you)",
            "Topical pain relief gel",
        ]

    risk_level = "Low"
    if urgency == "Emergency":
        risk_level = "High"
    elif urgency == "Urgent":
        risk_level = "Moderate"

    if not red_flags:
        red_flags = [
            "Breathing difficulty",
            "Chest pain or fainting",
        ]

    if urgency == "Emergency":
        next_steps = [
            "Call emergency services (112/911) now.",
            "Go to the nearest emergency department immediately.",
            "Do not drive yourself if dizzy, breathless, or in severe pain.",
            "Carry current medicines and past reports if available.",
        ]
    elif urgency == "Urgent":
        next_steps = [
            "Arrange doctor consultation within 24 hours.",
            "Hydrate, rest, and monitor symptom progression.",
            "Use only safe OTC medication as per label instructions.",
            "Go to ER if severe pain, breathing issues, or confusion starts.",
        ]
    else:
        next_steps = [
            "Rest and stay hydrated.",
            "Track fever, pain, and new symptoms for 24-48 hours.",
            "Book a routine doctor visit if symptoms continue.",
            "Go to urgent care if symptoms worsen suddenly.",
        ]

    if language == "Hindi":
        summary = "Aapke bataye gaye lakshan dekhkar kuch sambhavit medical conditions lag rahi hain, lekin text se final diagnosis nahi diya ja sakta."
    elif language == "Hinglish":
        summary = "Aapke symptoms ke basis par kuch possible conditions lag rahi hain, lekin text se final diagnosis confirm nahi hota."
    else:
        summary = "Based on your symptoms, a few possible conditions are likely, but a final diagnosis cannot be made from text alone."

    return {
        "summary": summary,
        "urgency": urgency,
        "risk_level": risk_level,
        "possible_conditions": possible_conditions,
        "findings": findings,
        "recommended_specialist": specialist,
        "next_steps": next_steps,
        "red_flags": red_flags,
        "medications_common": medications_common,
        "language_used": language,
        "disclaimer": _build_localized_disclaimer(language),
    }


def _normalize_triage_response(result: dict, symptoms: str, detected_language: str) -> dict:
    fallback = _rule_based_symptom_triage(symptoms, detected_language)
    raw = result if isinstance(result, dict) else {}

    urgency = str(raw.get("urgency", fallback["urgency"]))
    urgency = urgency.strip().title()
    if urgency not in {"Emergency", "Urgent", "Soon", "Routine"}:
        urgency = fallback["urgency"]

    risk_level = str(raw.get("risk_level", fallback["risk_level"]))
    risk_level = risk_level.strip().title()
    if risk_level not in {"Low", "Moderate", "High"}:
        risk_level = fallback["risk_level"]

    language_used = str(raw.get("language_used", detected_language)).strip().title()
    if language_used not in {"English", "Hindi", "Hinglish"}:
        language_used = detected_language

    possible_conditions = [str(x).strip() for x in raw.get("possible_conditions", []) if str(x).strip()][:3]
    for x in fallback["possible_conditions"]:
        if len(possible_conditions) >= 3:
            break
        if x not in possible_conditions:
            possible_conditions.append(x)

    findings = [str(x).strip() for x in raw.get("findings", []) if str(x).strip()][:4]
    if not findings:
        findings = fallback["findings"]

    next_steps = [str(x).strip() for x in raw.get("next_steps", []) if str(x).strip()][:4]
    for x in fallback["next_steps"]:
        if len(next_steps) >= 4:
            break
        if x not in next_steps:
            next_steps.append(x)

    red_flags = [str(x).strip() for x in raw.get("red_flags", []) if str(x).strip()][:5]
    if not red_flags:
        red_flags = fallback["red_flags"]

    medications_common = [str(x).strip() for x in raw.get("medications_common", []) if str(x).strip()][:3]
    if not medications_common:
        medications_common = fallback["medications_common"]

    summary = str(raw.get("summary", "")).strip() or fallback["summary"]
    recommended_specialist = str(raw.get("recommended_specialist", "")).strip() or fallback["recommended_specialist"]
    disclaimer = str(raw.get("disclaimer", "")).strip() or _build_localized_disclaimer(language_used)

    return {
        "summary": summary,
        "urgency": urgency,
        "risk_level": risk_level,
        "possible_conditions": possible_conditions,
        "findings": findings,
        "recommended_specialist": recommended_specialist,
        "next_steps": next_steps,
        "red_flags": red_flags,
        "medications_common": medications_common,
        "language_used": language_used,
        "disclaimer": disclaimer,
    }

# -------------------------------------------------------
#  Vision analysis prompt
# -------------------------------------------------------
VISION_PROMPT = textwrap.dedent("""
    You are an expert board-certified radiologist and medical imaging specialist.
    Analyse the provided medical image carefully and thoroughly.

    Return your analysis ONLY as a valid JSON object with these exact keys:
    {
      "disease":          "<Primary detected condition -- 'Normal / Healthy' if none>",
      "confidence":       <integer 0-100 representing your confidence level>,
      "category":         "<Medical specialty: Orthopedics | Pulmonology | Dermatology | Neurology | Ophthalmology | Oncology | Cardiology | General>",
      "severity":         "<Severity level: Low | Moderate | High | Critical | Normal>",
      "findings": [
        "<Key finding 1>",
        "<Key finding 2>",
        "<Key finding 3>"
      ],
      "recommendations": [
        "<Specific recommendation 1>",
        "<Specific recommendation 2>",
        "<Specific recommendation 3>"
      ],
      "next_steps": "<One sentence summarising the most important immediate action>",
      "image_quality":    "<Good | Fair | Poor>",
      "disclaimer":       "This analysis is AI-generated for informational purposes only. It is NOT a substitute for professional medical diagnosis. Always consult a qualified physician."
    }

    Important rules:
    - Be precise and evidence-based; describe what you actually observe.
    - confidence should reflect genuine uncertainty; do NOT inflate it.
    - If the image is not a medical image, set disease to 'Non-medical image' and confidence to 0.
    - Return ONLY the JSON object -- no markdown, no extra text.
""").strip()

# -------------------------------------------------------
#  POST /predict -- AI medical image analysis
# -------------------------------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    img_file = request.files["image"]
    if not img_file.filename:
        return jsonify({"error": "Empty filename"}), 400

    allowed = {"png", "jpg", "jpeg", "bmp", "webp", "tiff"}
    ext = img_file.filename.rsplit(".", 1)[-1].lower() if "." in img_file.filename else ""
    if ext not in allowed:
        return jsonify({"error": f"Unsupported file type: .{ext}"}), 415

    # Offline mock mode
    if not VISION_AI_ENABLED:
        time.sleep(1.8)
        result = random.choice(MOCK_RESULTS)
        return jsonify({**result, "status": "success", "mode": "mock"}), 200

    try:
        raw_bytes = img_file.read()
        pil_img = Image.open(io.BytesIO(raw_bytes))

        # Normalise colour mode
        if pil_img.mode not in ("RGB", "L"):
            pil_img = pil_img.convert("RGB")

        # Resize very large images
        MAX_DIM = 1024
        if max(pil_img.size) > MAX_DIM:
            pil_img.thumbnail((MAX_DIM, MAX_DIM), Image.LANCZOS)

        # Convert PIL image back to bytes for the new SDK
        buf = io.BytesIO()
        pil_img.save(buf, format="PNG")
        img_bytes = buf.getvalue()

        img_b64 = base64.b64encode(img_bytes).decode("utf-8")
        data_uri = f"data:image/png;base64,{img_b64}"

        response = groq_client.chat.completions.create(
            model=GROQ_VISION_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": VISION_PROMPT},
                        {"type": "image_url", "image_url": {"url": data_uri}},
                    ],
                }
            ],
            temperature=0.2,
            response_format={"type": "json_object"},
        )

        cleaned = _extract_json_object(response.choices[0].message.content or "")
        result  = json.loads(cleaned)

        result.setdefault("severity",        "Unknown")
        result.setdefault("findings",        [])
        result.setdefault("recommendations", [])
        result.setdefault("next_steps",      "Consult a qualified physician.")
        result.setdefault("image_quality",   "Unknown")
        result.setdefault("disclaimer",
            "This analysis is AI-generated for informational purposes only. "
            "Always consult a qualified physician.")

        return jsonify({**result, "status": "success", "mode": "ai"}), 200

    except json.JSONDecodeError as e:
        print(f"[predict] JSON parse error: {e}")
        return jsonify({"error": "AI returned an unexpected format. Please try again."}), 500
    except Exception as e:
        print(f"[predict] Error: {e}")
        return jsonify({"error": "Failed to analyse image. Please try again."}), 500


# -------------------------------------------------------
#  POST /chat -- stateful medical chatbot
# -------------------------------------------------------
@app.route("/chat", methods=["POST"])
def chat():
    data             = request.get_json(silent=True) or {}
    user_msg         = data.get("message", "").strip()
    session_id       = data.get("session_id", "default")
    analysis_context = data.get("analysis_context") or {}

    if not user_msg:
        return jsonify({"error": "No message provided"}), 400
    
    # STRICT MEDICAL-ONLY VALIDATION
    is_medical, reason = _is_medical_query(user_msg)
    if not is_medical:
        return jsonify({
            "reply": "I am a medical assistant AI and can only help with health-related queries. Please ask a medical question.",
            "mode": "blocked",
            "reason": reason
        }), 200

    context_block = ""
    if isinstance(analysis_context, dict) and analysis_context:
        try:
            context_payload = {
                "disease": analysis_context.get("disease"),
                "confidence": analysis_context.get("confidence"),
                "category": analysis_context.get("category"),
                "severity": analysis_context.get("severity"),
                "findings": analysis_context.get("findings", []),
                "recommendations": analysis_context.get("recommendations", []),
                "next_steps": analysis_context.get("next_steps"),
                "image_quality": analysis_context.get("image_quality"),
                "analyzed_at": analysis_context.get("analyzed_at"),
            }
            context_block = (
                "Latest dashboard image-analysis context (use this for orientation if relevant):\n"
                f"{json.dumps(context_payload, ensure_ascii=True)}"
            )
        except Exception:
            context_block = ""

    if not CHAT_AI_ENABLED:
        time.sleep(0.8)
        return jsonify({
            "reply": "I am currently in fallback mode. Add GROQ_API_KEY to backend/.env to enable live AI chat.",
            "mode": "mock",
        }), 200

    try:
        history = _chat_histories.get(session_id, [])

        messages = [{"role": "system", "content": CHATBOT_SYSTEM}]
        if context_block:
            messages.append({"role": "system", "content": context_block})
        messages.extend(history)
        messages.append({"role": "user", "content": user_msg})

        response = groq_client.chat.completions.create(
            model=GROQ_CHAT_MODEL,
            messages=messages,
            temperature=0.5,
        )

        reply = (response.choices[0].message.content or "").strip()

        # Persist history (cap at 20 turns to avoid token bloat)
        history.append({"role": "user", "content": user_msg})
        history.append({"role": "assistant", "content": reply})
        _chat_histories[session_id] = history[-20:]

        return jsonify({"reply": reply, "mode": "ai"}), 200

    except Exception as e:
        print(f"[chat] Error: {e}")
        return jsonify({
            "reply": _chat_fallback_reply(user_msg),
            "mode": "mock-fallback",
        }), 200


# -------------------------------------------------------
#  POST /symptom-check -- NLP symptom triage
# -------------------------------------------------------
SYMPTOM_SYSTEM_INSTRUCTION = textwrap.dedent("""
        You are Medivision AI, a MEDICAL-ONLY triage and analysis assistant.

        STRICT DOMAIN RESTRICTION:
        - You MUST analyze ONLY health/medical symptom descriptions.
        - Reject ANY non-medical queries with: "I am a medical assistant AI and can only help with health-related queries. Please ask a medical question."
        - Do NOT attempt to answer non-medical questions.

        Behavior requirements:
        - Analyze user-reported symptoms and health concerns.
        - Internally reason like a doctor, but NEVER reveal reasoning.
        - If information is missing, make safe assumptions and prioritize safety.
        - NEVER ask follow-up questions.

        Safety requirements:
        - NEVER provide a final diagnosis.
        - Use only possible conditions.
        - If danger signs are present, set urgency to Emergency.
        - Always include red flags and mandatory disclaimer.

        Language requirements:
        - Auto-detect language from user input.
        - Supported languages are English, Hindi, and Hinglish.
        - Respond in the same language as the user.

        Output requirements:
        - Return valid JSON only.
        - Do not add markdown, explanations, or text outside JSON.
        - Always include disclaimer: "This is AI-based guidance and not a substitute for professional medical advice."
""").strip()

SYMPTOM_PROMPT_TEMPLATE = textwrap.dedent("""
        Analyze this symptom description and return dashboard-ready triage JSON.

        Symptoms:
        {symptoms}

        Return ONLY a JSON object with exactly these keys:
        {{
            "summary": "<clear explanation in simple language>",
            "urgency": "<Emergency | Urgent | Soon | Routine>",
            "risk_level": "<Low | Moderate | High>",
            "possible_conditions": ["<condition 1>", "<condition 2>", "<condition 3>"],
            "findings": ["<key observation 1>", "<key observation 2>"],
            "recommended_specialist": "<doctor type>",
            "next_steps": ["<step 1>", "<step 2>", "<step 3>", "<step 4>"],
            "red_flags": ["<danger sign 1>", "<danger sign 2>"],
            "medications_common": ["<safe OTC option if appropriate>"],
            "language_used": "<English | Hindi | Hinglish>",
            "disclaimer": "This is not a diagnosis. Please consult a qualified medical professional."
        }}

        Rules:
        - Keep language simple and avoid heavy medical jargon.
        - Do not ask any questions.
""").strip()

@app.route("/symptom-check", methods=["POST"])
def symptom_check():
    data     = request.get_json(silent=True) or {}
    symptoms = data.get("symptoms", "").strip()
    detected_language = _detect_user_language(symptoms)

    if not symptoms:
        return jsonify({"error": "No symptoms provided"}), 400
    if len(symptoms) > 1000:
        return jsonify({"error": "Symptoms description too long (max 1000 characters)"}), 400
    
    # STRICT MEDICAL-ONLY VALIDATION
    is_medical, reason = _is_medical_query(symptoms)
    if not is_medical:
        return jsonify({
            "summary": "I am a medical assistant AI and can only help with health-related queries. Please ask a medical question.",
            "urgency": "Routine",
            "risk_level": "Low",
            "possible_conditions": [],
            "findings": ["Non-medical query detected"],
            "recommended_specialist": "N/A",
            "next_steps": ["Please ask a medical or health-related question"],
            "red_flags": [],
            "medications_common": [],
            "language_used": detected_language,
            "blocked": True,
            "reason": reason,
            "disclaimer": "This is AI-based guidance and not a substitute for professional medical advice."
        }), 200

    if not CHAT_AI_ENABLED:
        time.sleep(1)
        return jsonify(_rule_based_symptom_triage(symptoms, detected_language)), 200

    try:
        prompt = SYMPTOM_PROMPT_TEMPLATE.format(symptoms=symptoms)

        response = groq_client.chat.completions.create(
            model=GROQ_TRIAGE_MODEL,
            messages=[
                {"role": "system", "content": SYMPTOM_SYSTEM_INSTRUCTION},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            response_format={"type": "json_object"},
        )

        reply_text = response.choices[0].message.content or ""
        cleaned = _extract_json_object(reply_text)
        result  = json.loads(cleaned)
        normalized = _normalize_triage_response(result, symptoms, detected_language)
        return jsonify(normalized), 200

    except json.JSONDecodeError as e:
        print(f"[symptom-check] JSON parse error: {e}")
        return jsonify(_rule_based_symptom_triage(symptoms, detected_language)), 200
    except Exception as e:
        print(f"[symptom-check] Error: {e}")
        return jsonify(_rule_based_symptom_triage(symptoms, detected_language)), 200


# -------------------------------------------------------
#  GET /health
# -------------------------------------------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":     "ok",
        "version":    "2.0.0",
        "vision_ai_enabled": VISION_AI_ENABLED,
        "chat_ai_enabled": CHAT_AI_ENABLED,
        "vision_model": GROQ_VISION_MODEL,
        "chat_model": GROQ_CHAT_MODEL,
        "triage_model": GROQ_TRIAGE_MODEL,
        "endpoints":  ["/predict", "/chat", "/symptom-check", "/health", "/diseases"],
    }), 200


# -------------------------------------------------------
#  GET /diseases -- supported conditions catalogue
# -------------------------------------------------------
DISEASE_CATALOGUE = [
    {"disease": "Pneumonia",            "category": "Pulmonology",   "image_type": "Chest X-Ray"},
    {"disease": "Bone Fracture",        "category": "Orthopedics",   "image_type": "X-Ray"},
    {"disease": "Brain Tumor",          "category": "Neurology",     "image_type": "MRI"},
    {"disease": "Diabetic Retinopathy", "category": "Ophthalmology", "image_type": "Retinal Scan"},
    {"disease": "Melanoma",             "category": "Dermatology",   "image_type": "Dermoscopy"},
    {"disease": "Contact Dermatitis",   "category": "Dermatology",   "image_type": "Clinical Photo"},
    {"disease": "COVID-19 Pneumonitis", "category": "Pulmonology",   "image_type": "Chest CT"},
    {"disease": "Glaucoma",             "category": "Ophthalmology", "image_type": "Fundus Photo"},
    {"disease": "Cardiomegaly",         "category": "Cardiology",    "image_type": "Chest X-Ray"},
    {"disease": "Glioblastoma",         "category": "Neurology",     "image_type": "MRI"},
    {"disease": "Psoriasis",            "category": "Dermatology",   "image_type": "Clinical Photo"},
    {"disease": "Osteoporosis",         "category": "Orthopedics",   "image_type": "DEXA Scan"},
]

@app.route("/diseases", methods=["GET"])
def diseases():
    return jsonify({"diseases": DISEASE_CATALOGUE, "total": len(DISEASE_CATALOGUE)}), 200


if __name__ == "__main__":
    print(
        "Medivision backend starting -- "
        f"Vision AI: {'ON' if VISION_AI_ENABLED else 'OFF (MOCK)'} | "
        f"Chat/Triage AI: {'ON' if CHAT_AI_ENABLED else 'OFF (FALLBACK)'}"
    )
    app.run(debug=True, port=5000)
