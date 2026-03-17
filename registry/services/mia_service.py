import ollama
from registry.utils.trend_analysis import TrendAnalyzer

class MiaAgent:
    """
    MIA: Medical Intelligence Assistant.
    Provides local AI capabilities for ICD-O-3 coding and diagnostic extraction.
    """
    def __init__(self, model="llama3.2"):
        self.model = model

    def chat(self, user_message):
        """
        Handle general conversations and data-driven trend queries.
        """
        summary = TrendAnalyzer.get_summary_stats()
        
        system_prompt = (
            "Tu es M.I.A. (Medical Intelligence Assistant), l'experte IA du Registre du Cancer Algérien. "
            "Tu as accès aux statistiques actuelles: "
            f"- Total des cas: {summary['total_cases']} "
            f"- Top 3 sites: {summary['top_sites']} "
            f"- Dernière mise à jour: {summary['last_update']}. "
            "Réponds avec courtoisie et professionnalisme. "
            "Si l'utilisateur demande des tendances, des graphiques ou des statistiques spécifiques, analyse sa requête. "
            "IMPORTANT: Si tu détectes une demande de données (ex: 'montre moi le top 5', 'évolution par année', 'distribution par wilaya'), "
            "termine TOUJOURS ta réponse par un bloc JSON structuré sous la forme: "
            "DATA_INSIGHT: { 'type': 'chart|card', 'category': 'incidence|top_sites|wilaya', 'topo': 'C50.9|all' }"
        )
        
        try:
            response = ollama.chat(model=self.model, messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_message}
            ])
            return response['message']['content']
        except Exception as e:
            return f"Désolé, j'ai rencontré une erreur technique: {str(e)}"

    def code_diagnosis(self, text):
        """
        Translate clinical text into ICD-O-3 codes.
        """
        prompt = f"Extrait le code de topographie et de morphologie (CIM-O-3) pour le diagnostic suivant: '{text}'. Répond uniquement au format JSON: {{'topo': '...', 'morpho': '...'}}"
        
        try:
            response = ollama.chat(model=self.model, messages=[
                {'role': 'user', 'content': prompt}
            ])
            return response['message']['content']
        except Exception as e:
            return f"Error: {str(e)}"

    def query_incidence(self, natural_query):
        """
        Translate natural language query to SQL/Filter logic (Mock/Simulation).
        """
        prompt = f"Traduis cette requête en critères de recherche: '{natural_query}'"
        
        try:
            response = ollama.chat(model=self.model, messages=[
                {'role': 'user', 'content': prompt}
            ])
            return response['message']['content']
        except Exception as e:
            return f"Error: {str(e)}"

    def extract_voice_data(self, text, role, module):
        """
        Extracts structured JSON data from dictated medical text based on the user's role.
        """
        system_prompt = "Tu es M.I.A., Assistante du Registre du Cancer. "
        
        if role == 'medecin':
            system_prompt += "Extrait les informations cliniques: Identité, âge, topographie (CIM-O-3), TNM clinique (cT, cN, cM, stade). Sois ultra-concise et précise. "
        elif role == 'anapate':
            system_prompt += "Extrait: topographie, morphologie (CIM-O-3 précise), comportement, grade, TNM pathologique (pT, pN, pM). Exclus tout blabla de ta réponse. "
            
        system_prompt += "IMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide. Clés autorisées: last_name, first_name, age, topo_code, morpho_code, clinical_t, clinical_n, clinical_m, path_t, path_n, path_m, grade, behaviour, incidence_date."

        try:
            response = ollama.chat(model=self.model, messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': f"Texte dicté: '{text}'"}
            ])
            
            content = response['message']['content'].strip()
            # Clean possible markdown block
            if content.startswith('```json'):
                content = content.replace('```json', '').replace('```', '')
            import json
            try:
                data = json.loads(content)
                return data
            except json.JSONDecodeError:
                # Fallback empty dict if parsing fails
                print(f"MIA fallback decode error for content: {content}")
                return {}
        except Exception as e:
            print(f"MIA API Error: {str(e)}")
            return {}
