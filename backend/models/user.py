from typing import Dict

class User:
    def __init__(self, user_id: str, email: str, password_hash: str, quiz_results: Dict = None):
        self.user_id = user_id
        self.email = email
        self.password_hash = password_hash
        self.quiz_results = quiz_results or {}
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'email': self.email,
            'quiz_results': self.quiz_results
        }
