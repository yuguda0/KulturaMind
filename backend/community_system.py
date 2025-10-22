"""
Community Contribution System
Enables decentralized knowledge curation with expert validation and token incentives
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum
import json
from pathlib import Path

logger = logging.getLogger(__name__)


class ContributionStatus(Enum):
    """Status of a community contribution"""
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_REVISION = "needs_revision"


class ContributionType(Enum):
    """Type of contribution"""
    NEW_ARTIFACT = "new_artifact"
    ARTIFACT_UPDATE = "artifact_update"
    CULTURAL_CONTEXT = "cultural_context"
    TRANSLATION = "translation"
    VERIFICATION = "verification"
    EXPERT_REVIEW = "expert_review"


class CommunityContribution:
    """Represents a single community contribution"""
    
    def __init__(
        self,
        contribution_id: str,
        contributor_address: str,
        contribution_type: ContributionType,
        data: Dict[str, Any],
        culture: str,
        status: ContributionStatus = ContributionStatus.PENDING
    ):
        self.contribution_id = contribution_id
        self.contributor_address = contributor_address
        self.contribution_type = contribution_type
        self.data = data
        self.culture = culture
        self.status = status
        self.created_at = datetime.now().isoformat()
        self.updated_at = datetime.now().isoformat()
        self.reviews: List[Dict[str, Any]] = []
        self.token_reward = 0
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'contribution_id': self.contribution_id,
            'contributor_address': self.contributor_address,
            'contribution_type': self.contribution_type.value,
            'data': self.data,
            'culture': self.culture,
            'status': self.status.value,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'reviews': self.reviews,
            'token_reward': self.token_reward
        }


class CommunityContributionSystem:
    """
    Manages community contributions with expert validation and token incentives
    """
    
    def __init__(self, storage_path: str = "data/community_contributions.json"):
        self.storage_path = Path(storage_path)
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        
        self.contributions: Dict[str, CommunityContribution] = {}
        self.experts: Dict[str, Dict[str, Any]] = {}  # Expert validators by culture
        self.token_rewards = {
            ContributionType.NEW_ARTIFACT: 100,
            ContributionType.ARTIFACT_UPDATE: 50,
            ContributionType.CULTURAL_CONTEXT: 75,
            ContributionType.TRANSLATION: 60,
            ContributionType.VERIFICATION: 40,
            ContributionType.EXPERT_REVIEW: 80
        }
        
        self._load_contributions()
        logger.info("✓ Community Contribution System initialized")
    
    def _load_contributions(self):
        """Load contributions from storage"""
        if self.storage_path.exists():
            try:
                with open(self.storage_path, 'r') as f:
                    data = json.load(f)
                    for contrib_data in data.get('contributions', []):
                        contrib = CommunityContribution(
                            contribution_id=contrib_data['contribution_id'],
                            contributor_address=contrib_data['contributor_address'],
                            contribution_type=ContributionType(contrib_data['contribution_type']),
                            data=contrib_data['data'],
                            culture=contrib_data['culture'],
                            status=ContributionStatus(contrib_data['status'])
                        )
                        contrib.created_at = contrib_data['created_at']
                        contrib.updated_at = contrib_data['updated_at']
                        contrib.reviews = contrib_data.get('reviews', [])
                        contrib.token_reward = contrib_data.get('token_reward', 0)
                        self.contributions[contrib.contribution_id] = contrib
                    
                    self.experts = data.get('experts', {})
                    logger.info(f"Loaded {len(self.contributions)} contributions")
            except Exception as e:
                logger.error(f"Error loading contributions: {e}")
    
    def _save_contributions(self):
        """Save contributions to storage"""
        try:
            data = {
                'contributions': [c.to_dict() for c in self.contributions.values()],
                'experts': self.experts,
                'last_updated': datetime.now().isoformat()
            }
            with open(self.storage_path, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving contributions: {e}")
    
    def submit_contribution(
        self,
        contributor_address: str,
        contribution_type: ContributionType,
        data: Dict[str, Any],
        culture: str
    ) -> Dict[str, Any]:
        """
        Submit a new contribution
        
        Args:
            contributor_address: Fetch.AI wallet address
            contribution_type: Type of contribution
            data: Contribution data
            culture: Culture being contributed to
            
        Returns:
            Contribution details with ID
        """
        contribution_id = f"contrib-{datetime.now().timestamp()}-{contributor_address[:8]}"
        
        contribution = CommunityContribution(
            contribution_id=contribution_id,
            contributor_address=contributor_address,
            contribution_type=contribution_type,
            data=data,
            culture=culture
        )
        
        self.contributions[contribution_id] = contribution
        self._save_contributions()
        
        logger.info(f"New contribution submitted: {contribution_id} by {contributor_address}")
        
        return {
            'contribution_id': contribution_id,
            'status': contribution.status.value,
            'estimated_reward': self.token_rewards.get(contribution_type, 50),
            'message': 'Contribution submitted successfully. Awaiting expert review.'
        }
    
    def register_expert(
        self,
        expert_address: str,
        culture: str,
        credentials: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Register a cultural expert validator
        
        Args:
            expert_address: Fetch.AI wallet address
            culture: Culture expertise
            credentials: Expert credentials and verification
            
        Returns:
            Registration status
        """
        if culture not in self.experts:
            self.experts[culture] = {}
        
        self.experts[culture][expert_address] = {
            'credentials': credentials,
            'registered_at': datetime.now().isoformat(),
            'reviews_completed': 0,
            'reputation_score': 100
        }
        
        self._save_contributions()
        
        logger.info(f"Expert registered: {expert_address} for {culture} culture")
        
        return {
            'status': 'registered',
            'culture': culture,
            'message': 'Successfully registered as cultural expert'
        }
    
    def submit_review(
        self,
        contribution_id: str,
        expert_address: str,
        approved: bool,
        feedback: str,
        suggested_changes: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Submit expert review for a contribution
        
        Args:
            contribution_id: ID of contribution to review
            expert_address: Expert's wallet address
            approved: Whether contribution is approved
            feedback: Review feedback
            suggested_changes: Optional suggested changes
            
        Returns:
            Review status
        """
        if contribution_id not in self.contributions:
            return {'error': 'Contribution not found'}
        
        contribution = self.contributions[contribution_id]
        
        # Verify expert is registered for this culture
        if contribution.culture not in self.experts:
            return {'error': 'No experts registered for this culture'}
        
        if expert_address not in self.experts[contribution.culture]:
            return {'error': 'Not registered as expert for this culture'}
        
        # Add review
        review = {
            'expert_address': expert_address,
            'approved': approved,
            'feedback': feedback,
            'suggested_changes': suggested_changes,
            'reviewed_at': datetime.now().isoformat()
        }
        
        contribution.reviews.append(review)
        contribution.updated_at = datetime.now().isoformat()
        
        # Update status based on review
        if approved:
            contribution.status = ContributionStatus.APPROVED
            contribution.token_reward = self.token_rewards.get(
                contribution.contribution_type, 50
            )
        else:
            contribution.status = ContributionStatus.NEEDS_REVISION if suggested_changes else ContributionStatus.REJECTED
        
        # Update expert stats
        self.experts[contribution.culture][expert_address]['reviews_completed'] += 1
        
        self._save_contributions()
        
        logger.info(f"Review submitted for {contribution_id} by {expert_address}")
        
        return {
            'contribution_id': contribution_id,
            'status': contribution.status.value,
            'token_reward': contribution.token_reward if approved else 0,
            'message': 'Review submitted successfully'
        }
    
    def get_pending_contributions(self, culture: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get pending contributions for review"""
        pending = [
            c.to_dict() for c in self.contributions.values()
            if c.status == ContributionStatus.PENDING
        ]
        
        if culture:
            pending = [c for c in pending if c['culture'] == culture]
        
        return pending
    
    def get_contribution_stats(self) -> Dict[str, Any]:
        """Get community contribution statistics"""
        total = len(self.contributions)
        by_status = {}
        by_type = {}
        by_culture = {}
        total_rewards = 0
        
        for contrib in self.contributions.values():
            # By status
            status = contrib.status.value
            by_status[status] = by_status.get(status, 0) + 1
            
            # By type
            ctype = contrib.contribution_type.value
            by_type[ctype] = by_type.get(ctype, 0) + 1
            
            # By culture
            by_culture[contrib.culture] = by_culture.get(contrib.culture, 0) + 1
            
            # Total rewards
            total_rewards += contrib.token_reward
        
        return {
            'total_contributions': total,
            'by_status': by_status,
            'by_type': by_type,
            'by_culture': by_culture,
            'total_rewards_distributed': total_rewards,
            'total_experts': sum(len(experts) for experts in self.experts.values()),
            'cultures_with_experts': len(self.experts)
        }

