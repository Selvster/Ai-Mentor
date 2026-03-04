import { CheckCircle, Circle } from 'lucide-react';
import type { Feature, FeatureVerification } from '../types';

const priorityColors = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

export function FeatureChecklist({ features }: { features: Feature[] }) {
  return (
    <div className="space-y-2">
      {features.map((feature) => (
        <div key={feature.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
          <Circle className="h-5 w-5 text-gray-300 mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-900">{feature.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[feature.priority]}`}>
                {feature.priority}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeatureVerificationList({ verifications }: { verifications: FeatureVerification[] }) {
  return (
    <div className="space-y-2">
      {verifications.map((v) => (
        <div key={v.featureId} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
          {v.implemented ? (
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
          ) : (
            <Circle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
          )}
          <div className="flex-1">
            <span className="font-medium text-sm text-gray-900">{v.featureTitle}</span>
            <p className="text-xs text-gray-500 mt-0.5">{v.details}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
