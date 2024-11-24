import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface CannedPrompt {
  label: string;
  value: string;
}

const CANNED_PROMPTS: CannedPrompt[] = [
  { label: 'Concise', value: '\nThe review should be very concise. Only show recommendations that pertain to the code and not general recommendations.' },
  { label: 'No Docs', value: '\nPlease do not provide any docstring comments. Do not provide the documentation section.' },
  { label: 'Recommendations only', value: '\nOnly show recommendations and not all the sections. You do not need to explain the changes.' },
];

type SettingsPopupProps = {
  onClose: () => void;
};

export default function SettingsPopup({ onClose }: SettingsPopupProps) {
  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    const storedPrompt = localStorage.getItem('customPromptCodeComments');
    if (storedPrompt) {
      setCustomPrompt(storedPrompt);
    }
  }, []);

  const handleCustomPromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomPrompt(event.target.value);
    localStorage.setItem('customPromptCodeComments', event.target.value);
  };

  const handleCannedPromptClick = (prompt: CannedPrompt) => {
    setCustomPrompt(`${customPrompt} ${prompt.value}`.trim());
    localStorage.setItem('customPromptCodeComments', `${customPrompt} ${prompt.value}`.trim());
  };

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Settings</h3>

            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900">Custom Prompts</h4>

              <div className="mt-4 relative">
                <Label htmlFor="custom-prompt">Code Comments Prompt</Label>
                <Textarea
                  id="custom-prompt"
                  value={customPrompt}
                  onChange={handleCustomPromptChange}
                  className="mt-1 block w-full"
                  rows={4}
                  placeholder="Enter custom prompt that will be added to the existing prompt..."
                />
              </div>

              <div className="mt-4">
                <Label>Canned Prompts</Label>
                <div className="flex flex-wrap gap-2">
                  {CANNED_PROMPTS.map((prompt) => (
                    <Button
                      key={prompt.value}
                      variant="secondary"
                      onClick={() => handleCannedPromptClick(prompt)}
                      className="px-4 py-2 rounded-full"
                    >
                      {prompt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <Button variant="default" onClick={onClose}>
              Save
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}