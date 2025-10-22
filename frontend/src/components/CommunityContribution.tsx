/**
 * Community Contribution Component
 * Allows users to submit cultural artifacts and earn FET tokens
 */

import React, { useState } from 'react';
import { Upload, Award, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { apiClient } from '../services/api';

const CONTRIBUTION_TYPES = [
  { value: 'new_artifact', label: 'New Cultural Artifact', reward: 100 },
  { value: 'artifact_update', label: 'Update Existing Artifact', reward: 50 },
  { value: 'cultural_context', label: 'Add Cultural Context', reward: 75 },
  { value: 'translation', label: 'Translation', reward: 60 },
  { value: 'verification', label: 'Fact Verification', reward: 40 },
];

const CULTURES = [
  'Yoruba', 'Igbo', 'Hausa', 'Edo', 'Fulani', 'Ijaw', 'Kanuri', 'Tiv',
  'Efik', 'Ibibio', 'Akan', 'Maasai', 'Amhara', 'Zulu', 'Xhosa', 'Berber'
];

interface ContributionFormData {
  contributionType: string;
  culture: string;
  title: string;
  description: string;
  culturalSignificance: string;
  sources: string;
  walletAddress: string;
}

export const CommunityContribution: React.FC = () => {
  const [formData, setFormData] = useState<ContributionFormData>({
    contributionType: '',
    culture: '',
    title: '',
    description: '',
    culturalSignificance: '',
    sources: '',
    walletAddress: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (field: keyof ContributionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getEstimatedReward = () => {
    const type = CONTRIBUTION_TYPES.find(t => t.value === formData.contributionType);
    return type ? type.reward : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await apiClient.post('/community/contribute', {
        contributor_address: formData.walletAddress,
        contribution_type: formData.contributionType,
        culture: formData.culture,
        data: {
          title: formData.title,
          description: formData.description,
          cultural_significance: formData.culturalSignificance,
          sources: formData.sources.split('\n').filter(s => s.trim()),
        },
      });

      setSubmitStatus('success');
      setSubmitMessage(
        `Contribution submitted successfully! Estimated reward: ${response.data.estimated_reward} FET tokens. ` +
        `Your contribution will be reviewed by cultural experts.`
      );

      // Reset form
      setFormData({
        contributionType: '',
        culture: '',
        title: '',
        description: '',
        culturalSignificance: '',
        sources: '',
        walletAddress: '',
      });
    } catch (error: any) {
      setSubmitStatus('error');
      setSubmitMessage(error.response?.data?.detail || 'Failed to submit contribution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.contributionType &&
      formData.culture &&
      formData.title &&
      formData.description &&
      formData.culturalSignificance &&
      formData.walletAddress
    );
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto bg-card border-border">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <img src="/logo.png" alt="KulturaMind" className="w-8 h-8 object-contain" />
          <Upload className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-foreground">Contribute to Cultural Heritage</h2>
        </div>
        <p className="text-muted-foreground">
          Share your knowledge and earn FET tokens. All contributions are reviewed by cultural experts.
        </p>
      </div>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <Alert className="mb-4 bg-green-500/10 border-green-500/30">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-600 dark:text-green-400">{submitMessage}</AlertDescription>
        </Alert>
      )}

      {submitStatus === 'error' && (
        <Alert className="mb-4 bg-red-500/10 border-red-500/30">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-600 dark:text-red-400">{submitMessage}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contribution Type */}
        <div>
          <Label htmlFor="contributionType">Contribution Type *</Label>
          <Select
            value={formData.contributionType}
            onValueChange={(value) => handleInputChange('contributionType', value)}
          >
            <SelectTrigger id="contributionType">
              <SelectValue placeholder="Select contribution type" />
            </SelectTrigger>
            <SelectContent>
              {CONTRIBUTION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{type.label}</span>
                    <Badge variant="secondary" className="ml-2">
                      {type.reward} FET
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Culture */}
        <div>
          <Label htmlFor="culture">Culture *</Label>
          <Select
            value={formData.culture}
            onValueChange={(value) => handleInputChange('culture', value)}
          >
            <SelectTrigger id="culture">
              <SelectValue placeholder="Select culture" />
            </SelectTrigger>
            <SelectContent>
              {CULTURES.map((culture) => (
                <SelectItem key={culture} value={culture}>
                  {culture}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Eyo Festival Masquerade"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Provide a detailed description of the cultural artifact, tradition, or practice..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            required
          />
        </div>

        {/* Cultural Significance */}
        <div>
          <Label htmlFor="culturalSignificance">Cultural Significance *</Label>
          <Textarea
            id="culturalSignificance"
            placeholder="Explain the cultural, historical, or spiritual significance..."
            value={formData.culturalSignificance}
            onChange={(e) => handleInputChange('culturalSignificance', e.target.value)}
            rows={3}
            required
          />
        </div>

        {/* Sources */}
        <div>
          <Label htmlFor="sources">Sources (Optional)</Label>
          <Textarea
            id="sources"
            placeholder="List your sources (one per line)&#10;e.g., UNESCO World Heritage&#10;Community elders&#10;Academic publications"
            value={formData.sources}
            onChange={(e) => handleInputChange('sources', e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Providing credible sources increases approval chances
          </p>
        </div>

        {/* Wallet Address */}
        <div>
          <Label htmlFor="walletAddress">Fetch.AI Wallet Address *</Label>
          <Input
            id="walletAddress"
            placeholder="fetch1..."
            value={formData.walletAddress}
            onChange={(e) => handleInputChange('walletAddress', e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            FET token rewards will be sent to this address
          </p>
        </div>

        {/* Estimated Reward */}
        {formData.contributionType && (
          <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold text-purple-600 dark:text-purple-400">Estimated Reward</span>
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {getEstimatedReward()} FET
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Pending expert validation and approval
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={!isFormValid() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Submit Contribution
            </>
          )}
        </Button>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
        <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">How it works:</h4>
        <ol className="text-sm text-blue-600 dark:text-blue-400 space-y-1 list-decimal list-inside">
          <li>Submit your cultural knowledge</li>
          <li>Cultural experts review your contribution</li>
          <li>Upon approval, receive FET tokens</li>
          <li>Your contribution enriches the knowledge base</li>
        </ol>
      </div>
    </Card>
  );
};

