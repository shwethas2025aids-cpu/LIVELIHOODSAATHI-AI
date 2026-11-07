#!/usr/bin/env python3
"""
LivelihoodSaathi AI - Scikit-Learn Career & Skill Recommendation Engine
Combines TF-IDF vectorization and Cosine Similarity with skill gap deduction
and training programme ranking.
"""

import sys
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def normalize_tokens(text_list):
    if not text_list:
        return ""
    if isinstance(text_list, list):
        return " ".join([str(t).strip().lower() for t in text_list if t])
    return str(text_list).strip().lower()


def evaluate_recommendations(payload):
    education = payload.get("education", "")
    current_skills = payload.get("skills", [])
    interests = payload.get("interests", [])
    target_career = payload.get("target_career", "")
    programmes = payload.get("programmes", [])
    career_pathways = payload.get("career_pathways", [])

    # Beneficiary profile document
    profile_text = f"{education} {normalize_tokens(current_skills)} {normalize_tokens(interests)} {target_career}".strip()
    if not profile_text:
        profile_text = "general career exploration vocational skills"

    # Multilingual domain augmentation for Indic/Tamil/Hindi queries
    for indic_kw, en_kw in [
        # Tamil keywords
        ('சோலார்', 'solar green energy rooftop'),
        ('சூரிய', 'solar renewable energy sun'),
        ('வாகன', 'vehicle ev automotive technician'),
        ('மின்சார', 'electric electrical technician wiring'),
        ('வியாபாரம்', 'business commerce marketing sales'),
        ('மருத்துவ', 'healthcare medical hospital assistant'),
        ('கணினி', 'computer software coding technology python'),
        ('மென்பொருள்', 'software coding programming tech python'),
        # Hindi keywords
        ('सौर', 'solar green energy rooftop'),
        ('सोलर', 'solar green energy rooftop'),
        ('ऊर्जा', 'renewable green clean energy solar'),
        ('बिजली', 'electric electrical technician wiring'),
        ('वाहन', 'vehicle ev automotive technician'),
        ('गाड़ी', 'vehicle ev automotive technician'),
        ('गाड़ी', 'vehicle ev automotive technician'),
        ('व्यापार', 'business commerce marketing sales'),
        ('मार्केटिंग', 'marketing digital business commerce'),
        ('स्वास्थ्य', 'healthcare medical hospital assistant'),
        ('अस्पताल', 'hospital healthcare patient medical'),
        ('कंप्यूटर', 'computer software coding technology python'),
        ('सॉफ्टवेयर', 'software coding programming tech python'),
    ]:
        if indic_kw in profile_text:
            profile_text += f" {en_kw}"

    # Pre-build career corpus
    career_docs = []
    career_ids = []
    for c in career_pathways:
        c_text = f"{c.get('title', '')} {c.get('sector', '')} {normalize_tokens(c.get('required_skills', []))} {c.get('description', '')}"
        career_docs.append(c_text)
        career_ids.append(c)

    # Pre-build programme corpus
    prog_docs = []
    prog_ids = []
    for p in programmes:
        p_text = f"{p.get('title', '')} {p.get('sector', '')} {normalize_tokens(p.get('skills_taught', []))} {p.get('description', '')}"
        prog_docs.append(p_text)
        prog_ids.append(p)

    # All documents for vectorizer fit
    all_docs = [profile_text] + career_docs + prog_docs
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english", max_features=500)
    tfidf_matrix = vectorizer.fit_transform(all_docs)

    profile_vec = tfidf_matrix[0:1]
    career_offset = 1
    prog_offset = career_offset + len(career_docs)

    # 1. Career Matching via Cosine Similarity
    matched_careers = []
    domain_scores = {"Tech": 0.05, "Green Skills": 0.05, "Vocational": 0.05, "Business": 0.05, "Healthcare": 0.05}

    if career_docs:
        career_vecs = tfidf_matrix[career_offset:prog_offset]
        career_sims = cosine_similarity(profile_vec, career_vecs)[0]

        for i, sim in enumerate(career_sims):
            c_obj = career_ids[i]
            # Rescale to 50-98 range for realistic match %
            score = int(np.clip(50 + (sim * 48), 50, 98))
            sector = c_obj.get("sector", "Tech")
            if sector in domain_scores:
                domain_scores[sector] = max(domain_scores[sector], float(round(sim, 3)))

            matched_careers.append({
                "id": c_obj.get("id"),
                "title": c_obj.get("title"),
                "sector": sector,
                "match_score": score,
                "cosine_similarity": float(round(sim, 4)),
                "required_skills": c_obj.get("required_skills", []),
                "description": c_obj.get("description", "")
            })

        matched_careers.sort(key=lambda x: x["match_score"], reverse=True)

    top_career = matched_careers[0] if matched_careers else {"sector": "Tech", "required_skills": []}
    dominant_domain = top_career.get("sector", "Tech")

    # 2. Skill Gap Identification
    current_skills_lower = {s.strip().lower() for s in current_skills if s}
    identified_gaps = []

    target_required = top_career.get("required_skills", [])
    if not target_required and len(matched_careers) > 1:
        target_required = matched_careers[1].get("required_skills", [])

    for r_skill in target_required:
        r_lower = r_skill.strip().lower()
        # Check if beneficiary already has this skill
        has_skill = any(r_lower in cs or cs in r_lower for cs in current_skills_lower)
        if not has_skill:
            identified_gaps.append({
                "skill": r_skill,
                "priority": "HIGH" if len(identified_gaps) < 2 else "MEDIUM",
                "status": "IDENTIFIED"
            })

    # Fallback default gap if none found
    if not identified_gaps and target_career:
        identified_gaps.append({
            "skill": f"Advanced {target_career} Certification",
            "priority": "HIGH",
            "status": "IDENTIFIED"
        })

    # 3. Training Programmes Ranking
    ranked_programmes = []
    if prog_docs:
        prog_vecs = tfidf_matrix[prog_offset:]
        prog_sims = cosine_similarity(profile_vec, prog_vecs)[0]

        gap_skill_names = {g["skill"].lower() for g in identified_gaps}

        for j, sim in enumerate(prog_sims):
            p_obj = prog_ids[j]
            taught = p_obj.get("skills_taught", [])
            taught_lower = [t.lower() for t in taught]

            # Calculate gap overlap
            matching_gaps = [t for t in taught if any(gl in t.lower() or t.lower() in gl for gl in gap_skill_names)]
            gap_boost = 0.3 * (len(matching_gaps) / max(len(identified_gaps), 1))

            # Composite ranking score: 60% TF-IDF cosine similarity + 40% direct skill gap coverage
            final_score = int(np.clip((sim * 0.6 + gap_boost * 0.4) * 100, 40, 99))

            ranked_programmes.append({
                "id": p_obj.get("id"),
                "title": p_obj.get("title"),
                "sector": p_obj.get("sector"),
                "score": final_score,
                "cosine_similarity": float(round(sim, 4)),
                "skills_taught": taught,
                "matching_skill_gaps": matching_gaps,
                "available_seats": p_obj.get("available_seats", 30),
                "duration_weeks": p_obj.get("duration_weeks", 8)
            })

        ranked_programmes.sort(key=lambda x: x["score"], reverse=True)

    return {
        "engine": "scikit-learn-tfidf-cosine-v1",
        "dominant_domain": dominant_domain,
        "domain_scores": {k: float(round(v, 3)) for k, v in domain_scores.items()},
        "matched_careers": matched_careers[:4],
        "skill_gaps": identified_gaps,
        "ranked_programmes": ranked_programmes[:4]
    }


def main():
    if "--worker" in sys.argv:
        # High-performance persistent worker mode: processes stream of JSON requests via stdin
        sys.stderr.write("[RecommenderWorker] Ready\n")
        sys.stderr.flush()
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue
            if line == "PING":
                print("PONG", flush=True)
                continue
            try:
                payload = json.loads(line)
                res = evaluate_recommendations(payload)
                print(json.dumps(res, ensure_ascii=False), flush=True)
            except Exception as ex:
                print(json.dumps({"error": str(ex)}), flush=True)
        return

    if len(sys.argv) > 1 and sys.argv[1] != "-":
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        raw = sys.stdin.read()
        data = json.loads(raw) if raw.strip() else {}

    result = evaluate_recommendations(data)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
